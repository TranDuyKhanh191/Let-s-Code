// src/services/build.service.ts
import { supabase } from "../config/supabase";
import { BuildCreateInput } from "../validators/build.validator";

export const createBuild = async (lessonId: number, payload: BuildCreateInput) => {
  const insert = {
    lesson_id: lessonId,
    build_type: payload.build_type,
    sort_order: payload.sort_order ?? 0
  };
  const { data, error } = await supabase
    .from("lesson_builds")
    .insert([insert])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateBuild = async (id: number, payload: Partial<BuildCreateInput>) => {
  const { data, error } = await supabase
    .from("lesson_builds")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteBuild = async (id: number) => {
  // delete content_media mappings pointing to this build (optional)
  const { error: delMapErr } = await supabase
    .from("content_media")
    .delete()
    .eq("content_type", "lesson_build")
    .eq("content_id", id);

  if (delMapErr) throw new Error(delMapErr.message);

  const { error } = await supabase
    .from("lesson_builds")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
};

export const getBuildsByLesson = async (lessonId: number) => {
  const { data: builds, error } = await supabase
    .from("lesson_builds")
    .select("id, lesson_id, build_type, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  // fetch media mappings for these builds
  const buildIds = builds?.map((b: any) => b.id) || [];
  if (buildIds.length === 0) return builds;

  const { data: mediaMaps, error: mmErr } = await supabase
    .from("content_media")
    .select("id, media_id, content_id, purpose, sort_order, media(*)")
    .eq("content_type", "lesson_build")
    .in("content_id", buildIds)
    .order("sort_order", { ascending: true });

  if (mmErr) throw new Error(mmErr.message);

  const map: Record<number, any[]> = {};
  mediaMaps.forEach((m: any) => {
    if (!map[m.content_id]) map[m.content_id] = [];
    map[m.content_id].push(m);
  });

  return builds.map((b: any) => ({ ...b, media: map[b.id] || [] }));
};
