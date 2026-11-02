export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/projects/[projectId]/meetings/[meetingId]/token
 * Generates a signed LiveKit JWT token for the authenticated user to join the video room.
 * Validates project membership server-side.
 */

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { hasProjectPermission } from "@/lib/permissions";
import { createLiveKitToken, getLiveKitUrl } from "@/lib/livekit";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; meetingId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const userName =
    clerkUser?.username ||
    clerkUser?.firstName ||
    `User-${userId.slice(-4)}`;

  const { projectId, meetingId } = await params;

  // 1. Verify project membership
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !hasProjectPermission(membership.role, "VIEW_PROJECT")) {
    return Response.json(
      { error: "Forbidden: You are not a member of this project" },
      { status: 403 },
    );
  }

  // 2. Verify meeting exists and belongs to this project
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting || meeting.projectId !== projectId) {
    return Response.json({ error: "Meeting not found" }, { status: 404 });
  }

  if (meeting.status === "ENDED" || meeting.status === "CANCELLED") {
    return Response.json(
      { error: "This meeting has already ended" },
      { status: 410 },
    );
  }

  // 3. Permission checks: VIEWER can join as listener/observer (cannot publish audio/video)
  const canPublish = membership.role !== "VIEWER";

  // 4. Generate LiveKit token
  const token = await createLiveKitToken({
    roomName: meeting.roomName,
    userId,
    userName,
    canPublish,
    canSubscribe: true,
  });

  // 5. Track participant in database (find existing active or create new)
  const existingParticipant = await prisma.meetingParticipant.findFirst({
    where: { meetingId, userId, leftAt: null },
  });

  if (!existingParticipant) {
    await prisma.meetingParticipant.create({
      data: {
        meetingId,
        userId,
      },
    });
  }

  return Response.json({
    token,
    serverUrl: getLiveKitUrl(),
    roomName: meeting.roomName,
    meetingId: meeting.id,
    title: meeting.title,
    canPublish,
  });
}

