import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import * as MediaController from "../controllers/media.controller";
import * as ContentMediaController from "../controllers/contentMedia.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// yêu cầu đăng nhập + admin cho mọi route media
router.use(authRequired);
router.use(requireRole(["admin"]));

// MEDIA
router.post("/upload", upload.single("file"), MediaController.upload);
router.delete("/:id", MediaController.remove);

// CONTENT-MEDIA MAPPING
router.post("/content_media", ContentMediaController.attachMedia);

export default router;
