// app/api/teams/route.ts
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, slug, userId } = await req.json();

    if (!name || !slug) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // check slug uniqueness
    const existing = await prisma.team.findUnique({
      where: { slug },
    });

    if (existing) {
      return Response.json({ error: "Slug already taken" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    return Response.json(team);
  } catch (err) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const userId = "CURRENT_USER"; // replace with auth later

  const teams = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: true,
    },
  });

  return Response.json(teams);
}
