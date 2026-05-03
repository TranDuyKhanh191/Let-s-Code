// src/services/dashboard.service.ts
import { supabase } from "../config/supabase";

export const getDashboardStats = async () => {
  const count = async (table: string, filter: any = {}) => {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    Object.keys(filter).forEach(k => query = query.eq(k, filter[k]));
    const { count: c } = await query;
    return c ?? 0;
  };

  return {
    programs: await count("programs"),
    courses: await count("courses"),
    lessons: await count("lessons"),
    teachers: await count("users", { role: "teacher" }),
    active_assignments: await count("assignments", { status: "active" }),

    lesson_status: {
      draft: await count("lessons", { status: "draft" }),
      published: await count("lessons", { status: "published" }),
      archived: await count("lessons", { status: "archived" })
    },

    media_count: await count("media")
  };
};
