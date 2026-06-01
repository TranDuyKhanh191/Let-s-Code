import { supabase } from "../config/supabase";
import { Course } from "../models/course.model";
import { generateUniqueSlug } from "../utils/uniqueSlug";

const TABLE = "courses";

// Lấy danh sách khóa học theo program
export const getCoursesByProgram = async (programId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, lessons(*)")
    .eq("program_id", programId);

  if (error) throw new Error(error.message);
  return data;
};

// Lấy khóa học theo ID
export const getCourseById = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, lessons(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data;
};
export const getAllCoursesForTeacher = async (teacherId: number) => {
  // 1. Lấy assignments course
  const { data: courseAssigns, error: err1 } = await supabase
    .from("assignments")
    .select("resource_id")
    .eq("teacher_id", teacherId)
    .eq("resource_type", "course")
    .eq("status", "active");

  if (err1) throw new Error(err1.message);

  // 2. Lấy assignments program
  const { data: programAssigns, error: err2 } = await supabase
    .from("assignments")
    .select("resource_id")
    .eq("teacher_id", teacherId)
    .eq("resource_type", "program")
    .eq("status", "active");

  if (err2) throw new Error(err2.message);

  // 3. Gom course_id trực tiếp
  const courseIds = new Set<number>();
  courseAssigns?.forEach(a => courseIds.add(a.resource_id));

  // 4. Gom course_id từ program
  if (programAssigns && programAssigns.length > 0) {
    const programIds = programAssigns.map(a => a.resource_id);

    const { data: coursesFromProgram, error: err3 } = await supabase
      .from("courses")
      .select("id")
      .in("program_id", programIds);

    if (err3) throw new Error(err3.message);

    coursesFromProgram?.forEach(c => courseIds.add(c.id));
  }

  // 5. Query courses
  if (courseIds.size === 0) return [];

  const { data: courses, error: err4 } = await supabase
    .from("courses")
    .select("*, lessons(*)")
    .in("id", Array.from(courseIds));

  if (err4) throw new Error(err4.message);

  return courses;
};

// Tạo khóa học (AUTO SLUG)
export const createCourse = async (body: Course) => {
  // generate slug
  const slug = await generateUniqueSlug(TABLE, body.name);

  const insert = {
    program_id: body.program_id,
    name: body.name,
    slug,
    short_description: body.short_description ?? null,
    age_group: body.age_group ?? null,
    general_objectives: body.general_objectives ?? null,
    lesson_count: 0,
    course_code: body.course_code ?? null,
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

// Update khóa học
export const updateCourse = async (id: number, body: Partial<Course>) => {
  // không cho đổi slug
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

// Ẩn khóa học
export const hideCourse = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Hiện khóa học
export const showCourse = async (id: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "published" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getTeacherCoursesWithPublishedLessonCount = async (
  teacherId: number
) => {
  // Lấy course giáo viên được phân
  const courses = await getAllCoursesForTeacher(teacherId);
  if (courses.length === 0) return [];

  const courseIds = courses.map(c => c.id);

  // Đếm lesson published
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("status", "published")
    .in("course_id", courseIds);

  if (error) throw new Error(error.message);

  // Gom count theo course
  const countMap = new Map<number, number>();
  lessons?.forEach(l => {
    countMap.set(
      l.course_id,
      (countMap.get(l.course_id) ?? 0) + 1
    );
  });

  // Trả kết quả
  return courses.map(course => ({
    id: course.id,
    program_id: course.program_id,
    name: course.name,
    slug: course.slug,
    course_code: course.course_code,
    short_description: course.short_description,
    age_group: course.age_group,
    general_objectives: course.general_objectives,
    status: course.status,
    sort_order: course.sort_order,
    lesson_count: countMap.get(course.id) ?? 0
  }));
};


// Không dùng xóa
export const deleteCourse = async (id: number) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const getStudentEnrolledCourses = async (studentId: number) => {
  // 1. Lấy danh sách ghi danh
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(`
      course_id,
      courses (
        id,
        program_id,
        name,
        slug,
        course_code,
        short_description,
        age_group,
        general_objectives,
        status,
        sort_order
      )
    `)
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);

  const courses = enrollments
    .map(e => e.courses)
    .filter(c => c !== null && !Array.isArray(c));

  const courseIds = courses.map((c: any) => c.id);
  if (courseIds.length === 0) return [];

  // 2. Đếm lesson published
  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("id, course_id")
    .eq("status", "published")
    .in("course_id", courseIds);

  if (lessonError) throw new Error(lessonError.message);

  const lessonCountMap = new Map<number, number>();
  const lessonIds = lessons?.map(l => l.id) || [];
  lessons?.forEach(l => {
    lessonCountMap.set(l.course_id, (lessonCountMap.get(l.course_id) ?? 0) + 1);
  });

  // 3. Tính phần trăm hoàn thành dựa trên lesson_progress
  let completedMap = new Map<number, number>();
  if (lessonIds.length > 0) {
    const { data: progress, error: progError } = await supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("student_id", studentId)
      .eq("status", "đã nộp bài")
      .in("lesson_id", lessonIds);
      
    if (progError) throw new Error(progError.message);
    
    const lessonToCourseMap = new Map<number, number>();
    lessons?.forEach(l => lessonToCourseMap.set(l.id, l.course_id));
    
    progress?.forEach(p => {
      const cId = lessonToCourseMap.get(p.lesson_id);
      if (cId) {
        completedMap.set(cId, (completedMap.get(cId) ?? 0) + 1);
      }
    });
  }

  // 4. Trả kết quả
  return courses.map((c: any) => {
    const totalLessons = lessonCountMap.get(c.id) ?? 0;
    const completed = completedMap.get(c.id) ?? 0;
    const progressPercent = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);
    
    return {
      ...c,
      lesson_count: totalLessons,
      progress: progressPercent
    };
  });
};
