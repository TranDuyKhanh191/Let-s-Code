import { supabase } from "../config/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendMail } from "../config/mailer";

const TABLE = "users";
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_SECRET";

export const login = async (identifier: string, password: string) => {
    if (!identifier || !password) {
        throw new Error("Thiếu thông tin đăng nhập");
    }

    // Không đổi lowercase nữa — giữ nguyên người dùng nhập
    identifier = identifier.trim();

    const isEmail = identifier.includes("@");

    const { data: user, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq(isEmail ? "email" : "username", identifier)
        .single();

    if (error || !user) {
        throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    if (user.is_active === false) {
        throw new Error("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Sai tài khoản hoặc mật khẩu");

    const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        throw new Error("Token không hợp lệ");
    }
};

export const forgotPassword = async (email: string) => {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) throw new Error("Email không tồn tại");
  if (user.role !== "admin")
    throw new Error("Chức năng này chỉ dành cho admin");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
  const displayName = user.full_name || user.fullName || user.username || "Quản trị viên";

  await supabase
    .from("users")
    .update({
      otp_code: otp,
      otp_expires: expires,
      otp_verified: false
    })
    .eq("id", user.id);

await sendMail(
  email,
  "🔒 [LETSCODE] Mã Xác Thực Khôi Phục Mật Khẩu", 
  `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      
      <div style="background: linear-gradient(135deg, #9c00e5 0%, #7b0db6 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">LETSCODE</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase;">Education Platform 2.0</p>
      </div>

      <div style="padding: 40px 30px;">
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
          Xin chào <strong>${displayName}</strong>,
        </p>
        <p style="margin: 0 0 20px; color: #555555; line-height: 1.6; font-size: 15px;">
          Hệ thống đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản quản trị của bạn. 
          Để đảm bảo an toàn bảo mật, vui lòng sử dụng mã xác thực (OTP) dưới đây để hoàn tất quy trình:
        </p>

        <div style="background-color: #f0f8ff; border: 1px dashed #9c00e5; border-radius: 6px; padding: 20px; text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: 700; color: #9c00e5; letter-spacing: 8px; display: block;">
            ${otp}
          </span>
          <span style="display: block; margin-top: 10px; font-size: 12px; color: #888;">(Mã có hiệu lực trong 10 phút)</span>
        </div>

        <p style="margin: 0 0 10px; color: #555555; line-height: 1.6; font-size: 14px;">
          <strong>Lưu ý bảo mật:</strong>
        </p>
        <ul style="color: #555555; font-size: 14px; line-height: 1.6; padding-left: 20px; margin-top: 0;">
          <li>Không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.</li>
          <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ quản trị viên cấp cao ngay lập tức.</li>
        </ul>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="margin: 0; color: #999999; font-size: 12px;">
          &copy; ${new Date().getFullYear()} LetsCode Technology. All rights reserved.<br>
          Đây là email tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  </div>
  `
);

  return { message: "Đã gửi mã OTP về email admin" };
};

export const resetPasswordWithOTP = async (
  email: string,
  otp: string,
  newPass: string
) => {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) throw new Error("User không tồn tại");
  if (user.otp_code !== otp)
    throw new Error("OTP không đúng");
  if (new Date(user.otp_expires) < new Date())
    throw new Error("OTP đã hết hạn");

  const hashed = await bcrypt.hash(newPass, 10);

  await supabase
    .from("users")
    .update({
      password: hashed,
      otp_code: null,
      otp_expires: null,
      otp_verified: true
    })
    .eq("id", user.id);

  return { message: "Đổi mật khẩu admin thành công" };
};


export const resetPassword = async (token: string, newPass: string) => {
    const cleanPass = newPass.trim();
    const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("reset_token", token)
        .single();

    if (!user) throw new Error("Token không hợp lệ");
    if (new Date(user.reset_expires) < new Date())
        throw new Error("Token hết hạn");

    const hashed = await bcrypt.hash(newPass, 10);

    await supabase
        .from("users")
        .update({
            password: hashed,
            reset_token: null,
            reset_expires: null
        })
        .eq("id", user.id);

    return { message: "Đổi mật khẩu thành công" };
};
