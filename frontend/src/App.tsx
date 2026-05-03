import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- AUTH PAGES ---
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage"; // Đã import ở đây

// --- HOME & TEACHER PAGES ---
import HomePage from "./pages/home/HomePage";
import ProgramSelectionPage from "./pages/teacher/ProgramSelectionPage";
import CoursesPage from "./pages/teacher/CoursesPage";
import CourseDetailPage from "./pages/teacher/LessonPage";
import LessonDetailPage from "./pages/teacher/LessonDetailPlayer";
import ProfilePage from "./pages/teacher/ProfilePage";

// --- ADMIN PAGES ---
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AssignCoursesPage from "./pages/admin/AssignCoursesPage";
import CreateTeacherPage from "./pages/admin/CreateTeacherPage";
import ManageTeachersPage from "./pages/admin/ManageTeachersPage";
import AdminLessonPage from "./pages/admin/AdminLessonPage";

import { useAuth } from "./context/AuthContext";
// import { i } from "framer-motion/client"; // Dòng này có vẻ thừa hoặc auto-import sai, nhưng tôi cứ để đó theo ý bạn

type AllowedRole = "admin" | "teacher";

type ProtectedProps = {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
};

const ProtectedRoute: React.FC<ProtectedProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role as AllowedRole)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/home" replace />;
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

const DefaultRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/teacher/home" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* ================= AUTH ================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* --- MỚI: Đã bổ sung route nhập OTP --- */}
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ================= TEACHER ROUTES ================= */}
      <Route
        path="/teacher/home"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/programs"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ProgramSelectionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CoursesPage />
          </ProtectedRoute>
        }
      />

      {/* Chi tiết khóa học (Danh sách bài học) */}
      <Route
        path="/teacher/courses/:id"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Chi tiết bài học (Player) */}
      <Route
        path="/teacher/lessons/:lessonId"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <LessonDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Trang Hồ sơ cá nhân (Profile) */}
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assign-courses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AssignCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-teacher"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateTeacherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-teachers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageTeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lessons"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLessonPage />
          </ProtectedRoute>
        }
      />
      {/* ================= DEFAULT ================= */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}