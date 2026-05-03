import { Router } from "express";
import * as ContentController from "../controllers/lessonContent.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// Tất cả user đều phải đăng nhập
router.use(authRequired);

// ====================== ADMIN ======================

// Tạo nội dung mới
router.post(
  "/:id",
  requireRole(["admin"]),
  ContentController.create
);

// Cập nhật nội dung
router.patch(
  "/:id",
  requireRole(["admin"]),
  ContentController.update
);

// Xóa nội dung
router.delete(
  "/:id",
  requireRole(["admin"]),
  ContentController.remove
);

// Reorder nội dung trong bài học
router.post(
  "/:id/reorder",
  requireRole(["admin"]),
  ContentController.reorder
);

// ====================== TEACHER (VIEW ONLY) ======================

// Giáo viên chỉ xem được nội dung bài học mà họ có quyền
router.get(
  "/:id",
  checkAccess("lesson", "id"),
  viewOnly,
  ContentController.getByLesson
);

export default router;
