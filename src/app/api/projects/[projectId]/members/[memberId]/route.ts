export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH  /api/projects/[projectId]/members/[memberId]  — Change a member's role
 * DELETE /api/projects/[projectId]/members/[memberId]  — Remove a member from the project
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasProjectPermission } from "@/lib/permissions";
import { updateProjectMemberRoleSchema } from "@/schemaValidation/projectSchemaValidation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, memberId } = await params;

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
  const parsed = updateProjectMemberRoleSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember || targetMember.projectId !== projectId) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  // Prevent any user (including PROJECT_LEAD) from changing their own role
  if (targetMember.userId === userId) {
    return Response.json(
      { error: "You cannot change your own role" },
      { status: 400 },
    );
  }

  // Prevent downgrading the only PROJECT_LEAD
  if (targetMember.role === "PROJECT_LEAD" && parsed.data.role !== "PROJECT_LEAD") {
    const leadCount = await prisma.projectMember.count({
      where: { projectId, role: "PROJECT_LEAD" },
    });

    if (leadCount <= 1) {
      return Response.json(
        { error: "Cannot remove the only PROJECT_LEAD from this project" },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.projectMember.update({
    where: { id: memberId },
    data: { role: parsed.data.role },
    include: {
      user: { select: { id: true, username: true, email: true, avatarUrl: true } },
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, memberId } = await params;

  const requesterMembership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (
    !requesterMembership ||
    !hasProjectPermission(requesterMembership.role, "MANAGE_MEMBERS")
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember || targetMember.projectId !== projectId) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  // Prevent removing the last PROJECT_LEAD
  if (targetMember.role === "PROJECT_LEAD") {
    const leadCount = await prisma.projectMember.count({
      where: { projectId, role: "PROJECT_LEAD" },
    });

    if (leadCount <= 1) {
      return Response.json(
        { error: "Cannot remove the only PROJECT_LEAD from this project" },
        { status: 400 },
      );
    }
  }

  await prisma.projectMember.delete({ where: { id: memberId } });

  return Response.json({ success: true });
}
