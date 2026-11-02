export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/teams/[teamId]/projects  — List all non-archived projects in the team + current user's team role
 * POST /api/teams/[teamId]/projects  — Create a new project (OWNER or ADMIN only)
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { isTeamAdmin } from "@/lib/permissions";
import { createProjectSchema } from "@/schemaValidation/projectSchemaValidation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;

  // Verify requester is a team member
  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const projects = await prisma.project.findMany({
    where: { teamId, isArchived: false },
    include: {
      createdBy: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { members: true, documents: true, meetings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    projects,
    currentRole: membership.role,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;

  // Only team OWNER or ADMIN can create projects
  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  if (!membership || !isTeamAdmin(membership.role)) {
    return Response.json(
      { error: "Forbidden: Only team owners and admins can create projects" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, slug, description } = parsed.data;

  // Check slug uniqueness within the team
  const existing = await prisma.project.findUnique({
    where: { teamId_slug: { teamId, slug } },
  });

  if (existing) {
    return Response.json(
      { error: "A project with this slug already exists in the team" },
      { status: 400 },
    );
  }

  // Create the project and automatically add the creator as PROJECT_LEAD
  const project = await prisma.project.create({
    data: {
      name,
      slug,
      description,
      teamId,
      createdById: userId,
      members: {
        create: {
          userId,
          teamMemberId: membership.id,
          role: "PROJECT_LEAD",
        },
      },
    },
    include: {
      createdBy: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { members: true, documents: true, meetings: true } },
    },
  });

  return Response.json(project, { status: 201 });
}
