import { Router } from "express";
import * as CourseController from "../controllers/course.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { viewOnly, checkAccess } from "../middlewares/permission.middleware";

const router = Router();

router.use(authRequired);

// ===================== ADMIN ======================

// Lấy toàn bộ khóa học của một chương trình
router.get(
  "/programs/:programId",
  requireRole(["admin"]),
  CourseController.getCoursesByProgram
);

// Tạo khóa học
router.post(
  "/",
  requireRole(["admin"]),
  CourseController.createCourse
);

// Cập nhật khóa học
router.patch(
  "/:id",
  requireRole(["admin"]),
  CourseController.updateCourse
);

// Ẩn khóa học
router.patch(
  "/:id/hide",
  requireRole(["admin"]),
  CourseController.hideCourse
);

// Hiện khóa học
router.patch(
  "/:id/show",
  requireRole(["admin"]),
  CourseController.showCourse
);

// Không dùng nhưng để lại
router.delete(
  "/:id",
  requireRole(["admin"]),
  CourseController.deleteCourse
);

// ===================== TEACHER ======================
router.get(
  "/me",
  requireRole(["teacher"]),
  CourseController.getMyCourses
);

// Giáo viên xem chi tiết khóa học
router.get(
  "/:id",
  checkAccess("course", "id"),
  viewOnly,
  CourseController.getCourseById
);

export default router;
