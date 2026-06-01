import { Request, Response } from "express";
import * as LessonService from "../services/lesson.service";


// Lấy toàn bộ bài giảng
export const getLessonsByCourse = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.courseId);
        const lessons = await LessonService.getLessonsByCourse(courseId);
        res.json({ success: true, lessons });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Lấy bài giảng bằng ID
export const getLessonById = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.params.id);

        const lesson = await LessonService.getLessonById(lessonId);

        res.json({ success: true, lesson });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

// Teacher xem lesson của course được phân công
export const getLessonsForTeacher = async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const courseId = Number(req.params.courseId);

    const lessons = await LessonService.getLessonsForTeacher(
      teacherId,
      courseId
    );

    res.json({
      success: true,
      lessons
    });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
};

// Tạo bài giảng
export const createLesson = async (req: Request, res: Response) => {
    try {
        const lesson = await LessonService.createLesson(req.body);
        res.json({ success: true, lesson });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Cập nhật bài giảng
export const updateLesson = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const lesson = await LessonService.updateLesson(id, req.body);
        res.json({ success: true, lesson });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Ẩn bài giảng
export const hideLesson = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const lesson = await LessonService.hideLesson(id);
        res.json({ success: true, lesson });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Hiện bài giảng
export const showLesson = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const lesson = await LessonService.showLesson(id);
        res.json({ success: true, lesson });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Xóa bài giảng (hiện tại không được phép xóa bài giảng nên chức năng này không được phép sử dụng)
export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await LessonService.deleteLesson(id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ===================== STUDENT ======================

// Học sinh xem bài giảng của khóa học đã đăng ký
export const getLessonsForStudent = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const courseId = Number(req.params.courseId);

        // Kiểm tra xem học sinh có được ghi danh vào khóa học không
        const isEnrolled = await LessonService.isStudentEnrolled(studentId, courseId);
        if (!isEnrolled) {
            return res.status(403).json({ error: "Bạn không có quyền truy cập khóa học này." });
        }

        const lessons = await LessonService.getLessonsByCourseForStudent(studentId, courseId);
        res.json({ success: true, lessons });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Học sinh xem chi tiết 1 bài giảng
export const getLessonByIdForStudent = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const lessonId = Number(req.params.id);

        const lesson = await LessonService.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: "Không tìm thấy bài học." });
        }

        // Kiểm tra xem học sinh có được ghi danh vào khóa học chứa bài học này không
        const isEnrolled = await LessonService.isStudentEnrolled(studentId, lesson.course_id);
        if (!isEnrolled) {
            return res.status(403).json({ error: "Bạn không có quyền truy cập bài học này." });
        }

        const progress = await LessonService.getStudentLessonProgress(studentId, lessonId);

        res.json({ success: true, lesson, progress });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ===================== TEACHER ======================

// Giáo viên / Admin lấy danh sách bài nộp của học sinh
export const getSubmissions = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.params.id);
        const submissions = await LessonService.getSubmissionsForLesson(lessonId);
        res.json({ success: true, data: submissions });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Học sinh nộp bài giảng
export const submitLesson = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const lessonId = Number(req.params.id);
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ error: "Missing fileUrl" });
        }

        const progress = await LessonService.submitLessonProgress(studentId, lessonId, fileUrl);
        res.json({ success: true, progress });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
