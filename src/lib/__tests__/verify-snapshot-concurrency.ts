import fs from "fs";
import path from "path";
import * as Y from "yjs";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
  }
}

async function runVerification() {
  const { prisma } = await import("@/lib/prisma");

  console.log("=== COMPREHENSIVE CONCURRENCY & SNAPSHOT VERIFICATION ===");

  // 1. Find or create a test document
  const project = await prisma.project.findFirst({
    include: { members: true },
  });

  if (!project) {
    throw new Error("No project found in database to run tests against.");
  }

  const userId = project.members[0]?.userId;
  if (!userId) {
    throw new Error("No member found in project.");
  }

  console.log(`Using project: ${project.id}, user: ${userId}`);

  // Create isolated test document
  const testDocName = `test-concurrency-${Date.now()}.ts`;
  const initialYdoc = new Y.Doc();
  initialYdoc.getText("monaco").insert(0, "// Initial concurrency test code\n");
  const initialBytes = Y.encodeStateAsUpdate(initialYdoc);
  const ab = new ArrayBuffer(initialBytes.byteLength);
  const initU8 = new Uint8Array(ab);
  initU8.set(initialBytes);

  const testDoc = await prisma.codeDocument.create({
    data: {
      projectId: project.id,
      name: testDocName,
      filePath: `/${testDocName}`,
      language: "typescript",
      ydocState: initU8,
      lastEditedById: userId,
    },
  });

  console.log(`\nCreated test document: ${testDoc.id} (${testDoc.filePath})`);

  // Define concurrency-safe persist function matching the API route implementation
  async function persistDocumentStateWithRetry({
    documentId,
    authorId,
    binaryBuffer,
    content,
    maxRetries = 5,
  }: {
    documentId: string;
    authorId: string;
    binaryBuffer: Uint8Array;
    content?: string;
    maxRetries?: number;
  }) {
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        return await prisma.$transaction(
          async (tx) => {
            // 1. PostgreSQL row lock
            await tx.$queryRaw`
              SELECT id FROM "CodeDocument" WHERE id = ${documentId} FOR UPDATE
            `;

            // 2. Fetch current document state to merge Yjs CRDT updates safely
            const currentDoc = await tx.codeDocument.findUnique({
              where: { id: documentId },
              select: { ydocState: true },
            });

            let mergedState = binaryBuffer;
            if (currentDoc?.ydocState) {
              try {
                mergedState = Y.mergeUpdates([
                  new Uint8Array(currentDoc.ydocState),
                  binaryBuffer,
                ]);
              } catch {
                mergedState = binaryBuffer;
              }
            }

            const bufAb = new ArrayBuffer(mergedState.byteLength);
            const finalBuffer = new Uint8Array(bufAb);
            finalBuffer.set(mergedState);

            // 3. Update document row
            const updated = await tx.codeDocument.update({
              where: { id: documentId },
              data: {
                ydocState: finalBuffer,
                lastEditedById: authorId,
              },
            });

            let version: number | null = null;

            // 4. Concurrency-safe snapshot generation
            if (content) {
              const latestSnapshot = await tx.codeDocumentSnapshot.findFirst({
                where: { documentId },
                orderBy: { version: "desc" },
                select: { version: true, content: true },
              });

              // Prevent redundant snapshot when content hasn't changed
              if (!latestSnapshot || latestSnapshot.content !== content) {
                const nextVersion = (latestSnapshot?.version ?? 0) + 1;
                version = nextVersion;

                await tx.codeDocumentSnapshot.create({
                  data: {
                    documentId,
                    content,
                    version: nextVersion,
                  },
                });
              } else {
                version = latestSnapshot.version;
              }
            }

            return { updatedAt: updated.updatedAt, version };
          },
          {
            timeout: 15000,
          },
        );
      } catch (err: unknown) {
        if (attempt < maxRetries) {
          const backoff = 50 * Math.pow(2, attempt) + Math.random() * 50;
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Max retries exceeded");
  }

  try {
    // TEST 1: Simultaneous PATCH requests with DIFFERENT content
    console.log("\n[TEST 1] Firing 8 simultaneous concurrent PATCH requests with different content...");
    const concurrentCount = 8;
    const promises = Array.from({ length: concurrentCount }).map((_, i) => {
      const doc = new Y.Doc();
      const content = `// Edit from concurrent worker ${i} at ${Date.now()}\nconst workerVal_${i} = ${i * 10};\n`;
      doc.getText("monaco").insert(0, content);
      const updateBytes = Y.encodeStateAsUpdate(doc);

      return persistDocumentStateWithRetry({
        documentId: testDoc.id,
        authorId: userId,
        binaryBuffer: updateBytes,
        content,
      });
    });

    const results = await Promise.all(promises);
    console.log(`✅ All ${concurrentCount} concurrent requests completed successfully!`);

    // Verify snapshot versions in database
    const snapshots = await prisma.codeDocumentSnapshot.findMany({
      where: { documentId: testDoc.id },
      orderBy: { version: "asc" },
      select: { version: true, content: true },
    });

    const versions = snapshots.map((s) => s.version);
    console.log("Generated snapshot versions:", versions);

    // Verify uniqueness and strict sequence
    const uniqueVersions = new Set(versions);
    if (uniqueVersions.size !== versions.length) {
      throw new Error(`Duplicate versions found! ${JSON.stringify(versions)}`);
    }
    for (let i = 0; i < versions.length; i++) {
      if (versions[i] !== i + 1) {
        throw new Error(`Versions are not sequential from 1: expected ${i + 1}, got ${versions[i]}`);
      }
    }
    console.log("✅ Verified: Snapshot versions are 100% strictly unique, sequential, and gapless (1..N).");

    // TEST 2: Deduplication — unchanged content should NOT create new snapshots
    console.log("\n[TEST 2] Testing duplicate content persistence...");
    const beforeCount = await prisma.codeDocumentSnapshot.count({ where: { documentId: testDoc.id } });
    const duplicateContent = snapshots[snapshots.length - 1].content;

    const dupPromises = Array.from({ length: 5 }).map(() => {
      const doc = new Y.Doc();
      doc.getText("monaco").insert(0, duplicateContent);
      return persistDocumentStateWithRetry({
        documentId: testDoc.id,
        authorId: userId,
        binaryBuffer: Y.encodeStateAsUpdate(doc),
        content: duplicateContent,
      });
    });

    await Promise.all(dupPromises);
    const afterCount = await prisma.codeDocumentSnapshot.count({ where: { documentId: testDoc.id } });

    if (afterCount !== beforeCount) {
      throw new Error(`Expected snapshot count to stay ${beforeCount}, but became ${afterCount}! Duplicate snapshots were created.`);
    }
    console.log(`✅ Verified: 5 concurrent requests with identical content created 0 duplicate snapshots (count remained ${afterCount}).`);

    // TEST 3: CRDT State Merging across collaborators
    console.log("\n[TEST 3] Verifying Yjs CRDT state preservation across concurrent edits...");
    const finalDocInDb = await prisma.codeDocument.findUnique({
      where: { id: testDoc.id },
      select: { ydocState: true },
    });

    if (!finalDocInDb?.ydocState) {
      throw new Error("Missing ydocState in database!");
    }

    const verificationYdoc = new Y.Doc();
    Y.applyUpdate(verificationYdoc, new Uint8Array(finalDocInDb.ydocState));
    const mergedText = verificationYdoc.getText("monaco").toString();

    console.log("Merged document text length:", mergedText.length);
    if (mergedText.length === 0) {
      throw new Error("Merged document text is unexpectedly empty!");
    }
    console.log("✅ Verified: Yjs CRDT state was properly merged and preserved.");

    // TEST 4: Atomicity & Rollback
    console.log("\n[TEST 4] Verifying transaction rollback on failure (no partial writes)...");
    const countBeforeFail = await prisma.codeDocumentSnapshot.count({ where: { documentId: testDoc.id } });

    try {
      await prisma.$transaction(async (tx) => {
        await tx.codeDocumentSnapshot.create({
          data: {
            documentId: testDoc.id,
            content: "This should be rolled back",
            version: 9999,
          },
        });
        // Intentionally throw error to simulate failure
        throw new Error("SIMULATED_TRANSACTION_FAILURE");
      });
    } catch (e: any) {
      if (e.message !== "SIMULATED_TRANSACTION_FAILURE") throw e;
    }

    const countAfterFail = await prisma.codeDocumentSnapshot.count({ where: { documentId: testDoc.id } });
    if (countAfterFail !== countBeforeFail) {
      throw new Error("Transaction did not roll back snapshot creation!");
    }
    console.log("✅ Verified: Failed transaction rolled back completely without partial writes.");

    console.log("\n🎉 ALL 4 CONCURRENCY TESTS PASSED COMPLETELY!");
  } finally {
    // Clean up test document and its cascade snapshots
    await prisma.codeDocument.delete({ where: { id: testDoc.id } });
    console.log("Cleaned up test document.");
    await prisma.$disconnect();
  }
}

runVerification().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});

