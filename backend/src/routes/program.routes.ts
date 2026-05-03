import { Router } from "express";
import * as ProgramController from "../controllers/program.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { viewOnly, checkAccess } from "../middlewares/permission.middleware";

const router = Router();

router.use(authRequired);

// ===================== ADMIN ======================

// Lấy toàn bộ chương trình
router.get(
  "/",
  requireRole(["admin"]),
  ProgramController.getPrograms
);

// Tạo chương trình
router.post(
  "/",
  requireRole(["admin"]),
  ProgramController.createProgram
);

// Cập nhật chương trình
router.patch(
  "/:id",
  requireRole(["admin"]),
  ProgramController.updateProgram
);

// Ẩn chương trình
router.patch(
  "/:id/hide",
  requireRole(["admin"]),
  ProgramController.hideProgram
);

// Hiện chương trình
router.patch(
  "/:id/show",
  requireRole(["admin"]),
  ProgramController.showProgram
);

// Không được phép dùng nhưng vẫn để đó
router.delete(
  "/:id",
  requireRole(["admin"]),
  ProgramController.deleteProgram
);

// ===================== TEACHER (View only) ======================

// Giáo viên xem chi tiết program → phải có quyền
router.get(
  "/:id",
  checkAccess("program", "id"),
  viewOnly,
  ProgramController.getProgramById
);

export default router;
