export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[projectId]/eligible-members
 *
 * Fetches all members of the project's parent team who are NOT yet
 * members of this specific project.
 *
 * Source of truth: TeamMember records of the project's teamId.
 * Filtering: Excludes users who already have a ProjectMember record for this projectId.
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Verify the requester is a project member
  const requesterMembership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { project: { select: { teamId: true } } },
  });

  if (!requesterMembership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const teamId = requesterMembership.project.teamId;

  // Fetch all existing project member user IDs for this project
  const existingProjectMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  const existingUserIds = existingProjectMembers.map((m) => m.userId);

  // Query team members from the parent team, excluding users already in this project
  const eligibleTeamMembers = await prisma.teamMember.findMany({
    where: {
      teamId,
      userId: {
        notIn: existingUserIds,
      },
    },
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
    orderBy: {
      createdAt: "asc",
    },
  });

  return Response.json(eligibleTeamMembers);
}

