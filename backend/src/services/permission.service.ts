// services/permission.service.ts
import { supabase } from "../config/supabase";
import bcrypt from "bcryptjs";

type ResourceType = "program"|"course";

export const getAllAssignments = async (filters: any) => {
    let query = supabase.from("assignments").select(`
        id,
        teacher_id,
        resource_type,
        resource_id,
        status,
        code_expires_at,
        created_by_user_id,
        created_at,
        updated_at,
        start_at,
        end_at,
        users!assignments_teacher_id_fkey(full_name, email),
        created_by:users!assignments_created_by_user_id_fkey(full_name, email)
    `);

    // Thêm điều kiện lọc nếu có
    Object.keys(filters).forEach((key) => {
        query = query.eq(key, filters[key]);
    });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return data;
};

export const getAssignmentLogs = async (assignmentId: number) => {
    const { data, error } = await supabase
        .from("assignment_logs")
        .select(`
            id,
            action_user_id,
            action_type,
            change_details,
            created_at,
            start_at,
            end_at,
            users:users!assignment_logs_action_user_id_fkey(full_name, email)
        `)
        .eq("assignment_id", assignmentId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

export const createAssignment = async (opts: {
  teacher_id: number;
  resource_type: ResourceType;
  resource_id: number;
  access_code?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  code_expires_at?: string | null;
  created_by_user_id: number;
}) => {
  const {
    teacher_id, resource_type, resource_id,
    access_code, start_at, end_at, code_expires_at, created_by_user_id
  } = opts;

  const access_code_hash = access_code ? await bcrypt.hash(access_code, 12) : null;

  const { data, error } = await supabase
    .from("assignments")
    .insert([{
      teacher_id,
      resource_type,
      resource_id,
      access_code_hash,
      start_at,
      end_at,
      code_expires_at,
      status: "pending",
      created_by_user_id
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // log creation
  await supabase.from("assignment_logs").insert([{
    assignment_id: data.id,
    action_user_id: created_by_user_id,
    action_type: "create",
    change_details: JSON.stringify(data)
  }]);

  return data;
};

export const updateAssignmentStatus = async (assignmentId: number, status: "active"|"revoked"|"pending", adminUserId: number) => {
  const { data: before } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .single();

  const { data, error } = await supabase
    .from("assignments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("assignment_logs").insert([{
    assignment_id: assignmentId,
    action_user_id: adminUserId,
    action_type: `status:${status}`,
    change_details: JSON.stringify({ before, after: data })
  }]);

  return data;
};

export const getActiveAssignmentsForTeacher = async (teacher_id: number) => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("teacher_id", teacher_id)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return data;
};

export const getAssignmentById = async (id: number) => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Kiểm tra access_code nếu cần
export const verifyAccessCode = async (assignmentId: number, plainCode: string) => {
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment || !assignment.access_code_hash) return false;
  const ok = await bcrypt.compare(plainCode, assignment.access_code_hash);
  return ok;
};

