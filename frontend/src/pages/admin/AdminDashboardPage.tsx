import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CalendarIcon,
  PlusIcon,
  XIcon,
  ChevronRightIcon,
  LightningBoltIcon,
  SparklesIcon,
  RefreshIcon,
} from "@heroicons/react/solid";
import "../../styles/admin.css";

// Import Layout Components
import HeaderAdmin from "../../components/layout/HeaderAdmin";
import CreateCourseModal from "../../components/admin/CreateCourseModal";

const customStyles = `
  @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

  
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 0, 229, 0.5); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9c00e5; }
  
  .glass-panel {
    background: rgba(30, 20, 50, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  }

  .calendar-day { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .calendar-day:hover { 
    background: rgba(255, 255, 255, 0.1); 
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10;
  }

  .stat-card-gradient-1 { background: linear-gradient(135deg, rgba(60, 144, 255, 0.1) 0%, rgba(60, 144, 255, 0.05) 100%); }
  .stat-card-gradient-2 { background: linear-gradient(135deg, rgba(156, 0, 229, 0.1) 0%, rgba(156, 0, 229, 0.05) 100%); }
  .stat-card-gradient-3 { background: linear-gradient(135deg, rgba(77, 185, 51, 0.1) 0%, rgba(77, 185, 51, 0.05) 100%); }
`;

const API_BASE = "http://localhost:3000";

interface DashboardStats {
  totalTeachers: number;
  totalCourses: number;
  systemStatus: "Normal" | "Maintenance";
}

interface CalendarEvent {
  type: "start" | "end";
  text: string;
  teacher: string;
  course: string;
  date: string;
}

