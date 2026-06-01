import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import * as MediaController from "../controllers/media.controller";
import * as ContentMediaController from "../controllers/contentMedia.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// yêu cầu đăng nhập
router.use(authRequired);

// MEDIA - Cho phép admin, teacher và student upload
router.post("/upload", requireRole(["admin", "teacher", "student"]), upload.single("file"), MediaController.upload);
router.delete("/:id", requireRole(["admin"]), MediaController.remove);

// CONTENT-MEDIA MAPPING
router.post("/content_media", requireRole(["admin"]), ContentMediaController.attachMedia);

export default router;
