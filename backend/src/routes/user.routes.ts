import { Router } from "express";
import * as UserCtrl from "../controllers/user.controller";
import { authRequired, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authRequired);
router.use(requireRole(["admin"]));

router.post("/", UserCtrl.createUser);
router.get("/", UserCtrl.getAllUsers);
router.patch("/:id", UserCtrl.updateUser);
router.delete("/:id", UserCtrl.deleteUser);

router.post("/reset-password", UserCtrl.resetUserPassword);

export default router;
