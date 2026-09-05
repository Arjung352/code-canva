export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Fetch the user and their invites from the database
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
