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

// Kiểm tra xem học sinh có được ghi danh vào khóa học không
export const isStudentEnrolled = async (studentId: number, courseId: number) => {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
};

// Lấy danh sách bài giảng của khóa học cho học sinh, kèm tiến độ
export const getLessonsByCourseForStudent = async (studentId: number, courseId: number) => {
  // 1. Lấy danh sách bài giảng
  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (lessonError) throw new Error(lessonError.message);
  if (!lessons || lessons.length === 0) return [];

  // 2. Lấy tiến độ của học sinh
  const lessonIds = lessons.map(l => l.id);
  const { data: progresses, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("student_id", studentId)
    .in("lesson_id", lessonIds);

  if (progressError) throw new Error(progressError.message);

  // 3. Map isCompleted
  return lessons.map(lesson => {
    const p = progresses?.find(prog => prog.lesson_id === lesson.id);
    return {
      ...lesson,
      isCompleted: p?.status === "đã nộp bài"
    };
  });
};

// Lấy danh sách bài nộp của học sinh trong 1 bài học (dành cho giáo viên/admin)
export const getSubmissionsForLesson = async (lessonId: number) => {
  // 1. Get course_id of the lesson
  const { data: lesson, error: lessonError } = await supabase.from("lessons").select("course_id").eq("id", lessonId).single();
  if (lessonError) throw new Error(lessonError.message);
  if (!lesson) throw new Error("Không tìm thấy bài học");

  // 2. Lấy danh sách học sinh enroll vào course này
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("student_id, users(id, full_name, email)")
    .eq("course_id", lesson.course_id)
    .eq("status", "active");

  if (enrollError) throw new Error(enrollError.message);
  
  if (!enrollments || enrollments.length === 0) return [];

  // 3. Lấy thông tin lesson_progress của các học sinh này trong lesson hiện tại
  const { data: progresses, error: progressError } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("lesson_id", lessonId);

  if (progressError) throw new Error(progressError.message);

  // 4. Map data lại
  return enrollments.map(en => {
    const student = Array.isArray(en.users) ? en.users[0] : en.users; // fallback for supabase array output
    const progress = progresses?.find(p => p.student_id === en.student_id);
    return {
      student_id: en.student_id,
      studentName: student?.full_name || student?.email?.split('@')[0] || "Unknown",
      email: student?.email || "Unknown",
      status: progress?.status || "chưa học",
      fileName: progress?.submitted_file_url ? progress.submitted_file_url.split('/').pop() : null,
      fileUrl: progress?.submitted_file_url || null,
      score: progress?.score || null,
      updated_at: progress?.updated_at || null,
    };
  });
};

// Học sinh nộp bài tập (cập nhật lesson_progress)
export const submitLessonProgress = async (studentId: number, lessonId: number, fileUrl?: string) => {
  // Check if progress already exists
  const { data: existingProgress, error: fetchError } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  if (existingProgress) {
    // Update
    const { data: updatedProgress, error: updateError } = await supabase
      .from("lesson_progress")
      .update({
        status: "đã nộp bài",
        ...(fileUrl ? { submitted_file_url: fileUrl } : {}),
        updated_at: new Date().toISOString()
      })
      .eq("id", existingProgress.id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);
    return updatedProgress;
  } else {
    // Insert
    const { data: newProgress, error: insertError } = await supabase
      .from("lesson_progress")
      .insert({
        student_id: studentId,
        lesson_id: lessonId,
        status: "đã nộp bài",
        submitted_file_url: fileUrl,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    return newProgress;
  }
};

// Lấy tiến độ của học sinh đối với 1 bài học
export const getStudentLessonProgress = async (studentId: number, lessonId: number) => {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};
