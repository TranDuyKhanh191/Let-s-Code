import { z } from "zod";

export const QuizAnswerSchema = z.object({
  id: z.number().optional(), // khi update có id
  answer_text: z.string().min(1),
  is_correct: z.boolean().optional().default(false),
  explanation: z.string().optional().nullable()
});

export const QuizCreateSchema = z.object({
  question_text: z.string().min(1),
  quiz_type: z.enum(["open", "single", "multiple"]),
  sort_order: z.number().int().optional(),
  answers: z.array(QuizAnswerSchema).optional()
});

export const QuizPatchSchema = QuizCreateSchema.partial();

export type QuizCreateInput = z.infer<typeof QuizCreateSchema>;
export type QuizAnswerInput = z.infer<typeof QuizAnswerSchema>;
