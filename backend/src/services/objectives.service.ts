import { supabase } from "../config/supabase";
import { ObjectivesInput } from "../validators/objectives.validator";

export const upsertObjectives = async (lessonId: number, payload: ObjectivesInput) => {
  const { data: existing, error: selErr } = await supabase
    .from("lesson_objectives")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);

  if (existing) {
    const { data, error } = await supabase
      .from("lesson_objectives")
      .update(payload)
      .eq("lesson_id", lessonId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } else {
    const insertPayload = { lesson_id: lessonId, ...payload };
    const { data, error } = await supabase
      .from("lesson_objectives")
      .insert([insertPayload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

export const getObjectives = async (lessonId: number) => {
  const { data, error } = await supabase
    .from("lesson_objectives")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const patchObjectives = async (id: number, payload: Partial<ObjectivesInput>) => {
  const { data, error } = await supabase
    .from("lesson_objectives")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteObjectives = async (id: number) => {
  const { error } = await supabase.from("lesson_objectives").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
};
