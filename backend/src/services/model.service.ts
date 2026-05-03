import { supabase } from "../config/supabase";
import { ModelInput } from "../validators/model.validator";

export const createModel = async (lessonId: number, payload: ModelInput) => {
  const { data, error } = await supabase
    .from("lesson_models")
    .insert([{ lesson_id: lessonId, ...payload }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateModel = async (id: number, payload: Partial<ModelInput>) => {
  const { data, error } = await supabase
    .from("lesson_models")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteModel = async (id: number) => {
  const { error } = await supabase
    .from("lesson_models")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
};

// Lấy danh sách models + media
export const getModelsByLesson = async (lessonId: number) => {
  const { data: models, error } = await supabase
    .from("lesson_models")
    .select("id, lesson_id, title, description, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  // lấy media mapping
  const { data: media } = await supabase
    .from("content_media")
    .select("id, media_id, content_id, sort_order, media(*)")
    .eq("content_type", "lesson_model")
    .in("content_id", models?.map((m) => m.id) || []);

  // gắn media vào đúng model
  const map: any = {};
  media?.forEach((m) => {
    if (!map[m.content_id]) map[m.content_id] = [];
    map[m.content_id].push(m);
  });

  return models.map((model) => ({
    ...model,
    media: map[model.id] || [],
  }));
};
