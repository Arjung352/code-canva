import { z } from "zod";

/** Schema for creating a new meeting within a project */
export const createMeetingSchema = z.object({
  title: z
    .string()
    .min(1, "Meeting title is required")
    .max(200, "Meeting title must be 200 characters or fewer"),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

/** Schema for updating a meeting's status (start or end) */
export const updateMeetingSchema = z.object({
  status: z.enum(["LIVE", "ENDED", "CANCELLED"]),
});

export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;

