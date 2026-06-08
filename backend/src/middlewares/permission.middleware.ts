import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export const viewOnly = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === "teacher" || req.user?.role === "student") {
        if (req.method !== "GET") {
            return res.status(403).json({ error: "Bạn chỉ có quyền xem." });
        }
    }
    next();
};

export const checkAccess = (
    resourceType: "program" | "course" | "lesson",
    idParam: string = "id"
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.role === "admin") return next(); // admin always ok

        const userId = req.user?.id;
        const role = req.user?.role;
        const resourceId = Number(req.params[idParam]);

        if (!userId) return res.status(401).json({ error: "Không tìm thấy user." });

        try {
            if (role === "student") {
                if (resourceType === "course") {
                    const allowed = await hasStudentCourseAccess(userId, resourceId);
                    if (!allowed) return res.status(403).json({ error: "Học sinh không có quyền xem khóa học này." });
                    return next();
                }
                if (resourceType === "lesson") {
                    const allowed = await hasStudentLessonAccess(userId, resourceId);
                    if (!allowed) return res.status(403).json({ error: "Học sinh không có quyền xem bài học này." });
                    return next();
                }
                return res.status(403).json({ error: "Học sinh không được phép truy cập." });
            }

            if (resourceType === "program") {
                const allowed = await hasProgramAccess(userId, resourceId);
                if (!allowed) {
                    return res.status(403).json({ error: "Bạn không có quyền xem chương trình này." });
                }
                return next();
            }

            if (resourceType === "course") {
                const allowed = await hasCourseAccess(userId, resourceId);
                if (!allowed) {
                    return res.status(403).json({ error: "Bạn không có quyền xem khóa học này." });
                }
                return next();
            }

            if (resourceType === "lesson") {
                const allowed = await hasLessonAccess(userId, resourceId);
                if (!allowed) {
                    return res.status(403).json({ error: "Bạn không có quyền xem bài học này." });
                }
                return next();
            }

        } catch (err) {
            console.error("checkAccess error:", err);
            return res.status(500).json({ error: "Lỗi server khi kiểm tra quyền." });
        }
    };
};

async function hasProgramAccess(teacherId: number, programId: number) {
    const { data } = await supabase
        .from("assignments")
        .select("id, start_at, end_at")
        .eq("teacher_id", teacherId)
        .eq("resource_type", "program")
        .eq("resource_id", programId)
        .eq("status", "active");

    if (!data || data.length === 0) return false;
    const now = new Date().toISOString();
    return data.some((a: any) => {
        if (a.start_at && a.start_at > now) return false;
        if (a.end_at && a.end_at <= now) return false;
        return true;
    });
}

async function hasCourseAccess(teacherId: number, courseId: number) {
    const { data: direct } = await supabase
        .from("assignments")
        .select("id, start_at, end_at")
        .eq("teacher_id", teacherId)
        .eq("resource_type", "course")
        .eq("resource_id", courseId)
        .eq("status", "active");

    if (direct && direct.length > 0) {
        const now = new Date().toISOString();
        const hasActiveDirect = direct.some((a: any) => {
            if (a.start_at && a.start_at > now) return false;
            if (a.end_at && a.end_at <= now) return false;
            return true;
        });
        if (hasActiveDirect) return true;
    }

    const { data: course } = await supabase
        .from("courses")
        .select("program_id")
        .eq("id", courseId)
        .single();

    if (!course) return false;

    return await hasProgramAccess(teacherId, course.program_id);
}

async function hasLessonAccess(teacherId: number, lessonId: number) {
    const { data: lesson } = await supabase
        .from("lessons")
        .select("course_id")
        .eq("id", lessonId)
        .single();

    if (!lesson) return false;

    return await hasCourseAccess(teacherId, lesson.course_id);
}

// ================== STUDENT CHECKS ==================
async function hasStudentCourseAccess(studentId: number, courseId: number) {
    const { data } = await supabase
        .from("enrollments")
        .select("id, start_at, end_at")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .eq("status", "active")
        .maybeSingle();

    if (!data) return false;
    const now = new Date().toISOString();
    if (data.start_at && data.start_at > now) return false;
    if (data.end_at && data.end_at <= now) return false;
    return true;
}

async function hasStudentLessonAccess(studentId: number, lessonId: number) {
    const { data: lesson } = await supabase
        .from("lessons")
        .select("course_id")
        .eq("id", lessonId)
        .single();

    if (!lesson) return false;

    return await hasStudentCourseAccess(studentId, lesson.course_id);
}
