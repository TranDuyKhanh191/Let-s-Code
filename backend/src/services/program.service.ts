import { supabase } from "../config/supabase";
import { Program } from "../models/program.model";
import { generateUniqueSlug } from "../utils/uniqueSlug";

const TABLE = "programs";

// Lấy toàn bộ chương trình kèm khóa học
export const getPrograms = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, courses(*)");

  if (error) throw new Error(error.message);
  return data;
};

// Lấy chương trình bằng ID
export const getProgramById = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, courses(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Tạo chương trình (AUTO SLUG)
export const createProgram = async (body: Program) => {
  // Tạo slug unique
  const slug = await generateUniqueSlug(TABLE, body.name);

  const insert = {
    name: body.name,
    slug,
    short_description: body.short_description ?? null,
    status: "draft",
    sort_order: body.sort_order ?? 0
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(insert)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Cập nhật chương trình
export const updateProgram = async (id: number, body: Partial<Program>) => {
  // Không cho update slug để tránh hỏng link
  if ("slug" in body) delete (body as any).slug;

  const { data, error } = await supabase
    .from(TABLE)
    .update(body)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Ẩn chương trình → archived
export const hideProgram = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Hiện chương trình → published
export const showProgram = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "published" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Không dùng xóa
export const deleteProgram = async (id: number) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
};
