/**
 * src/lib/permissions.ts
 *
 * Project-level role permission matrix.
 * All authorization must be validated on the server using this module.
 * Never use this for UI-only gating without a corresponding server check.
 */

export const PROJECT_ROLES = ["PROJECT_LEAD", "DEVELOPER", "REVIEWER", "VIEWER"] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

/**
 * Defines which roles are permitted to perform each action.
 * An empty array means only team-level OWNER/ADMIN can perform it (handled separately).
 */
const ProjectPermissions = {
  /** Can view the project, documents, members, and meeting list */
  VIEW_PROJECT: ["PROJECT_LEAD", "DEVELOPER", "REVIEWER", "VIEWER"] as const,

  /** Can create, edit, or delete documents */
  EDIT_DOCUMENT: ["PROJECT_LEAD", "DEVELOPER"] as const,

  /** Can leave review comments (future: comment threads) */
  REVIEW_DOCUMENT: ["PROJECT_LEAD", "DEVELOPER", "REVIEWER"] as const,

  /** Can create and start a meeting */
  START_MEETING: ["PROJECT_LEAD", "DEVELOPER"] as const,

  /** Can send messages in project or meeting chat */
  SEND_CHAT: ["PROJECT_LEAD", "DEVELOPER", "REVIEWER"] as const,

  /** Can add/remove project members and change their roles */
  MANAGE_MEMBERS: ["PROJECT_LEAD"] as const,

  /** Can rename or archive the project */
  MANAGE_PROJECT: ["PROJECT_LEAD"] as const,
} as const;

export type ProjectPermission = keyof typeof ProjectPermissions;

/**
 * Returns true if the given role is allowed to perform the given permission.
 * Must be called server-side before mutating data.
 *
 * @example
 * if (!hasProjectPermission(member.role, "EDIT_DOCUMENT")) {
 *   return Response.json({ error: "Forbidden" }, { status: 403 });
 * }
 */
export function hasProjectPermission(
  role: ProjectRole,
  permission: ProjectPermission,
): boolean {
  return (ProjectPermissions[permission] as readonly string[]).includes(role);
}

/**
 * Team-level role constants for convenience comparisons.
 */
export const TEAM_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

/**
 * Returns true if the team role can perform team-level admin actions
 * (e.g. delete a project, manage team invites).
 */
export function isTeamAdmin(role: TeamRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