// --- MODAL CHI TIẾT NGÀY (Cải tiến UI) ---
const DateDetailModal = ({
  isOpen,
  onClose,
  date,
  events,
}: {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: CalendarEvent[];
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#150a24] border border-[#9c00e5]/30 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3c90ff] via-[#9c00e5] to-[#ff7c7c]"></div>

        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white shadow-inner">
              <span className="text-xs font-medium uppercase text-gray-400">
                {date.toLocaleString("default", { month: "short" })}
              </span>
              <span className="text-2xl font-black">{date.getDate()}</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                Chi tiết lịch trình
              </h3>
              <p className="text-gray-400 text-sm">
                {events.length} sự kiện diễn ra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 pt-2 overflow-y-auto custom-scrollbar space-y-3 flex-1">
          {events.length > 0 ? (
            events.map((evt, idx) => (
              <div
                key={idx}
                className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    evt.type === "start" ? "bg-[#4db933]" : "bg-[#ff4d4d]"
                  }`}
                ></div>
                <div className="flex justify-between items-start mb-2 pl-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      evt.type === "start"
                        ? "bg-[#4db933]/10 text-[#4db933]"
                        : "bg-[#ff4d4d]/10 text-[#ff4d4d]"
                    }`}
                  >
                    {evt.type === "start" ? "Bắt đầu" : "Kết thúc"}
                  </span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1 pl-3 line-clamp-2">
                  {evt.course}
                </h4>
                <div className="flex items-center gap-2 pl-3 mt-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3c90ff] to-[#9c00e5] flex items-center justify-center text-[10px] font-bold text-white">
                    {evt.teacher.charAt(0)}
                  </div>
                  <p className="text-gray-400 text-xs font-medium">
                    GV: {evt.teacher}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center opacity-50">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">
                Không có sự kiện nào trong ngày này.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalCourses: 0,
    systemStatus: "Normal",
  });

  const [loading, setLoading] = useState(true);
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  // --- CALENDAR STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<{
    [key: number]: CalendarEvent[];
  }>({});

  // Data Cache
  const [rawAssignments, setRawAssignments] = useState<any[]>([]);
  const [rawCourses, setRawCourses] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // --- FETCH DATA ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1. Fetch Users
      const usersRes = await fetch(`${API_BASE}/api/users`, { headers });
      const usersData = usersRes.ok ? await usersRes.json() : [];

      // 2. Fetch Courses
      const [resC1, resC2] = await Promise.all([
        fetch(`${API_BASE}/api/courses/programs/1`, { headers }),
        fetch(`${API_BASE}/api/courses/programs/2`, { headers }),
      ]);
      const dataC1 = resC1.ok ? await resC1.json() : [];
      const dataC2 = resC2.ok ? await resC2.json() : [];

      const allCoursesList = [
        ...(dataC1.courses || []),
        ...(dataC2.courses || []),
      ];
      setRawCourses(allCoursesList);

      // Stats
      const userList = Array.isArray(usersData.users) ? usersData.users : [];
      setStats({
        totalTeachers: userList.filter((u: any) => u.role === "teacher").length,
        totalCourses: allCoursesList.length,
        systemStatus: "Normal",
      });

      // 3. Fetch Assignments for Calendar & Activities
      const assignRes = await fetch(`${API_BASE}/api/permissions`, { headers });
      if (assignRes.ok) {
        const assignJson = await assignRes.json();
        const assignmentsList = assignJson.assignments || [];
        setRawAssignments(assignmentsList);
        processCalendarEvents(assignmentsList, allCoursesList);

        // Lấy 5 hoạt động gần nhất
        const sortedRecent = [...assignmentsList]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5);
        setRecentActivities(sortedRecent);
      }
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  useEffect(() => {
    if (rawAssignments.length)
      processCalendarEvents(rawAssignments, rawCourses);
  }, [currentDate]);

  // --- PROCESS DATA ---
  const processCalendarEvents = (assignments: any[], courses: any[]) => {
    const events: { [key: number]: CalendarEvent[] } = {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    assignments.forEach((asg) => {
      // --- LỌC KHÓA HỌC PUBLISHED ---
      let resourceName = "";
      if (asg.resource_type === "course") {
        const course = courses.find((c) => c.id == asg.resource_id);
        // Nếu không tìm thấy hoặc chưa published thì bỏ qua
        if (!course || course.status !== "published") return;
        resourceName = course.name;
      } else {
        resourceName = "Toàn bộ chương trình";
      }

      const teacherName = asg.users?.full_name || "GV";

      const addEvent = (dateStr: string, type: "start" | "end") => {
        const date = new Date(dateStr);
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          const day = date.getDate();
          if (!events[day]) events[day] = [];
          events[day].push({
            type,
            text: "",
            teacher: teacherName,
            course: resourceName,
            date: dateStr,
          });
        }
      };

      if (asg.start_at) addEvent(asg.start_at, "start");
      if (asg.end_at) addEvent(asg.end_at, "end");
    });
    setCalendarEvents(events);
  };

  // --- HANDLERS ---
  const handleDayClick = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    setShowDetailModal(true);
  };

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 Sunday
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f061a] via-[#130826] to-[#0f061a] text-white font-sans">
      <style>{customStyles}</style>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9c00e5]/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "10s" }}
        ></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3c90ff]/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "15s" }}
        ></div>
      </div>

      <HeaderAdmin />
      <CreateCourseModal
        open={showCreateCourse}
        onClose={() => setShowCreateCourse(false)}
        onSuccess={fetchDashboardData}
      />

      {/* MODAL CHI TIẾT */}
      {selectedDate && (
        <DateDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          date={selectedDate}
          events={calendarEvents[selectedDate.getDate()] || []}
        />
      )}

      <div className="flex-1 p-6 md:p-10 relative z-10 max-w-7xl mx-auto w-full animate-slide-in">
        {/* --- WELCOME BANNER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="w-5 h-5 text-[#ffee00]" />
              <span className="text-[#ffee00] font-bold text-sm tracking-wide uppercase">
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight">
              Xin chào,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9c00e5] to-[#3c90ff]">
                Quản trị viên
              </span>
            </h1>
            <p className="text-gray-400 mt-1">
              Hôm nay là{" "}
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              .
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="group px-5 py-2.5 bg-white/5 border border-white/10 hover:border-[#9c00e5]/50 hover:bg-[#9c00e5]/10 text-white rounded-xl transition-all flex items-center gap-2 font-bold shadow-lg"
          >
            <RefreshIcon
              className={`w-5 h-5 text-gray-400 group-hover:text-[#9c00e5] transition-transform ${
                loading ? "animate-spin" : ""
              }`}
            />
            <span>Làm mới</span>
          </button>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Teachers */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group stat-card-gradient-1 border-l-4 border-l-[#3c90ff]">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
              <UsersIcon className="w-32 h-32 text-[#3c90ff]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#3c90ff]/20 rounded-lg text-[#3c90ff]">
                  <AcademicCapIcon className="w-6 h-6" />
                </div>
                <span className="text-[#3c90ff] font-bold text-sm uppercase tracking-wider">
                  Giáo viên
                </span>
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black text-white">
                  {loading ? "..." : stats.totalTeachers}
                </h3>
                <span className="text-sm text-gray-400 mb-1">nhân sự</span>
              </div>
            </div>
          </div>

          {/* Card 2: Courses */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group stat-card-gradient-2 border-l-4 border-l-[#9c00e5]">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpenIcon className="w-32 h-32 text-[#9c00e5]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#9c00e5]/20 rounded-lg text-[#9c00e5]">
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <span className="text-[#9c00e5] font-bold text-sm uppercase tracking-wider">
                  Khóa học
                </span>
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black text-white">
                  {loading ? "..." : stats.totalCourses}
                </h3>
                <span className="text-sm text-gray-400 mb-1">bài giảng</span>
              </div>
            </div>
          </div>

          {/* Card 3: System */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group stat-card-gradient-3 border-l-4 border-l-[#4db933]">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
              <ChartBarIcon className="w-32 h-32 text-[#4db933]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#4db933]/20 rounded-lg text-[#4db933]">
                  <LightningBoltIcon className="w-6 h-6" />
                </div>
                <span className="text-[#4db933] font-bold text-sm uppercase tracking-wider">
                  Hệ thống
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4db933] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4db933]"></span>
                </span>
                <span className="text-xl font-bold text-white">
                  Hoạt động tốt
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: CALENDAR (2/3) */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col h-[600px]">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-[#9c00e5] rounded-lg shadow-lg shadow-[#9c00e5]/40">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                Lịch trình giảng dạy
              </h3>

              {/* Controls */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1
                      )
                    )
                  }
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                >
                  <ChevronRightIcon className="w-4 h-4 rotate-180" />
                </button>
                <span className="text-sm font-bold text-white min-w-[120px] text-center uppercase tracking-wide">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </span>
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1
                      )
                    )
                  }
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
              {/* Weekday Header */}
              <div className="grid grid-cols-7 mb-4">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, i) => (
                  <div
                    key={d}
                    className={`text-center text-xs font-extrabold uppercase ${
                      i === 0 || i === 6 ? "text-[#ff7c7c]" : "text-gray-500"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map(
                  (_, i) => (
                    <div key={`empty-${i}`} />
                  )
                )}

                {Array.from({ length: getDaysInMonth(currentDate) }).map(
                  (_, i) => {
                    const day = i + 1;
                    const evts = calendarEvents[day] || [];
                    const isToday =
                      day === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth();

                    return (
                      <div
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`
                                 calendar-day relative rounded-xl border flex flex-col items-center justify-start py-2 cursor-pointer
                                 ${
                                   isToday
                                     ? "bg-[#9c00e5]/20 border-[#9c00e5] shadow-[0_0_15px_rgba(156,0,229,0.2)]"
                                     : "bg-white/[0.02] border-white/5 hover:bg-white/[0.08] hover:border-white/20"
                                 }
                              `}
                      >
                        <span
                          className={`text-sm font-bold mb-1 ${
                            isToday
                              ? "text-[#9c00e5]"
                              : "text-gray-400 group-hover:text-white"
                          }`}
                        >
                          {day}
                        </span>

                        {/* DOTS (Chấm tròn chỉ thị) */}
                        <div className="flex flex-wrap justify-center gap-1 px-1">
                          {evts.map(
                            (e, idx) =>
                              idx < 4 && (
                                <div
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                                    e.type === "start"
                                      ? "bg-[#4db933]"
                                      : "bg-[#ff4d4d]"
                                  }`}
                                />
                              )
                          )}
                          {evts.length > 4 && (
                            <span className="text-[8px] text-gray-500 leading-none font-bold">
                              +
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="flex flex-col gap-6">
            {/* 1. Quick Actions */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CogIcon className="w-5 h-5 text-[#ffee00]" /> Thao tác nhanh
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/admin/create-teacher")}
                  className="p-4 bg-gradient-to-br from-[#3c90ff]/10 to-[#3c90ff]/5 border border-[#3c90ff]/20 rounded-2xl hover:border-[#3c90ff]/50 hover:shadow-[0_0_15px_rgba(60,144,255,0.2)] transition-all group flex flex-col items-center gap-2 text-center"
                >
                  <UsersIcon className="w-8 h-8 text-[#3c90ff] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-300 group-hover:text-white">
                    Thêm Giáo viên
                  </span>
                </button>
                <button
                  onClick={() => setShowCreateCourse(true)}
                  className="p-4 bg-gradient-to-br from-[#9c00e5]/10 to-[#9c00e5]/5 border border-[#9c00e5]/20 rounded-2xl hover:border-[#9c00e5]/50 hover:shadow-[0_0_15px_rgba(156,0,229,0.2)] transition-all group flex flex-col items-center gap-2 text-center"
                >
                  <BookOpenIcon className="w-8 h-8 text-[#9c00e5] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-300 group-hover:text-white">
                    Tạo Khóa học
                  </span>
                </button>
                <button
                  onClick={() => navigate("/admin/assign-courses")}
                  className="col-span-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-[#4db933]" />
                  <span className="font-bold text-sm text-gray-300 group-hover:text-white">
                    Quản lý Phân quyền
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* 2. Recent Activity (New Section) */}
            <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[#ff7c7c]" /> Hoạt động gần
                đây
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 max-h-[300px]">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9c00e5] to-[#3c90ff] flex items-center justify-center shrink-0 font-bold text-xs">
                        {act.users?.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          <span className="text-white font-bold">
                            {act.users?.full_name}
                          </span>{" "}
                          vừa được phân công khóa{" "}
                          <span className="text-[#3c90ff] font-bold">
                            {act.resource_type === "course"
                              ? rawCourses.find((c) => c.id == act.resource_id)
                                  ?.name || "Unknown"
                              : "Chương trình"}
                          </span>
                          .
                        </p>
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          {new Date(act.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">
                    Chưa có hoạt động nào.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
