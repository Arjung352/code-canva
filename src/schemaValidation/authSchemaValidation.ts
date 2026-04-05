import { z } from "zod";
export const userCreateSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  passwordHash: z.string().min(5, "Password must be at least 5 characters"),
  avatarUrl: z.string().url("Invalid URL").optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  passwordHash: z.string().min(5, "Password must be at least 5 characters"),
});
