---
trigger: always_on
glob: "*"
description: Cung cấp bối cảnh dự án, công nghệ, cấu trúc và quy tắc làm việc cho Let's Code.
---

# Bối cảnh Dự án
* **Tên dự án:** Website hỗ trợ giáo viên dạy lập trình cho trẻ em ở Let's Code.
* **Mục tiêu:** Hỗ trợ giáo viên dạy học cho các bé từ 5 đến 15 tuổi bằng website.

# Công nghệ và Cấu trúc

Dự án được chia làm 2 phần chính: Backend và Frontend, cả hai đều sử dụng **TypeScript** làm ngôn ngữ chủ đạo.

## Công nghệ sử dụng:
* **Frontend:**
  * Framework: React (thông qua Vite)
  * Ngôn ngữ: TypeScript (`.ts`, `.tsx`)
  * Styling: Tailwind CSS
  * Routing: React Router DOM
  * Tích hợp: Supabase Client, Axios, Framer Motion (Animations), React PDF
* **Backend:**
  * Framework: Express.js (Node.js)
  * Ngôn ngữ: TypeScript (`.ts`)
  * Database/BaaS: Supabase (PostgreSQL)
  * Công cụ khác: Zod (Validation), Multer (Upload file), JWT/Bcryptjs (Xác thực/Bảo mật), Nodemailer (Email)

## Cấu trúc thư mục (Tree Analysis):
Dự án có cấu trúc monorepo cơ bản phân tách giữa client và server:
```
Let-s-Code/
├── .agents/          # Chứa các rules cấu hình cho AI Agent
├── backend/          # Mã nguồn máy chủ (Express + Node.js)
│   ├── src/          # Source code chính của backend
│   │   ├── controllers/  # Xử lý logic request/response
│   │   ├── middlewares/  # Middleware (ví dụ: auth, upload, rate limit)
│   │   ├── routes/       # Định nghĩa API endpoints
│   │   ├── services/     # Chứa business logic (user, media,...)
│   │   └── app.ts        # File cấu hình và khởi chạy ứng dụng Express
│   ├── package.json  # Quản lý dependencies backend
│   └── tsconfig.json # Cấu hình TypeScript cho backend
└── frontend/         # Mã nguồn giao diện người dùng (React + Vite)
    ├── public/       # Chứa tài nguyên tĩnh (assets)
    ├── src/          # Source code chính của frontend
    │   ├── components/   # Các UI components dùng chung và chia theo module (ví dụ: admin/lesson)
    │   ├── pages/        # Các trang giao diện chính
    │   └── ...
    ├── package.json  # Quản lý dependencies frontend
    ├── tailwind.config.js # Cấu hình Tailwind CSS
    └── vite.config.ts# Cấu hình Vite build tool
```

# Rules (Quy tắc làm việc)
* **Ngôn ngữ phản hồi**: Luôn sử dụng tiếng Việt để trao đổi.
* **Tiêu chuẩn Code**: 
    * Tuân thủ Clean Code và nguyên lý SOLID.
    * Đặt tên biến/hàm theo chuẩn cấu trúc.
    * Ưu tiên các giải pháp tối ưu hiệu năng trang web.
* **Định hướng quy trình**:
    * Sau mỗi câu trả lời, LUÔN kèm theo một câu hỏi định hướng để gợi mở bước tiếp theo của quy trình: **Phân tích -> Lập kế hoạch -> Thiết kế -> Cải thiện**.
    * Phải luôn hỏi trước khi thực hiện hành động.
