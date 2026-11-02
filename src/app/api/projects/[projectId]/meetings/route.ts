export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/projects/[projectId]/meetings  — List all meetings for a project
 * POST /api/projects/[projectId]/meetings  — Create and start a new meeting
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasProjectPermission } from "@/lib/permissions";
import { createMeetingSchema } from "@/schemaValidation/meetingSchemaValidation";
import { nanoid } from "nanoid";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !hasProjectPermission(membership.role, "VIEW_PROJECT")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const meetings = await prisma.meeting.findMany({
    where: { projectId },
    include: {
      startedBy: {
        select: { id: true, username: true, email: true, avatarUrl: true },
      },
      _count: {
        select: { participants: true, messages: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(meetings);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !hasProjectPermission(membership.role, "START_MEETING")) {
    return Response.json(
      { error: "Forbidden: You do not have permission to start meetings" },
      { status: 403 },
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = { title: "Project Sync" };
  }

  const parsed = createMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid meeting data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Generate unique room name
  const roomName = `codecanvas-${projectId.slice(0, 8)}-${nanoid(8)}`;

  const meeting = await prisma.meeting.create({
    data: {
      projectId,
      title: parsed.data.title,
      roomName,
      status: "LIVE",
      startedById: userId,
      startedAt: new Date(),
      participants: {
        create: {
          userId,
        },
      },
    },
    include: {
      startedBy: {
        select: { id: true, username: true, email: true, avatarUrl: true },
      },
      _count: {
        select: { participants: true },
      },
    },
  });

  return Response.json(meeting, { status: 201 });
}

