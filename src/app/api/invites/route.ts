import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // get user email from Clerk
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const invites = await prisma.teamInvite.findMany({
    where: {
      email: user?.email,
    },
    include: {
      team: true,
    },
  });

  return Response.json(invites);
}
