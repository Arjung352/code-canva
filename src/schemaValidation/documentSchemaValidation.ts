import { z } from "zod";

/** Schema for creating a new code document within a project */
export const createDocumentSchema = z.object({
  name: z
    .string()
    .min(1, "Document name is required")
    .max(200, "Document name must be 200 characters or fewer"),
  filePath: z
    .string()
    .min(1, "File path is required")
    .max(500, "File path must be 500 characters or fewer"),
  language: z
    .string()
    .min(1, "Language is required")
    .default("plaintext"),
  initialContent: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

/** Schema for updating document metadata */
export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  language: z.string().min(1).optional(),
  filePath: z.string().min(1).max(500).optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

/** Schema for persisting Yjs binary state back to the database */
export const persistDocumentStateSchema = z.object({
  ydocState: z.string().describe("Base64-encoded Yjs binary update document state"),
  content: z.string().optional().describe("Plain text content for search and snapshots"),
});

export type PersistDocumentStateInput = z.infer<typeof persistDocumentStateSchema>;
