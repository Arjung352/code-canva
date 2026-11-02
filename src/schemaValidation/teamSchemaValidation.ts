import { z } from "zod";

/**
 * Schema for inviting a member to a team.
 * Only ADMIN and MEMBER roles can be assigned.
 * OWNER privileges can never be granted via invitation.
 */
export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;

