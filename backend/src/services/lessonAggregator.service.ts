import { supabase } from "../config/supabase";

export const getFullLesson = async (lessonId: number) => {
  const { data, error } = await supabase.rpc("get_aggregated_lesson", {
    target_lesson_id: lessonId,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data.lesson) {
    return null;
  }

  return data;
};
