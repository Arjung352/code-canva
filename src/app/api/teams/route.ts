// app/api/teams/route.ts
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user exists in the local database
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
    return Response.json({ error: "Something went wrong", details: String(err) }, { status: 500 });
  }
}

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
