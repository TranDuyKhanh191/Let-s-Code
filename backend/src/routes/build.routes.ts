import { Router } from "express";
import * as BuildController from "../controllers/build.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// Tất cả user phải đăng nhập
router.use(authRequired);

// ================= ADMIN ===================
router.post(
  "/:iduilds",
  requireRole(["admin"]),
  BuildController.create
);

router.patch(
  "/:id",
  requireRole(["admin"]),
  BuildController.update
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  BuildController.remove
);

router.post(
  "/:id",
  requireRole(["admin"]),
  BuildController.attachMedia
);

// ================= TEACHER (VIEW ONLY) ===================
router.get(
  "/:id",
  checkAccess("lesson", "id"),   // Teacher phải được cấp quyền lesson
  viewOnly,                     // Chặn mutation
  BuildController.getByLesson
);

export default router;
