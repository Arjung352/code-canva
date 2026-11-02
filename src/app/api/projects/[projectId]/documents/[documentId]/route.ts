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

    const updated = await prisma.codeDocument.update({
      where: { id: documentId },
      data: {
        ydocState: binaryBuffer,
        lastEditedById: userId,
      },
    });

    // Optionally create a snapshot if content is provided
    if (parsedState.data.content) {
      const latestSnapshot = await prisma.codeDocumentSnapshot.findFirst({
        where: { documentId },
        orderBy: { version: "desc" },
      });
      const nextVersion = (latestSnapshot?.version ?? 0) + 1;

      await prisma.codeDocumentSnapshot.create({
        data: {
          documentId,
          content: parsedState.data.content,
          version: nextVersion,
        },
      });
    }

    return Response.json({ success: true, updatedAt: updated.updatedAt });
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
