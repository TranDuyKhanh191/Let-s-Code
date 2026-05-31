import { useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const useAssignmentNotification = (onNewAssignment?: () => void) => {
  const { user } = useAuth();

  useEffect(() => {
    // Chỉ kích hoạt realtime nếu có user đăng nhập
    if (!user || !user.id || user.role !== "teacher") return;

    // Thiết lập kênh lắng nghe bảng assignments
    const channel = supabase
      .channel("assignments-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "assignments",
          filter: `teacher_id=eq.${user.id}`, // Lọc các assignment thuộc về giáo viên hiện tại
        },
        (payload) => {
          console.log("Realtime event received:", payload);
          // Hiển thị toast notification
          toast.success("Admin vừa phân công cho bạn một khóa học mới!", {
            duration: 5000,
            position: "top-right",
          });

          // Gọi callback nếu có để refresh danh sách
          if (onNewAssignment) {
            onNewAssignment();
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Đã kết nối thành công tới Supabase Realtime cho assignments");
        }
      });

    // Cleanup khi component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onNewAssignment]);
};
