import { Router } from "express";
import * as ObjectivesController from "../controllers/objectives.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// ================== TẤT CẢ PHẢI ĐĂNG NHẬP ==================
router.use(authRequired);

// ================== ADMIN ==================
// Admin mới được tạo / sửa / xóa
router.post(
  "/:id",
  requireRole(["admin"]),
  ObjectivesController.upsert
);

router.patch(
  "/:id",
  requireRole(["admin"]),
  ObjectivesController.patch
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  ObjectivesController.remove
);

// ================== GIÁO VIÊN (VIEW-ONLY) ==================
router.get("/:id/objectives", checkAccess("lesson", "id"), viewOnly, ObjectivesController.getOneByLesson);

export default router;
