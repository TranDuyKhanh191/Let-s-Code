import { z } from "zod";

export const ModelSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  sort_order: z.number().optional()
});

export type ModelInput = z.infer<typeof ModelSchema>;
