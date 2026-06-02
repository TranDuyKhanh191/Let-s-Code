import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import * as AiController from "../controllers/ai.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authRequired);
router.post("/chat", requireRole(["student", "teacher"]), upload.single("image"), AiController.chat);

export default router;
