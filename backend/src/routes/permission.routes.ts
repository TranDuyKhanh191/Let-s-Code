import { Router } from "express";
import * as PermissionController from "../controllers/permission.controller";
import { authRequired } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authRequired);

//============== Admin ==============
router.get("/", requireRole(["admin"]), PermissionController.getAllAssignments); // Xem toàn bộ quyền
router.get("/logs/:assignmentId", requireRole(["admin"]), PermissionController.getAssignmentLogs);// Xem lịch sử cấp quyền
router.post("/assign", requireRole(["admin"]), PermissionController.assign);// Cấp quyền
router.patch("/status/:id", requireRole(["admin"]), PermissionController.changeStatus);// Thay đổi trạng thái quyền
router.patch("/:id", requireRole(["admin"]), PermissionController.updateAssignment);// Cập nhật chi tiết quyền (trạng thái, thời gian)
router.delete("/:id", requireRole(["admin"]), PermissionController.deleteAssignment);// Xóa cứng quyền

//============== Giáo viên ==============
router.get("/my", PermissionController.myAssignments);

export default router;
