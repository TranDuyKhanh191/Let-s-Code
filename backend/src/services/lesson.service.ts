import { supabase } from "../config/supabase";
import { Lesson } from "../models/lesson.model";
import { generateUniqueSlug } from "../utils/uniqueSlug";

const TABLE = "lessons";

// Lấy bài giảng theo khóa học
export const getLessonsByCourse = async (courseId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// Lấy bài giảng theo ID
export const getLessonById = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Lấy lesson theo course nhưng kiểm tra quyền teacher qua assignments
export const getLessonsForTeacher = async (
  teacherId: number,
  courseId: number
) => {
  // 1. Kiểm tra teacher có quyền course này không
  const { data: directAssign, error: err1 } = await supabase
    .from("assignments")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("resource_type", "course")
    .eq("resource_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (err1) throw new Error(err1.message);

  let hasAccess = !!directAssign;

  // 2. Nếu không có assignment course → check program
  if (!hasAccess) {
    const { data: course, error: err2 } = await supabase
      .from("courses")
      .select("program_id")
      .eq("id", courseId)
      .single();

    if (err2) throw new Error(err2.message);

    const { data: programAssign, error: err3 } = await supabase
      .from("assignments")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("resource_type", "program")
      .eq("resource_id", course.program_id)
      .eq("status", "active")
      .maybeSingle();

    if (err3) throw new Error(err3.message);

    hasAccess = !!programAssign;
  }

  if (!hasAccess) {
    throw new Error("You do not have access to this course");
  }

  // 3. Có quyền → lấy lesson
  const { data: lessons, error: err4 } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (err4) throw new Error(err4.message);

  return lessons;
};

// Tạo bài giảng (AUTO SLUG)
export const createLesson = async (body: Lesson) => {
  // Tạo slug unique cho lesson
  const slug = await generateUniqueSlug(TABLE, body.title);

  const insert = {
    course_id: body.course_id,
    title: body.title,
    subtitle: body.subtitle ?? null,
    slug,
    overview: body.overview ?? null,
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

// Cập nhật bài giảng
export const updateLesson = async (id: number, body: Partial<Lesson>) => {
  // Không cho update slug
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

// Ẩn bài giảng
export const hideLesson = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Hiện bài giảng
export const showLesson = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "published" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Xóa bài giảng (không khuyến khích)
export const deleteLesson = async (id: number) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
};
