import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { teamId: string } },
) {
  const { email } = await req.json();
  const { teamId } = params;

  const invite = await prisma.teamInvite.create({
    data: {
      email,
      teamId,
      role: "MEMBER",
      invitedBy: "CURRENT_USER_ID",
    },
  });

  return Response.json(invite);
}
