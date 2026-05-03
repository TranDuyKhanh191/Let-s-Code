import { Router } from "express";
import * as AuthCtrl from "../controllers/auth.controller";

const router = Router();

// ===== AUTH =====
router.post("/login", AuthCtrl.login);

// ===== RESET PASSWORD =====

// Gửi OTP về email (admin)
router.post("/forgot-password", AuthCtrl.forgotPassword);

// 🔥 RESET BẰNG OTP (KHUYÊN DÙNG)
router.post("/reset-password/otp", AuthCtrl.resetPasswordWithOTP);

// (GIỮ LẠI nếu sau này làm FE reset bằng link)
router.post("/reset-password", AuthCtrl.resetPassword);

export default router;
