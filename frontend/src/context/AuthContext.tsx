import React, { createContext, useContext, useState, ReactNode } from "react";
import { api } from "../services/api";

export type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  fullName?: string;
  full_name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  login: (identifier: string, password: string) => Promise<any>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  const login = async (identifier: string, password: string) => {
    // 1. Log ra xem Frontend đang cầm dữ liệu gì
    console.log("🔥 [AuthContext] Chuẩn bị gửi:", { identifier, password });

    try {
      // 2. Gọi API với cấu hình header CƯỠNG CHẾ
      const res = await api.post("/auth/login", 
        { 
          identifier: identifier, 
          password: password 
        },
        {
          headers: { "Content-Type": "application/json" } // 👈 BẮT BUỘC PHẢI CÓ
        }
      );
      
      console.log("✅ [AuthContext] Thành công:", res.data);

      const { user: u, token } = res.data;
      const userData: User = {
        ...u,
        fullName: u.fullName || u.full_name || u.name, 
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;

    } catch (error: any) {
      // 3. Log chi tiết lỗi từ Backend trả về
      console.error("❌ [AuthContext] Lỗi:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};