export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET   /api/projects/[projectId]/meetings/[meetingId] — Get meeting details
 * PATCH /api/projects/[projectId]/meetings/[meetingId] — Update meeting status (e.g. ENDED)
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasProjectPermission } from "@/lib/permissions";
import { updateMeetingSchema } from "@/schemaValidation/meetingSchemaValidation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; meetingId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, meetingId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !hasProjectPermission(membership.role, "VIEW_PROJECT")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      startedBy: {
        select: { id: true, username: true, email: true, avatarUrl: true },
      },
      participants: {
        where: { leftAt: null },
        include: {
          user: {
            select: { id: true, username: true, email: true, avatarUrl: true },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  if (!meeting || meeting.projectId !== projectId) {
    return Response.json({ error: "Meeting not found" }, { status: 404 });
  }

  return Response.json(meeting);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; meetingId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, meetingId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting || meeting.projectId !== projectId) {
    return Response.json({ error: "Meeting not found" }, { status: 404 });
  }

  // Only meeting creator or a PROJECT_LEAD can end/modify meeting
  const isCreator = meeting.startedById === userId;
  const isLead = membership.role === "PROJECT_LEAD";
  if (!isCreator && !isLead) {
    return Response.json(
      { error: "Forbidden: Only the meeting host or project lead can update this meeting" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = updateMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid status", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updateData: {
    status: "LIVE" | "ENDED" | "CANCELLED";
    endedAt?: Date;
  } = {
    status: parsed.data.status,
  };

  if (parsed.data.status === "ENDED" || parsed.data.status === "CANCELLED") {
    updateData.endedAt = new Date();
  }

  const updatedMeeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: updateData,
  });

  // Mark all active participants as left
  if (parsed.data.status === "ENDED" || parsed.data.status === "CANCELLED") {
    await prisma.meetingParticipant.updateMany({
      where: { meetingId, leftAt: null },
      data: { leftAt: new Date() },
    });
  }

  return Response.json(updatedMeeting);
}

