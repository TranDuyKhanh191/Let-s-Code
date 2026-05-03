import { Router } from "express";
import * as LessonMediaController from "../controllers/lessonMedia.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// Bắt buộc đăng nhập
router.use(authRequired);

// ===================== ADMIN =====================

// Gắn media vào lesson
router.post(
  "/:lessonId",
  requireRole(["admin"]),
  LessonMediaController.attach
);

// Xóa media khỏi lesson
router.delete(
  "/:id",
  requireRole(["admin"]),
  LessonMediaController.remove
);

// Đổi thứ tự hiển thị
router.patch(
  "/:id/order",
  requireRole(["admin"]),
  LessonMediaController.updateOrder
);

// ===================== TEACHER (VIEW ONLY) =====================

// Giáo viên xem media của lesson được phân công
router.get(
  "/:lessonId",
  checkAccess("lesson", "lessonId"),
  viewOnly,
  LessonMediaController.getByLesson
);

export default router;
