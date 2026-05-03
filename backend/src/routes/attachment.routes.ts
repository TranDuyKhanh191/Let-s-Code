import { Router } from "express";
import * as AttachmentController from "../controllers/attachment.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import { checkAccess, viewOnly } from "../middlewares/permission.middleware";

const router = Router();

/** --- ALL USER MUST LOGIN --- */
router.use(authRequired);

/** --- ADMIN ONLY ROUTES --- */
router.post(
  "/:id",
  requireRole(["admin"]),
  AttachmentController.add
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  AttachmentController.remove
);

router.post(
  "/:id/reorder",
  requireRole(["admin"]),
  AttachmentController.reorder
);

/** --- TEACHER VIEW ONLY --- */
router.get(
  "/:id",
  checkAccess("lesson"),
  viewOnly,
  AttachmentController.getByLesson
);

export default router;
