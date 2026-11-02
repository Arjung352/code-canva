export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET    /api/projects/[projectId]/members   — List project members
 * POST   /api/projects/[projectId]/members   — Add a team member to the project (PROJECT_LEAD only)
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasProjectPermission } from "@/lib/permissions";
import { addProjectMemberSchema } from "@/schemaValidation/projectSchemaValidation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Verify the requester is a project member
  const requesterMembership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!requesterMembership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, username: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(members);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Verify requester has MANAGE_MEMBERS permission
  const requesterMembership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (
    !requesterMembership ||
    !hasProjectPermission(requesterMembership.role, "MANAGE_MEMBERS")
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = addProjectMemberSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { userId: targetUserId, role } = parsed.data;

  // Verify the target user is a member of the team
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { teamId: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const teamMembership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: targetUserId, teamId: project.teamId } },
  });

  if (!teamMembership) {
    return Response.json(
      { error: "User is not a member of this team" },
      { status: 400 },
    );
  }

  // Prevent duplicate membership
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });

  if (existing) {
    return Response.json(
      { error: "User is already a project member" },
      { status: 400 },
    );
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: targetUserId,
      teamMemberId: teamMembership.id,
      role,
    },
    include: {
      user: { select: { id: true, username: true, email: true, avatarUrl: true } },
    },
  });

  return Response.json(member, { status: 201 });
}

