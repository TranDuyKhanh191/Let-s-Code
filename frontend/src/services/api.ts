import axios from "axios";

// 🔥 QUAN TRỌNG: Backend của bạn đang chạy port 3000 (dựa vào file BE bạn gửi)
// Nếu bạn chạy backend port khác (vd 5000, 8000) thì sửa số 3000 thành số đó.
const BACKEND_URL = "http://localhost:3000"; 

export const api = axios.create({
  baseURL: BACKEND_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Log lỗi ra console để dễ debug
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
    } else {
        console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);