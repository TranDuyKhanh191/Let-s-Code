import { supabase } from "../config/supabase";

/** Validate bài học trước khi publish */
export const validateLessonBeforePublish = async (lessonId: number) => {
  // lấy lesson
  const { data: lesson, error: lErr } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (lErr) throw new Error(lErr.message);

  if (!lesson.title || !lesson.overview) {
    throw new Error("Lesson thiếu title hoặc overview");
  }

  // kiểm tra objectives
  const { data: objectives } = await supabase
    .from("lesson_objectives")
    .select("id")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!objectives) {
    throw new Error("Lesson thiếu mục tiêu học tập (Objectives)");
  }

  // kiểm tra nội dung
  const { data: contents } = await supabase
    .from("lesson_contents")
    .select("id")
    .eq("lesson_id", lessonId);

  const { data: models } = await supabase
    .from("lesson_models")
    .select("id")
    .eq("lesson_id", lessonId);

  const { data: builds } = await supabase
    .from("lesson_builds")
    .select("id")
    .eq("lesson_id", lessonId);

    if (
    (contents ?? []).length === 0 &&
    (models ?? []).length === 0 &&
    (builds ?? []).length === 0
    ) {
        throw new Error("Lesson phải có ít nhất 1 nội dung (Content/Model/Build)");
    }

  return true;
};

/** Update status chung */
export const setStatus = async (lessonId: number, status: string) => {
  const { data, error } = await supabase
    .from("lessons")
    .update({ status })
    .eq("id", lessonId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};
