import { Router } from "express";
import * as AggregatorController from "../controllers/lessonAggregator.controller";
import { authRequired } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

router.use(authRequired);

// teacher/admin can view only if checkAccess OK
router.get(
  "/lessons/:id/full",
  checkAccess("lesson", "id"), // middleware nên kiểm tra permission theo lesson id
  viewOnly, // đảm bảo method GET hoặc view-only context
  AggregatorController.getFullLesson
);

export default router;
