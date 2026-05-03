// src/routes/logs.routes.ts
import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import * as LogsController from "../controllers/logs.controller";


const router = Router();

router.use(authRequired);
router.use(requireRole(["admin"]));

router.get("/assignments/:id/logs", LogsController.getAssignmentLogs);

router.get("/system", LogsController.getSystemLogs);

export default router;
