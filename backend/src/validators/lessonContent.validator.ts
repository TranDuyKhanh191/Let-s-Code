import { z } from "zod";

export const LessonContentCreateSchema = z.object({
  title: z.string().min(1, "Title không được rỗng"),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  usage_text: z.string().optional().nullable(),
  example_text: z.string().optional().nullable(),
  sort_order: z.number().int().optional()
});

export const LessonContentPatchSchema = LessonContentCreateSchema.partial();

export type LessonContentInput = z.infer<typeof LessonContentCreateSchema>;
