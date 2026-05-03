import { z } from "zod";

export const BuildCreateSchema = z.object({
  build_type: z.enum(["image_set", "pdf"]),
  sort_order: z.number().int().optional()
});

export const BuildPatchSchema = z.object({
  sort_order: z.number().int().optional()
});

export type BuildCreateInput = z.infer<typeof BuildCreateSchema>;
