import { Router } from "express";
import * as ModelController from "../controllers/model.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// Tất cả phải đăng nhập
router.use(authRequired);

// ================== ADMIN ==================
// Những route này ảnh hưởng database → chỉ admin được phép
router.post(
  "/:id",
  requireRole(["admin"]),
  ModelController.create
);

router.patch(
  "/:id",
  requireRole(["admin"]),
  ModelController.update
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  ModelController.remove
);

// ================== GIÁO VIÊN (VIEW ONLY) ==================
router.get(
  "/:id",
  checkAccess("lesson", "id"),  // kiểm tra teacher được cấp quyền lesson không
  viewOnly,                     // chặn PATCH/DELETE dù hacker cố gắng
  ModelController.getByLesson
);

export default router;
