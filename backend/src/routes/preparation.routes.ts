import { Router } from "express";
import * as PreparationController from "../controllers/preparation.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// Tất cả user đều phải đăng nhập
router.use(authRequired);

// ================= ADMIN ===================
router.post(
  "/:id",
  requireRole(["admin"]),
  PreparationController.upsert
);

router.patch(
  "/:id",
  requireRole(["admin"]),
  PreparationController.patch
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  PreparationController.remove
);

// ================= TEACHER (VIEW ONLY) ==================
router.get(
  "/:id",
  checkAccess("lesson", "id"),     // kiểm tra teacher có quyền xem lesson
  viewOnly,                       // ngăn mutation
  PreparationController.getByLesson
);

export default router;
