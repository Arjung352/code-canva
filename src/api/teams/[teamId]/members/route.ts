import { prisma } from "@/lib/prisma";
export async function DELETE(
  req: Request,
  { params }: { params: { teamId: string } },
) {
  const { userIdToRemove, currentUserId } = await req.json();

  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: currentUserId,
        teamId: params.teamId,
      },
    },
  });

  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId: userIdToRemove,
        teamId: params.teamId,
      },
    },
  });

  return Response.json({ success: true });
}
export async function GET(
  req: Request,
  { params }: { params: { teamId: string } },
) {
  const members = await prisma.teamMember.findMany({
    where: { teamId: params.teamId },
    include: {
      user: true,
    },
  });

  return Response.json(members);
}
