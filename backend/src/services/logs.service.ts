// src/services/logs.service.ts
import { supabase } from "../config/supabase";

export const getAssignmentLogs = async (assignmentId: number) => {
  const { data, error } = await supabase
    .from("assignment_logs")
    .select(`
      id,
      action_type,
      created_at,
      change_details,
      users:users!assignment_logs_action_user_id_fkey(full_name, email)
    `)
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getSystemLogs = async () => {
  const { data, error } = await supabase
    .from("assignment_logs")
    .select(`
      id,
      action_type,
      created_at,
      change_details,
      users:users!assignment_logs_action_user_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data;
};
