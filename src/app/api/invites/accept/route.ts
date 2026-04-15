import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user exists in the local database before adding them to a team
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const username = clerkUser.username ?? clerkUser.firstName ?? "User";
    
    await prisma.user.upsert({
      where: { id: userId },
      update: { email, username },
      create: {
        id: userId,
        email,
        username,
        passwordHash: "clerk_auth", // Required by schema
      }
    });

    const { inviteId } = await req.json();

    if (!inviteId) {
      return Response.json({ error: "Missing inviteId" }, { status: 400 });
    }

    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return Response.json({ error: "Invite not found" }, { status: 404 });
    }

    // 🔥 Prevent duplicate member crash
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: invite.teamId,
        },
      },
    });

    if (existingMember) {
      return Response.json({ error: "Already part of team" }, { status: 400 });
    }

    // ✅ Add to team
    await prisma.teamMember.create({
      data: {
        userId,
        teamId: invite.teamId,
        role: invite.role,
      },
    });

    // ✅ Delete invite
    await prisma.teamInvite.delete({
      where: { id: invite.id },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("ACCEPT INVITE ERROR:", err);

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
