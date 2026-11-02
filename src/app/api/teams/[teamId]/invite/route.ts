export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { inviteTeamMemberSchema } from "@/schemaValidation/teamSchemaValidation";
import { isTeamAdmin } from "@/lib/permissions";

/**
 * POST /api/teams/[teamId]/invite
 *
 * Invites a user to a team by email.
 * Authorization: Only team OWNER or ADMIN can invite new users.
 * Role: Can only invite as ADMIN or MEMBER. OWNER privileges can never be assigned.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    // 🔐 Check permission: only OWNER or ADMIN can invite
    const member = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    if (!member || !isTeamAdmin(member.role)) {
      return Response.json(
        { error: "Forbidden: Only team owners and admins can invite members" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = inviteTeamMemberSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, role } = parsed.data;

    // ❌ Prevent duplicate pending invites for the same team
    const existingInvite = await prisma.teamInvite.findUnique({
      where: {
        email_teamId: {
          email,
          teamId,
        },
      },
    });

    if (existingInvite) {
      return Response.json({ error: "User already invited" }, { status: 400 });
    }

    // ❌ Prevent inviting existing team members
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        user: {
          email,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingMember) {
      return Response.json({ error: "User is already a member of this team" }, { status: 400 });
    }

    // Create the invitation with the chosen role (ADMIN or MEMBER)
    const invite = await prisma.teamInvite.create({
      data: {
        email,
        teamId,
        role,
        invitedBy: userId,
      },
    });

    return Response.json(invite, { status: 201 });
  } catch (err) {
    console.error("Error creating team invite:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
