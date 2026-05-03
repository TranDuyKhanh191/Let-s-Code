import { supabase } from "../config/supabase";
import { LessonContentInput } from "../validators/lessonContent.validator";

export const createContent = async (lessonId: number, payload: LessonContentInput) => {
  const insert = {
    lesson_id: lessonId,
    title: payload.title,
    subtitle: payload.subtitle ?? null,
    description: payload.description ?? null,
    usage_text: payload.usage_text ?? null,
    example_text: payload.example_text ?? null,
    sort_order: payload.sort_order ?? 0
  };

  const { data, error } = await supabase
    .from("lesson_contents")
    .insert([insert])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateContent = async (id: number, payload: Partial<LessonContentInput>) => {
  const { data, error } = await supabase
    .from("lesson_contents")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteContent = async (id: number) => {
  // xóa mapping media trước
  const { error: delMapErr } = await supabase
    .from("content_media")
    .delete()
    .eq("content_type", "lesson_content")
    .eq("content_id", id);

  if (delMapErr) throw new Error(delMapErr.message);

  const { error } = await supabase
    .from("lesson_contents")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  return true;
};

export const getContentsByLesson = async (lessonId: number) => {
  const { data: contents, error } = await supabase
    .from("lesson_contents")
    .select("id, lesson_id, title, subtitle, description, usage_text, example_text, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const contentIds = contents?.map((c: any) => c.id) || [];
  if (contentIds.length === 0) return contents;

  const { data: mediaMaps, error: mmErr } = await supabase
    .from("content_media")
    .select("id, media_id, content_id, purpose, sort_order, media(*)")
    .eq("content_type", "lesson_content")
    .in("content_id", contentIds)
    .order("sort_order", { ascending: true });

  if (mmErr) throw new Error(mmErr.message);

  const map: Record<number, any[]> = {};
  mediaMaps.forEach((m: any) => {
    if (!map[m.content_id]) map[m.content_id] = [];
    map[m.content_id].push(m);
  });

  return contents.map((c: any) => ({ ...c, media: map[c.id] || [] }));
};

export const reorderContents = async (lessonId: number, order: number[]) => {
  // update sort_order for each id. Use loop or batch if supported.
  for (let i = 0; i < order.length; i++) {
    const id = order[i];
    const { error } = await supabase
      .from("lesson_contents")
      .update({ sort_order: i })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }
  return true;
};
