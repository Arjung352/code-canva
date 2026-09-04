export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/teams/route.ts
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// create a team
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug } = await req.json();

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
    console.error("Error creating team:", err);
    return Response.json(
      { error: "Something went wrong", details: String(err) },
      { status: 500 },
    );
  }
}

// delete a team
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    console.log("Deleting team, userId:", userId);

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await req.json();

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.ownerId !== userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return Response.json({ message: "Team deleted" });
  } catch (err) {
    console.error("Error deleting team:", err);
    return Response.json(
      { error: "Something went wrong", details: String(err) },
      { status: 500 },
    );
  }
}

// get all teams for the current user
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: true,
      },
    });

    return Response.json(teams);
  } catch (err) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
