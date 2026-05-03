import { supabase } from "../config/supabase";
import {
  LessonMediaPurpose,
  AttachLessonMediaInput,
  LessonMedia
} from "../models/lessonMedia.model";

/* ======================================================
   GET MEDIA CỦA LESSON (QUAN TRỌNG NHẤT)
   ====================================================== */
export const getLessonMedia = async (
  lessonId: number
): Promise<LessonMedia[]> => {
  const { data, error } = await supabase
    .from("content_media")
    .select(`
      id,
      purpose,
      sort_order,
      media:media_id!inner (
        id,
        url,
        mime_type,
        file_size,
        duration,
        thumbnail_url
      )
    `)
    .eq("content_type", "lesson_build")
    .eq("content_id", lessonId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    purpose: row.purpose,
    sort_order: row.sort_order,
    media: row.media   // ❗ BÂY GIỜ LÀ OBJECT, KHÔNG PHẢI ARRAY
  }));
};


/* ======================================================
   ATTACH MEDIA VÀO LESSON (AUTO SET PURPOSE CHO VIDEO)
   ====================================================== */
export const attachLessonMedia = async (
  input: AttachLessonMediaInput
): Promise<LessonMedia> => {
  const {
    lessonId,
    mediaId,
    sortOrder = 0,
    purpose
  } = input;

  // 1️⃣ LẤY MIME TYPE MEDIA
  const { data: media, error: mediaErr } = await supabase
    .from("media")
    .select("mime_type")
    .eq("id", mediaId)
    .single();

  if (mediaErr) throw new Error(mediaErr.message);

  // 2️⃣ QUYẾT ĐỊNH PURPOSE
  let finalPurpose: LessonMediaPurpose = LessonMediaPurpose.OTHER;

  // FE có truyền thì tôn trọng
  if (purpose) {
    finalPurpose = purpose;
  }

  // VIDEO → INTRO (KHÔNG ĐỤNG FE)
  if (media.mime_type?.startsWith("video")) {
    finalPurpose = LessonMediaPurpose.INTRO;
  }

  // 3️⃣ INSERT content_media
  const { data, error } = await supabase
    .from("content_media")
    .insert({
      content_type: "lesson_build", // ❗ TRÙNG GET
      content_id: lessonId,
      media_id: mediaId,
      purpose: finalPurpose,
      sort_order: sortOrder
    })
    .select(`
      id,
      purpose,
      sort_order,
      media (
        id,
        url,
        mime_type,
        file_size,
        duration,
        thumbnail_url
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  const row = data as {
    id: number;
    purpose: LessonMediaPurpose;
    sort_order: number;
    media: {
      id: number;
      url: string;
      mime_type: string | null;
      file_size: number | null;
      duration: number | null;
      thumbnail_url: string | null;
    }[];
  };

  return {
    id: row.id,
    purpose: row.purpose,
    sort_order: row.sort_order,
    media: row.media[0]
  };
};

/* ======================================================
   REMOVE MEDIA KHỎI LESSON
   ====================================================== */
export const removeLessonMedia = async (id: number) => {
  const { error } = await supabase
    .from("content_media")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
};

/* ======================================================
   UPDATE SORT ORDER
   ====================================================== */
export const updateLessonMediaOrder = async (
  id: number,
  sortOrder: number
): Promise<LessonMedia> => {
  const { data, error } = await supabase
    .from("content_media")
    .update({ sort_order: sortOrder })
    .eq("id", id)
    .select(`
      id,
      purpose,
      sort_order,
      media (
        id,
        url,
        mime_type,
        file_size,
        duration,
        thumbnail_url
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  const row = data as {
    id: number;
    purpose: LessonMediaPurpose;
    sort_order: number;
    media: {
      id: number;
      url: string;
      mime_type: string | null;
      file_size: number | null;
      duration: number | null;
      thumbnail_url: string | null;
    }[];
  };

  return {
    id: row.id,
    purpose: row.purpose,
    sort_order: row.sort_order,
    media: row.media[0]
  };
};
