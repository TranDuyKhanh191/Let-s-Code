import React, { useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/solid";

interface Props {
  lessonId: number;
}

/**
 * ⚠️ QUAN TRỌNG
 * Backend của bạn mount tại:
 * app.use("/api/lessons/objectives", objectivesRoutes);
 */
const API_BASE = "http://localhost:3000/api/lessons";

interface ObjectivesData {
  knowledge: string;
  thinking: string;
  skills: string;
  attitude: string;
}

/**
 * Parse JSON an toàn – tránh lỗi Unexpected token '<'
 */
async function parseJsonSafe(res: Response) {
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || "Server không trả JSON");
  }
  return res.json();
}

export default function LessonObjectives({ lessonId }: Props) {
  const [objId, setObjId] = useState<number | null>(null);
  const [data, setData] = useState<ObjectivesData>({
    knowledge: "",
    thinking: "",
    skills: "",
    attitude: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     GET OBJECTIVES (BẮT BUỘC)
     ========================= */
  useEffect(() => {
    if (!lessonId) return;

    const fetchObjectives = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE}/objectives/${lessonId}/objectives`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : ""
            }
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Không thể tải mục tiêu bài học");
        }

        const result = await parseJsonSafe(res);
        // Backend trả về { success, objectives }
        const obj = result.objectives;
        if (obj) {
          setObjId(obj.id);
          setData({
            knowledge: obj.knowledge ?? "",
            thinking: obj.thinking ?? "",
            skills: obj.skills ?? "",
            attitude: obj.attitude ?? ""
          });
        } else {
          setObjId(null);
          setData({
            knowledge: "",
            thinking: "",
            skills: "",
            attitude: ""
          });
        }
      } catch (err: any) {
        console.error("Fetch objectives error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectives();
  }, [lessonId]);

  /* =========================
     SAVE (POST hoặc PATCH)
     ========================= */
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      };

      let res: Response;

      if (objId) {
        // UPDATE
        res = await fetch(`${API_BASE}/objectives/${objId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(data)
        });
      } else {
        // CREATE
        res = await fetch(`${API_BASE}/objectives/${lessonId}`, {
          method: "POST",
          headers,
          body: JSON.stringify(data)
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Lỗi khi lưu mục tiêu");
      }

      const saved = await parseJsonSafe(res);

      // Sau POST, backend trả record → lưu id để PATCH lần sau
      if (!objId && saved?.id) {
        setObjId(saved.id);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save objectives error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "knowledge", label: "Kiến thức" },
    { key: "thinking", label: "Tư duy" },
    { key: "skills", label: "Kỹ năng" },
    { key: "attitude", label: "Thái độ" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircleIcon className="w-6 h-6 text-[#9c00e5]" />
          Mục tiêu bài học
        </h3>

        {success && (
          <span className="text-green-400 font-bold animate-pulse">
            Đã lưu thành công
          </span>
        )}
      </div>

      {error && (
        <div className="text-red-400 bg-red-900/20 p-2 rounded border border-red-500/50">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
              {f.label}
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none resize-none"
              value={(data as any)[f.key]}
              onChange={e =>
                setData(prev => ({ ...prev, [f.key]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-[#9c00e5] hover:bg-[#8000bd] text-white rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
