import { z } from "zod";

export const AttachmentCreateSchema = z.object({
  media_id: z.number().int(),
  sort_order: z.number().int().optional()
});

export const AttachmentPatchSchema = AttachmentCreateSchema.partial();

export type AttachmentInput = z.infer<typeof AttachmentCreateSchema>;
