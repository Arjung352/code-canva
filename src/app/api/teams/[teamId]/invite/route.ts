import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    const { teamId } = await params;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // 🔐 Check permission (only OWNER or ADMIN can invite)
    const member = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    // ❌ Prevent duplicate invites
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

    // ❌ Prevent inviting existing members
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
      return Response.json({ error: "User already in team" }, { status: 400 });
    }

    const invite = await prisma.teamInvite.create({
      data: {
        email,
        teamId,
        role: "MEMBER",
        invitedBy: userId,
      },
    });

    return Response.json(invite);
  } catch (err) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
