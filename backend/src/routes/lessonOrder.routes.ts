import { Router } from "express";
import * as LessonOrderController from "../controllers/lessonOrder.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authRequired);
router.use(requireRole(["admin"]));

router.post("/lessons/:id/reorder", LessonOrderController.reorder);

export default router;
