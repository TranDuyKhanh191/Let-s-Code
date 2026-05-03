import { supabase } from "../config/supabase";

const BUCKET = "lesson-content";

export const uploadMedia = async (file: Express.Multer.File) => {
  const ext = file.originalname.split(".").pop();
  const random = Math.random().toString(36).substring(2, 10);

  let folder = "files";
  if (file.mimetype.startsWith("image")) folder = "images";
  else if (file.mimetype.startsWith("video")) folder = "videos";
  else if (file.mimetype === "application/pdf") folder = "pdf";

  const fileName = `${Date.now()}-${random}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  // upload
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (uploadErr) throw new Error(uploadErr.message);

  // public url
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  // save db
  const { data, error } = await supabase
    .from("media")
    .insert({
      url: urlData.publicUrl,   // ✅ URL CUỐI
      mime_type: file.mimetype,
      file_size: file.size,
      thumbnail_url: null
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

export const deleteMedia = async (id: number) => {
  const { data: used } = await supabase
    .from("content_media")
    .select("id")
    .eq("media_id", id);

  if (used && used.length > 0) {
    throw new Error("Không thể xóa media vì đang được sử dụng.");
  }

  const { data: media } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .single();

  if (!media) return true;

  // remove storage
  try {
      if (media.url && media.url.includes(BUCKET)) {
          const parts = media.url.split(`/${BUCKET}/`); // Tách chuỗi
          if (parts.length > 1) {
              const storagePath = parts[1]; // Lấy phần path phía sau bucket
              await supabase.storage.from(BUCKET).remove([storagePath]);
          }
      }
  } catch (e) {
      console.warn("Lỗi xóa file storage, tiếp tục xóa DB:", e);
  }

  // Xóa record khỏi Database
  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  return true;
};
