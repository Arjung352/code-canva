import { z } from "zod";

/** Schema for creating a new project within a team */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or fewer"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60, "Slug must be 60 characters or fewer")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/** Schema for updating an existing project */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100)
    .optional(),
  description: z
    .string()
    .max(500)
    .optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/** Schema for adding a member to a project */
export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  role: z.enum(["PROJECT_LEAD", "DEVELOPER", "REVIEWER", "VIEWER"]),
});

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;

/** Schema for changing a project member's role */
export const updateProjectMemberRoleSchema = z.object({
  role: z.enum(["PROJECT_LEAD", "DEVELOPER", "REVIEWER", "VIEWER"]),
});

export type UpdateProjectMemberRoleInput = z.infer<typeof updateProjectMemberRoleSchema>;

