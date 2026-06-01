import { Request, Response } from "express";
import * as CourseService from "../services/course.service";

// Lấy toàn bộ khóa học
export const getCoursesByProgram = async (req: Request, res: Response) => {
    try {
        const programId = Number(req.params.programId);
        const courses = await CourseService.getCoursesByProgram(programId);
        res.json({ success: true, courses });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Lấy khóa học bằng ID
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.id);

        const course = await CourseService.getCourseById(courseId);

        res.json({ success: true, course });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};
// Lấy danh sách khóa học của teacher đang đăng nhập
export const getMyCourses = async (req: any, res: Response) => {
  try {
    const user = req.user;

    // 👑 ADMIN: xem full lesson
    if (user.role === "admin") {
      const programId = Number(req.query.programId);
      const courses = await CourseService.getCoursesByProgram(programId);

      return res.json({
        success: true,
        courses
      });
    }

    // 👨‍🏫 TEACHER: chỉ đếm lesson published
    if (user.role === "teacher") {
      const courses =
        await CourseService.getTeacherCoursesWithPublishedLessonCount(
          user.id
        );

      return res.json({
        success: true,
        courses
      });
    }

    // 👨‍🎓 STUDENT: lấy khóa học đã ghi danh
    if (user.role === "student") {
      const courses = await CourseService.getStudentEnrolledCourses(user.id);
      return res.json({
        success: true,
        courses
      });
    }

    return res.status(403).json({ error: "Forbidden" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


// Tạo khóa học
export const createCourse = async (req: Request, res: Response) => {
    try {
        const course = await CourseService.createCourse(req.body);
        res.json({ success: true, course });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Cập nhật khóa học
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const course = await CourseService.updateCourse(id, req.body);
        res.json({ success: true, course });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Ẩn khóa học
export const hideCourse = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const course = await CourseService.hideCourse(id);
        res.json({ success: true, course });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Hiện khóa học
export const showCourse = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const course = await CourseService.showCourse(id);
        res.json({ success: true, course });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};


// Xóa khóa học(hiện tại không được phép xóa khóa học nên chức năng này không được phép sử dụng)
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await CourseService.deleteCourse(id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
