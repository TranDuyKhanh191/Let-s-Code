import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import * as LessonStatusController from "../controllers/lessonStatus.controller";

const router = Router();

router.use(authRequired);
router.use(requireRole(["admin"])); // chỉ admin được publish/draft/archive

router.patch("/lessons/:id/publish", LessonStatusController.publishLesson);

router.patch("/lessons/:id/draft", LessonStatusController.setDraft);

router.patch("/lessons/:id/archive", LessonStatusController.archiveLesson);

export default router;
