import { supabase } from "../config/supabase";
import { PreparationInput } from "../validators/preparation.validator";

export const upsertPreparation = async (lessonId: number, payload: PreparationInput) => {
  const { data: existing, error: selErr } = await supabase
    .from("lesson_preparation")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);

  if (existing) {
    const { data, error } = await supabase
      .from("lesson_preparation")
      .update(payload)
      .eq("lesson_id", lessonId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from("lesson_preparation")
    .insert([{ lesson_id: lessonId, ...payload }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getPreparation = async (lessonId: number) => {
  const { data, error } = await supabase
    .from("lesson_preparation")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
};

export const patchPreparation = async (id: number, payload: Partial<PreparationInput>) => {
  const { data, error } = await supabase
    .from("lesson_preparation")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deletePreparation = async (id: number) => {
  const { error } = await supabase
    .from("lesson_preparation")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
};
