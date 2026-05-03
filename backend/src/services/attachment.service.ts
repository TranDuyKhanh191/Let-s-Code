import { supabase } from "../config/supabase";
import { AttachmentInput } from "../validators/attachment.validator";

export const addAttachment = async (lessonId: number, payload: AttachmentInput) => {
  const insert = {
    media_id: payload.media_id,
    content_type: "lesson_attachment",
    content_id: lessonId,
    purpose: "attachment",
    sort_order: payload.sort_order ?? 0
  };

  const { data, error } = await supabase
    .from("content_media")
    .insert([insert])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const removeAttachment = async (mappingId: number) => {
  const { error } = await supabase
    .from("content_media")
    .delete()
    .eq("id", mappingId);

  if (error) throw new Error(error.message);
  return true;
};

export const getAttachmentsByLesson = async (lessonId: number) => {
  const { data, error } = await supabase
    .from("content_media")
    .select("id, media_id, sort_order, media(*)")
    .eq("content_type", "lesson_attachment")
    .eq("content_id", lessonId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const reorderAttachments = async (lessonId: number, order: number[]) => {
  for (let i = 0; i < order.length; i++) {
    const mappingId = order[i];
    const { error } = await supabase
      .from("content_media")
      .update({ sort_order: i })
      .eq("id", mappingId)
      .eq("content_type", "lesson_attachment");

    if (error) throw new Error(error.message);
  }
  return true;
};
