import { Request, Response, NextFunction } from "express";

// userId → list timestamps (mỗi upload lưu 1 timestamp)
const uploadCount: Record<string, number[]> = {};

export const limitUploadsPerMinute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: "Chưa đăng nhập" });
  }

  const userId = user.id.toString();
  const now = Date.now();

  // Nếu chưa có record → tạo mảng rỗng
  if (!uploadCount[userId]) {
    uploadCount[userId] = [];
  }

  // Giữ lại những upload trong vòng 1 phút
  uploadCount[userId] = uploadCount[userId].filter(
    (timestamp) => now - timestamp < 60000
  );

  // Nếu vượt quá 20 uploads trong 1 phút → chặn
  if (uploadCount[userId].length >= 20) {
    return res.status(429).json({
      error: "Upload quá nhiều trong 1 phút, hãy thử lại sau."
    });
  }

  // Lưu timestamp upload hiện tại
  uploadCount[userId].push(now);

  next();
};
