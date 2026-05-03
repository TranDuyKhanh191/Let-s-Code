import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export const viewOnly = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === "teacher") {
        if (req.method !== "GET") {
            return res.status(403).json({ error: "Giáo viên chỉ có quyền xem." });
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

        const teacherId = req.user?.id;
        const resourceId = Number(req.params[idParam]);

        if (!teacherId) return res.status(401).json({ error: "Không tìm thấy user." });

        try {
            if (resourceType === "program") {
                const allowed = await hasProgramAccess(teacherId, resourceId);
                if (!allowed) {
                    return res.status(403).json({ error: "Bạn không có quyền xem chương trình này." });
                }
                return next();
            }

            if (resourceType === "course") {
                const allowed = await hasCourseAccess(teacherId, resourceId);
                if (!allowed) {
                    return res.status(403).json({ error: "Bạn không có quyền xem khóa học này." });
                }
                return next();
            }

            if (resourceType === "lesson") {
                const allowed = await hasLessonAccess(teacherId, resourceId);
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
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("resource_type", "program")
        .eq("resource_id", programId)
        .eq("status", "active");

    return data && data.length > 0;
}

async function hasCourseAccess(teacherId: number, courseId: number) {
    const { data: direct } = await supabase
        .from("assignments")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("resource_type", "course")
        .eq("resource_id", courseId)
        .eq("status", "active");

    if (direct && direct.length > 0) return true;

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
