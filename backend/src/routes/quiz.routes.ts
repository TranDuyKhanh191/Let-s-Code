import { Router } from "express";
import * as QuizController from "../controllers/quiz.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

// Tất cả user phải đăng nhập
router.use(authRequired);

// ===================== ADMIN ======================

// Tạo quiz mới trong lesson
router.post(
  "/:id",
  requireRole(["admin"]),
  QuizController.create
);

// Cập nhật quiz
router.patch(
  "/:id",
  requireRole(["admin"]),
  QuizController.update
);

// Xóa quiz
router.delete(
  "/:id",
  requireRole(["admin"]),
  QuizController.remove
);

// ====== Manage Answers (Admin Only) ======

router.post(
  "/:id",
  requireRole(["admin"]),
  QuizController.addAnswer
);

router.patch(
  "/:id",
  requireRole(["admin"]),
  QuizController.updateAnswer
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  QuizController.removeAnswer
);

// ===================== TEACHER (VIEW ONLY) ======================

// Teacher xem toàn bộ quizzes trong lesson họ có quyền
router.get(
  "/:id",
  checkAccess("lesson", "id"),   // kiểm tra quyền theo assignment
  viewOnly,
  QuizController.getByLesson
);

// Teacher xem 1 quiz + answers (view only)
router.get(
  "/:id",
  viewOnly,
  QuizController.getOne
);


export default router;
