export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/teams/[teamId]/leave
 *
 * Allows an ADMIN or MEMBER to leave a team.
 * Restrictions:
 * - OWNER is strictly forbidden from leaving. Owners can only delete the team.
 * - Non-members are rejected with 404.
 *
 * Cleanup:
 * - Atomically deletes all ProjectMember records for this user within all projects belonging to the team.
 * - Deletes the user's TeamMember record.
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    // Verify user's membership and check ownership
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
      include: {
        team: {
          select: {
            id: true,
            ownerId: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return Response.json(
        { error: "You are not a member of this team" },
        { status: 404 },
      );
    }

    // Server-side enforcement: Team owners cannot leave their own team
    if (membership.role === "OWNER" || membership.team.ownerId === userId) {
      return Response.json(
        {
          error: "Team owners cannot leave the team. You can only delete the team or transfer ownership.",
        },
        { status: 403 },
      );
    }

    // Atomic transaction: clean up project memberships in this team, then remove team membership
    await prisma.$transaction(async (tx) => {
      // 1. Remove user from all projects in this team
      await tx.projectMember.deleteMany({
        where: {
          userId,
          project: {
            teamId,
          },
        },
      });

      // 2. Remove user from the team
      await tx.teamMember.delete({
        where: {
          id: membership.id,
        },
      });
    });

    return Response.json({
      success: true,
      message: `Successfully left ${membership.team.name}`,
    });
  } catch (err) {
    console.error("Error leaving team:", err);
    return Response.json(
      { error: "Something went wrong while leaving the team" },
      { status: 500 },
    );
  }
}

