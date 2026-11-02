export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET   /api/projects/[projectId]   — Get project details
 * PATCH /api/projects/[projectId]   — Update project (PROJECT_LEAD only)
 * DELETE /api/projects/[projectId]  — Archive project (team OWNER/ADMIN only)
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasProjectPermission, isTeamAdmin } from "@/lib/permissions";
import { updateProjectSchema } from "@/schemaValidation/projectSchemaValidation";

async function resolveAccess(userId: string, projectId: string) {
  const projectMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: {
      teamMember: { select: { role: true, teamId: true } },
    },
  });
  return projectMember;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const access = await resolveAccess(userId, projectId);

  if (!access) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { members: true, documents: true, meetings: true } },
    },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json({ project, myRole: access.role });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const access = await resolveAccess(userId, projectId);

  if (!access || !hasProjectPermission(access.role, "MANAGE_PROJECT")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: parsed.data,
  });

  return Response.json(project);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Archive/delete requires team OWNER or ADMIN — not just a project role
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { teamId: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const teamMember = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId: project.teamId } },
  });

  if (!teamMember || !isTeamAdmin(teamMember.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft delete — archive instead of hard delete to preserve data
  await prisma.project.update({
    where: { id: projectId },
    data: { isArchived: true },
  });

  return Response.json({ success: true });
}

