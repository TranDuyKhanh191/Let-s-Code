import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export const teacherCanAccessLesson = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user.role === "admin") return next(); // admin full quyền

  const lessonId = Number(req.params.id || req.body.lesson_id);

  // Lấy course của lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("id", lessonId)
    .single();

  if (!lesson) return res.status(404).json({ error: "Lesson không tồn tại" });

  // Kiểm tra giáo viên có quyền xem course này không
  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("teacher_id", user.id)
    .eq("resource_type", "course")
    .eq("resource_id", lesson.course_id)
    .eq("status", "active")
    .single();

  if (!assignment) {
    return res.status(403).json({ error: "Bạn không có quyền xem bài học này" });
  }

  next();
};
