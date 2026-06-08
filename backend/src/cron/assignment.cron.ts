import cron from "node-cron";
import { supabase } from "../config/supabase";

export const checkAndRevokeExpiredAssignments = async () => {
    try {
        console.log("[CRON] Kiểm tra và thu hồi quyền truy cập hết hạn...");
        const now = new Date().toISOString();

        // Lấy danh sách các assignment đã hết hạn nhưng vẫn đang active
        const { data: expiredAssignments, error: fetchError } = await supabase
            .from("assignments")
            .select("id")
            .eq("status", "active")
            .lt("end_at", now);

        if (fetchError) {
            console.error("[CRON] Lỗi khi lấy danh sách assignment hết hạn:", fetchError.message);
            return;
        }

        if (expiredAssignments && expiredAssignments.length > 0) {
            const expiredIds = expiredAssignments.map((a: any) => a.id);
            
            // Cập nhật trạng thái thành 'revoked'
            const { error: updateError } = await supabase
                .from("assignments")
                .update({ status: "revoked", updated_at: now })
                .in("id", expiredIds);

            if (updateError) {
                console.error("[CRON] Lỗi khi cập nhật trạng thái assignment:", updateError.message);
                return;
            }

            // Ghi log (Ghi chú hệ thống tự động thu hồi)
            const logs = expiredAssignments.map((a: any) => ({
                assignment_id: a.id,
                action_type: "status:revoked",
                change_details: JSON.stringify({ note: "Auto-revoked by System Cron Job (Expired)" }),
            }));

            const { error: logError } = await supabase
                .from("assignment_logs")
                .insert(logs);

            if (logError) {
                console.error("[CRON] Lỗi khi ghi log hệ thống:", logError.message);
            }

            console.log(`[CRON] Đã thu hồi quyền thành công cho ${expiredAssignments.length} giáo viên.`);
        } else {
            console.log("[CRON] Không có quyền nào cần thu hồi.");
        }
    } catch (error) {
        console.error("[CRON] Lỗi không xác định trong tiến trình thu hồi quyền:", error);
    }
};

export const checkAndRevokeExpiredEnrollments = async () => {
    try {
        console.log("[CRON] Kiểm tra và thu hồi quyền truy cập học sinh hết hạn...");
        const now = new Date().toISOString();

        // Lấy danh sách các enrollment đã hết hạn nhưng vẫn đang active
        const { data: expiredEnrollments, error: fetchError } = await supabase
            .from("enrollments")
            .select("id")
            .eq("status", "active")
            .lt("end_at", now);

        if (fetchError) {
            console.error("[CRON] Lỗi khi lấy danh sách enrollment hết hạn:", fetchError.message);
            return;
        }

        if (expiredEnrollments && expiredEnrollments.length > 0) {
            const expiredIds = expiredEnrollments.map((a: any) => a.id);
            
            // Cập nhật trạng thái thành 'revoked'
            const { error: updateError } = await supabase
                .from("enrollments")
                .update({ status: "revoked", updated_at: now })
                .in("id", expiredIds);

            if (updateError) {
                console.error("[CRON] Lỗi khi cập nhật trạng thái enrollment:", updateError.message);
                return;
            }

            console.log(`[CRON] Đã thu hồi quyền thành công cho ${expiredEnrollments.length} học sinh.`);
        } else {
            console.log("[CRON] Không có quyền học sinh nào cần thu hồi.");
        }
    } catch (error) {
        console.error("[CRON] Lỗi không xác định trong tiến trình thu hồi quyền học sinh:", error);
    }
};

// Chạy cron job mỗi 1 phút để test dễ hơn
export const startCronJobs = () => {
    // Chạy ngay 1 lần lúc vừa start server
    checkAndRevokeExpiredAssignments();
    checkAndRevokeExpiredEnrollments();

    // Lên lịch chạy mỗi 1 phút
    cron.schedule("* * * * *", () => {
        checkAndRevokeExpiredAssignments();
        checkAndRevokeExpiredEnrollments();
    });
};
