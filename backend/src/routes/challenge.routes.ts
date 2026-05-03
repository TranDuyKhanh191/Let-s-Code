import { Router } from "express";
import * as ChallengeController from "../controllers/challenge.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// Tất cả user phải đăng nhập
router.use(authRequired);

// ===================== ADMIN ======================

// Tạo challenge trong 1 lesson
router.post(
  "/:id",
  requireRole(["admin"]),
  ChallengeController.create
);

// Cập nhật Challenge
router.patch(
  "/:id",
  requireRole(["admin"]),
  ChallengeController.update
);

// Xóa Challenge
router.delete(
  "/:id",
  requireRole(["admin"]),
  ChallengeController.remove
);

// ===================== TEACHER (VIEW ONLY) ======================

// Giáo viên xem các challenge trong lesson họ được phân công
router.get(
  "/:id",
  checkAccess("lesson", "id"),
  viewOnly,
  ChallengeController.getByLesson
);

export default router;
