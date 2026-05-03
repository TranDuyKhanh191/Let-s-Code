import { z } from "zod";

export const ChallengeCreateSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  sort_order: z.number().int().optional()
});

export const ChallengePatchSchema = ChallengeCreateSchema.partial();

export type ChallengeInput = z.infer<typeof ChallengeCreateSchema>;
