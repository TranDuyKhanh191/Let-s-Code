import { supabase } from "../config/supabase";
import { ChallengeInput } from "../validators/challenge.validator";

export const createChallenge = async (lessonId: number, payload: ChallengeInput) => {
  const insert = {
    lesson_id: lessonId,
    title: payload.title,
    subtitle: payload.subtitle ?? null,
    description: payload.description ?? null,
    instructions: payload.instructions ?? null,
    sort_order: payload.sort_order ?? 0
  };

  const { data, error } = await supabase
    .from("lesson_challenges")
    .insert([insert])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateChallenge = async (id: number, payload: Partial<ChallengeInput>) => {
  const { data, error } = await supabase
    .from("lesson_challenges")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteChallenge = async (id: number) => {
  // remove media mapping first
  const { error: delMapErr } = await supabase
    .from("content_media")
    .delete()
    .eq("content_type", "lesson_challenge")
    .eq("content_id", id);

  if (delMapErr) throw new Error(delMapErr.message);

  const { error } = await supabase
    .from("lesson_challenges")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  return true;
};

export const getChallengesByLesson = async (lessonId: number) => {
  const { data: challenges, error } = await supabase
    .from("lesson_challenges")
    .select("id, lesson_id, title, subtitle, description, instructions, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const ids = challenges?.map((c: any) => c.id) || [];
  if (ids.length === 0) return challenges;

  const { data: mediaMaps, error: mmErr } = await supabase
    .from("content_media")
    .select("id, media_id, content_id, purpose, sort_order, media(*)")
    .eq("content_type", "lesson_challenge")
    .in("content_id", ids)
    .order("sort_order", { ascending: true });

  if (mmErr) throw new Error(mmErr.message);

  const map: Record<number, any[]> = {};
  mediaMaps.forEach((m: any) => {
    if (!map[m.content_id]) map[m.content_id] = [];
    map[m.content_id].push(m);
  });

  return challenges.map((c: any) => ({ ...c, media: map[c.id] || [] }));
};
