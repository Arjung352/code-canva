export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/projects/[projectId]/documents — List all documents in a project
 * POST /api/projects/[projectId]/documents — Create a new code document
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasProjectPermission } from "@/lib/permissions";
import { createDocumentSchema } from "@/schemaValidation/documentSchemaValidation";
import * as Y from "yjs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Verify the requester is a project member (any role can view documents)
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = await prisma.codeDocument.findMany({
    where: { projectId },
    select: {
      id: true,
      projectId: true,
      name: true,
      filePath: true,
      language: true,
      lastEditedById: true,
      lastEditedBy: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(documents);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Authorization: Requester must have EDIT_DOCUMENT permission
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !hasProjectPermission(membership.role, "EDIT_DOCUMENT")) {
    return Response.json(
      { error: "Forbidden: You do not have permission to create documents in this project" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = createDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, filePath, language, initialContent } = parsed.data;

  // Check filePath uniqueness within the project
  const existing = await prisma.codeDocument.findUnique({
    where: { projectId_filePath: { projectId, filePath } },
  });

  if (existing) {
    return Response.json(
      { error: "A document with this file path already exists in this project" },
      { status: 400 },
    );
  }

  // If initial content was provided, initialize a Y.Doc and encode state as Uint8Array
  let initialYdocState: Uint8Array<ArrayBuffer> | undefined;
  if (initialContent) {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("monaco");
    ytext.insert(0, initialContent);
    const update = Y.encodeStateAsUpdate(ydoc);
    const ab = new ArrayBuffer(update.byteLength);
    const view = new Uint8Array(ab);
    view.set(update);
    initialYdocState = view;
    ydoc.destroy();
  }

  const doc = await prisma.codeDocument.create({
    data: {
      projectId,
      name,
      filePath,
      language,
      ydocState: initialYdocState,
      lastEditedById: userId,
    },
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

  // Create initial version 1 snapshot if initial content exists
  if (initialContent) {
    await prisma.codeDocumentSnapshot.create({
      data: {
        documentId: doc.id,
        content: initialContent,
        version: 1,
      },
    });
  }

  return Response.json(doc, { status: 201 });
}
