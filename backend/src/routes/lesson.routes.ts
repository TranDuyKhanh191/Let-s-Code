import { Router } from "express";
import * as LessonController from "../controllers/lesson.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { viewOnly, checkAccess } from "../middlewares/permission.middleware";

const router = Router();

router.use(authRequired);

// ===================== ADMIN ======================

// Lấy toàn bộ bài giảng của 1 course
router.get(
  "/courses/:courseId",
  requireRole(["admin"]),
  LessonController.getLessonsByCourse
);

// Tạo bài giảng
router.post(
  "/",
  requireRole(["admin"]),
  LessonController.createLesson
);

// Cập nhật bài giảng
router.patch(
  "/:id",
  requireRole(["admin"]),
  LessonController.updateLesson
);

// Ẩn bài giảng
router.patch(
  "/:id/hide",
  requireRole(["admin"]),
  LessonController.hideLesson
);

// Hiện bài giảng
router.patch(
  "/:id/show",
  requireRole(["admin"]),
  LessonController.showLesson
);

// Không dùng nhưng vẫn để đây
router.delete(
  "/:id",
  requireRole(["admin"]),
  LessonController.deleteLesson
);

// ===================== TEACHER (View Only) ======================

router.get(
  "/course/:courseId",
  authRequired,
  requireRole(["teacher"]),
  LessonController.getLessonsForTeacher
);

// Giáo viên xem chi tiết 1 bài giảng
router.get(
  "/:id",
  checkAccess("lesson", "id"),
  viewOnly,
  LessonController.getLessonById
);

export default router;
