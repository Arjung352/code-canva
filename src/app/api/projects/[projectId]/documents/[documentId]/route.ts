export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET    /api/projects/[projectId]/documents/[documentId] — Get document state & metadata
 * PATCH  /api/projects/[projectId]/documents/[documentId] — Update metadata or persist Yjs state
 * DELETE /api/projects/[projectId]/documents/[documentId] — Delete document
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasProjectPermission } from "@/lib/permissions";
import {
  updateDocumentSchema,
  persistDocumentStateSchema,
} from "@/schemaValidation/documentSchemaValidation";
import * as Y from "yjs";

/**
 * Persist document Yjs state and versioned snapshot concurrency-safely in PostgreSQL.
 *
 * Concurrency strategy:
 * 1. PostgreSQL row-level lock: `SELECT id FROM "CodeDocument" WHERE id = $1 FOR UPDATE`
 *    serializes concurrent updates to the same document at the database level.
 * 2. CRDT Merge: Merges existing `ydocState` with the incoming update via `Y.mergeUpdates`
 *    to prevent concurrent edits from collaborators from silently overwriting newer content.
 * 3. Content deduplication: Only creates a new snapshot if the content has actually changed.
 * 4. Monotonic versioning: Calculates `nextVersion = (latestSnapshot?.version ?? 0) + 1`
 *    inside the locked transaction, completely eliminating race conditions on `CodeDocumentSnapshot_documentId_version_key`.
 * 5. Atomicity: Document update and snapshot creation run within the same interactive transaction.
 * 6. Bounded retries: Retries on transient serialization conflicts or deadlocks with exponential backoff and jitter.
 */
async function persistDocumentStateWithRetry({
  documentId,
  userId,
  binaryBuffer,
  content,
  maxRetries = 3,
}: {
  documentId: string;
  userId: string;
  binaryBuffer: Uint8Array;
  content?: string;
  maxRetries?: number;
}): Promise<{ updatedAt: Date; version?: number | null }> {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      return await prisma.$transaction(
        async (tx) => {
          // 1. Acquire exclusive row lock on the CodeDocument in PostgreSQL
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
              // If merge fails, fall back to incoming update
              mergedState = binaryBuffer;
            }
          }

          const ab = new ArrayBuffer(mergedState.byteLength);
          const finalBuffer = new Uint8Array(ab);
          finalBuffer.set(mergedState);

          // 3. Atomically update the document row
          const updated = await tx.codeDocument.update({
            where: { id: documentId },
            data: {
              ydocState: finalBuffer,
              lastEditedById: userId,
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
        // Exponential backoff with jitter (50ms * 2^attempt + jitter)
        const backoff = 50 * Math.pow(2, attempt) + Math.random() * 50;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to persist document state after maximum retries");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, documentId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const document = await prisma.codeDocument.findUnique({
    where: { id: documentId },
    include: {
      lastEditedBy: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!document || document.projectId !== projectId) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  // Convert binary ydocState to base64 for transmission
  const base64YdocState = document.ydocState
    ? Buffer.from(document.ydocState).toString("base64")
    : null;

  // Extract plain text from Yjs state for preview if available
  let textContent = "";
  if (document.ydocState) {
    try {
      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, new Uint8Array(document.ydocState));
      textContent = ydoc.getText("monaco").toString();
      ydoc.destroy();
    } catch (e) {
      console.error("Failed to decode Yjs state into text:", e);
    }
  }

  return Response.json({
    document: {
      id: document.id,
      projectId: document.projectId,
      name: document.name,
      filePath: document.filePath,
      language: document.language,
      ydocState: base64YdocState,
      content: textContent,
      lastEditedBy: document.lastEditedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    },
    canEdit: hasProjectPermission(membership.role, "EDIT_DOCUMENT"),
    userRole: membership.role,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, documentId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !hasProjectPermission(membership.role, "EDIT_DOCUMENT")) {
    return Response.json(
      { error: "Forbidden: You do not have permission to edit documents in this project" },
      { status: 403 },
    );
  }

  const body = await req.json();

  // Check if this is a state persistence request
  if (body.ydocState) {
    const parsedState = persistDocumentStateSchema.safeParse(body);
    if (!parsedState.success) {
      return Response.json(
        { error: "Invalid state payload", details: parsedState.error.flatten() },
        { status: 400 },
      );
    }

    const raw = Buffer.from(parsedState.data.ydocState, "base64");
    const ab = new ArrayBuffer(raw.byteLength);
    const binaryBuffer = new Uint8Array(ab);
    binaryBuffer.set(raw);

    const result = await persistDocumentStateWithRetry({
      documentId,
      userId,
      binaryBuffer,
      content: parsedState.data.content,
    });

    return Response.json({ success: true, updatedAt: result.updatedAt });
  }

  // Otherwise, it's a metadata update
  const parsedMeta = updateDocumentSchema.safeParse(body);
  if (!parsedMeta.success) {
    return Response.json(
      { error: "Invalid input", details: parsedMeta.error.flatten() },
      { status: 400 },
    );
  }

  const updatedDoc = await prisma.codeDocument.update({
    where: { id: documentId },
    data: parsedMeta.data,
  });

  return Response.json(updatedDoc);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, documentId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !hasProjectPermission(membership.role, "EDIT_DOCUMENT")) {
    return Response.json(
      { error: "Forbidden: You do not have permission to delete documents in this project" },
      { status: 403 },
    );
  }

  await prisma.codeDocument.delete({
    where: { id: documentId },
  });

  return Response.json({ success: true });
}
