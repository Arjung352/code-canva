import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, userId } = await req.json();

  const invite = await prisma.teamInvite.findFirst({
    where: { email },
  });

  if (!invite) {
    return Response.json({ error: "Invalid invite" }, { status: 404 });
  }

  // add user to team
  await prisma.teamMember.create({
    data: {
      userId,
      teamId: invite.teamId,
      role: invite.role,
    },
  });

  // delete invite
  await prisma.teamInvite.delete({
    where: { id: invite.id },
  });

  return Response.json({ success: true });
}
