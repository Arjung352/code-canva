export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { isTeamAdmin } from "@/lib/permissions";

/**
 * GET /api/teams/[teamId]/members
 * Returns all members of a team and the requesting user's role.
 * Requires the requesting user to be an authenticated team member.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;

  // Verify the requester is actually a member of this team
  const requesterMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId, teamId },
    },
  });

  if (!requesterMembership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    members,
    currentRole: requesterMembership.role,
  });
}

/**
 * DELETE /api/teams/[teamId]/members
 * Removes a member from the team.
 * Requires the requesting user to be an OWNER or ADMIN.
 * An ADMIN cannot remove an OWNER or another ADMIN.
 * The userId of the requester is taken from Clerk auth — never from the request body.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;
  const body = await req.json();
  const { userIdToRemove } = body as { userIdToRemove: string };

  if (!userIdToRemove) {
    return Response.json({ error: "userIdToRemove is required" }, { status: 400 });
  }

  // Verify requester's membership
  const requesterMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId, teamId },
    },
  });

  if (!requesterMembership || !isTeamAdmin(requesterMembership.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent removing the team owner
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (team?.ownerId === userIdToRemove) {
    return Response.json({ error: "Cannot remove the team owner" }, { status: 400 });
  }

  // Prevent an ADMIN from removing an ADMIN or OWNER
  const targetMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId: userIdToRemove, teamId },
    },
  });

  if (!targetMembership) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  if (targetMembership.role === "OWNER" || (targetMembership.role === "ADMIN" && requesterMembership.role !== "OWNER")) {
    return Response.json(
      { error: "Forbidden: Cannot remove a member with equal or higher privileges" },
      { status: 403 },
    );
  }

  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId: userIdToRemove,
        teamId,
      },
    },
  });

  return Response.json({ success: true });
}
