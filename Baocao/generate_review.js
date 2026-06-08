const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

// Create document
const doc = new Document({
    creator: "Antigravity AI Agent",
    title: "Báo cáo Đánh giá Chuyên đề Tốt nghiệp 1",
    description: "Nhận xét và đề xuất cải tiến cho báo cáo của sinh viên Trần Duy Khánh",
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "BÁO CÁO ĐÁNH GIÁ VÀ ĐỀ XUẤT CHỈNH SỬA",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: "Tên đề tài: Xây dựng nền tảng website hỗ trợ giáo viên dạy lập trình cho trẻ em",
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ break: 1 })],
                }),
                new Paragraph({
                    text: "Sinh viên thực hiện: Trần Duy Khánh",
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ break: 1 })],
                }),
                new Paragraph({
                    text: "1. Đánh giá Tổng quan",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Báo cáo có khối lượng công việc tốt, thể hiện rõ được hệ thống đã xây dựng với các công nghệ hiện đại (ReactJS, Node.js, Supabase). Các phần phân tích kỹ thuật, thiết kế UI/UX và kiến trúc hệ thống được viết rất chi tiết và có chiều sâu. Tuy nhiên, ",
                        }),
                        new TextRun({
                            text: "điểm trừ lớn nhất của báo cáo hiện tại nằm ở việc bố cục các chương đang bị nhầm lẫn về chức năng, đánh số mục lục (heading) đang bị lỗi và lộn xộn, cùng với một số lỗi sao chép nội dung.",
                            bold: true,
                        }),
                    ],
                }),

                new Paragraph({
                    text: "2. Các vấn đề về Bố cục và Cấu trúc chương",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "Hiện tại, nội dung của các chương không khớp với tiêu đề chương:",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Chương 2 (Cơ sở lý thuyết): ", bold: true }),
                        new TextRun({ text: "Theo chuẩn học thuật, chương này CHỈ DÙNG để giới thiệu về các công nghệ, framework, khái niệm lý thuyết được sử dụng (ví dụ: RESTful API là gì, SPA là gì, giới thiệu ReactJS, Node.js, Supabase). Hiện tại, bạn đang đưa TOÀN BỘ phần Phân tích yêu cầu, Thiết kế Cơ sở dữ liệu, Thiết kế UI/UX, Thiết kế Kiến trúc Backend/Frontend vào chương này. Điều này là hoàn toàn sai cấu trúc." })
                    ],
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Chương 3 (Phân tích): ", bold: true }),
                        new TextRun({ text: "Chương này hiện tại lại tiếp tục đi sâu vào phân tích DB, API, Component. Thực chất nội dung này và nội dung thiết kế ở Chương 2 phải được gộp chung lại vào một chương gọi là 'Phân tích và Thiết kế hệ thống'." })
                    ],
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Chương 4 (Quy trình xử lý và Kết quả): ", bold: true }),
                        new TextRun({ text: "Phần quy trình xử lý, luồng dữ liệu (data flow) đáng lẽ nên nằm ở chương 3 (Thiết kế). Chương 4 nên tập trung vào 'Triển khai và Đánh giá Kết quả', tức là đưa ra các giao diện thực tế đã hoàn thành, kiểm thử hệ thống ra sao." })
                    ],
                    bullet: { level: 1 }
                }),

                new Paragraph({
                    text: "3. Lỗi Đánh số Mục lục (Heading) và Hình ảnh",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "Phần đánh số mục (Heading numbering) trong file Word đang bị hỏng nặng, cụ thể:",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "Nhảy số mục lung tung: Sau mục 2.1.2 là 2.1.4 (thiếu 2.1.3). Từ 2.5 nhảy sang 2.7 (thiếu 2.6). Từ 2.7 nhảy sang 2.9 (thiếu 2.8, nhưng lại có mục 2.8.1.2 nằm trôi nổi trong mục 3.4.1). Mục 2.9 nhảy sang 2.10 rồi 2.11, rồi nhảy tới 2.13 (thiếu 2.12).",
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    text: "Lỗi đánh số Hình ảnh: Hình nhảy từ 2.2, 2.3 sang 3.1, 3.4 (thiếu 3.2, 3.3). Rất nhiều hình ảnh bị trùng lặp số hoặc trùng caption (VD: Hình 4.11 xuất hiện lặp lại với caption giống hệt nhau).",
                    bullet: { level: 1 }
                }),

                new Paragraph({
                    text: "4. Lỗi lặp lặp nội dung (Copy-Paste)",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "Đoạn văn 'Để đạt được các mục tiêu trên, hệ thống backend đóng vai trò then chốt...' bị lặp lại nhiều lần ở các tiểu mục của phần 2.2.1.",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "Nội dung mô tả của mục 3.1.1 (Course Management) và 3.1.2 (Chapter Management) bị sao chép y hệt nhau ('Nhóm này quản lý cấu trúc nội dung đào tạo theo cấp bậc...').",
                    bullet: { level: 0 }
                }),

                new Paragraph({
                    text: "5. Đề xuất Cấu trúc Báo cáo Chuẩn hóa (Actionable Recommendations)",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "Bạn cần cấu trúc lại (cut và paste) các phần nội dung theo khung sau đây:",
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "CHƯƠNG 1: TỔNG QUAN VỀ VẤN ĐỀ NGHIÊN CỨU", bold: true }),
                        new TextRun({ text: " (Giữ nguyên nội dung hiện tại: Đặt vấn đề, mục tiêu, đối tượng, phạm vi nghiên cứu)." })
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ", bold: true }),
                        new TextRun({ text: " (Chỉ tập trung giới thiệu lý thuyết, KHÔNG thiết kế DB hay UI ở đây). Bao gồm: Tổng quan về ReactJS, NodeJS, Supabase, TailwindCSS, Kiến trúc SPA, RESTful API." })
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", bold: true }),
                        new TextRun({ text: " (Gộp các mục thiết kế từ Chương 2 hiện tại sang đây). Bao gồm:" })
                    ],
                }),
                new Paragraph({
                    text: "3.1. Phân tích yêu cầu hệ thống (Use-case, Actor)",
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    text: "3.2. Phân tích và Thiết kế Cơ sở dữ liệu (Đưa các nội dung Supabase Schema từ chương 2 và chương 3 vào đây)",
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    text: "3.3. Thiết kế Kiến trúc Hệ thống (Frontend & Backend Architecture)",
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    text: "3.4. Thiết kế Giao diện Người dùng (UI/UX - Glassmorphism, Dark Mode)",
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "CHƯƠNG 4: XÂY DỰNG VÀ TRIỂN KHAI HỆ THỐNG", bold: true }),
                        new TextRun({ text: " (Đưa các luồng xử lý từ Chương 4 hiện tại và thêm hình ảnh thực tế). Bao gồm:" })
                    ],
                }),
                new Paragraph({
                    text: "4.1. Cài đặt các chức năng chính (Trình bày luồng hoạt động, kèm theo code snippet nếu cần)",
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    text: "4.2. Giao diện kết quả đạt được (Ảnh chụp màn hình hệ thống thực tế kèm caption rõ ràng)",
                    bullet: { level: 1 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", bold: true }),
                        new TextRun({ text: " (Giữ nguyên, bổ sung thêm việc đối chiếu xem đã đáp ứng mục tiêu đề ra ở Chương 1 chưa)." })
                    ],
                }),

                new Paragraph({
                    text: "6. Hướng dẫn sửa chữa file Word (Tips)",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "1. Bôi đen toàn bộ văn bản, xóa định dạng số tự động hiện tại. Sử dụng tính năng 'Multilevel List' của Word liên kết với Heading 1, 2, 3 để tự động đánh số lại từ đầu đến cuối.",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "2. Cập nhật lại tính năng 'Insert Caption' cho từng hình ảnh và bảng biểu để hệ thống tự đánh số theo chương (VD: Hình 3.1 là hình thứ 1 của chương 3).",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "3. Dò lại các đoạn văn bản bằng mắt thường hoặc công cụ tìm kiếm trong Word để xóa các đoạn text bị copy-paste trùng lặp.",
                    bullet: { level: 0 }
                })
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("DanhGia_BaocaoCD1_TranDuyKhanh.docx", buffer);
    console.log("Document created successfully at DanhGia_BaocaoCD1_TranDuyKhanh.docx");
});
