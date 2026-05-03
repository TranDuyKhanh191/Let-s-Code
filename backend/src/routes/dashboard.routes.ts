// src/routes/dashboard.routes.ts
import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.middleware";
import * as DashboardController from "../controllers/dashboard.controller";

const router = Router();

router.use(authRequired);
router.use(requireRole(["admin"]));

router.get("/", DashboardController.getStats);

export default router;
