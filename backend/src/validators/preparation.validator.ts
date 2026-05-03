import { z } from "zod";

export const PreparationSchema = z.object({
  notes: z.string().nullable().optional()
});

export type PreparationInput = z.infer<typeof PreparationSchema>;
