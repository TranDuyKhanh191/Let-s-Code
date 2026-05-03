import { z } from "zod";

export const ObjectivesSchema = z.object({
  knowledge: z.string().nullable().optional(),
  thinking: z.string().nullable().optional(),
  skills: z.string().nullable().optional(),
  attitude: z.string().nullable().optional(),
});

export type ObjectivesInput = z.infer<typeof ObjectivesSchema>;
