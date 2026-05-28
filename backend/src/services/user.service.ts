import { supabase } from "../config/supabase";
import bcrypt from "bcryptjs";

const TABLE = "users";

export const createUser = async (data: any) => {
    // Hash mật khẩu
    const hashed = await bcrypt.hash(data.password, 10);

    const { data: user, error } = await supabase
        .from(TABLE)
        .insert({
            username: data.username,
            email: data.email,
            password: hashed,
            full_name: data.full_name,
            role: data.role || "teacher",
        })
        .select("*")
        .single();

    if (error) throw new Error(error.message);
    return user;
};

export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from(TABLE)
        .select("id, username, email, full_name, role, created_at");

    if (error) throw new Error(error.message);
    return data;
};

export const updateUser = async (id: string, body: any) => {
    // Nếu có password mới → hash lại
    let payload = { ...body };

    if (body.password) {
        payload.password = await bcrypt.hash(body.password, 10);
    }

    const { data, error } = await supabase
        .from(TABLE)
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const deleteUser = async (id: string) => {
    // Xoá các log do user này thực hiện hoặc liên quan đến assignment của user này
    const { data: assignments } = await supabase
        .from("assignments")
        .select("id")
        .or(`teacher_id.eq.${id},created_by_user_id.eq.${id}`);

    const assignmentIds = assignments?.map(a => a.id) || [];

    if (assignmentIds.length > 0) {
        await supabase
            .from("assignment_logs")
            .delete()
            .in("assignment_id", assignmentIds);
            
        await supabase
            .from("assignments")
            .delete()
            .in("id", assignmentIds);
    }

    await supabase
        .from("assignment_logs")
        .delete()
        .eq("action_user_id", id);

    // Sau khi xoá hết khoá ngoại, xoá user
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
};

export const resetUserPassword = async (targetUserId: number, newPassword: string) => {
    // 1. Kiểm tra user tồn tại
    const { data: user, error: findErr } = await supabase
        .from(TABLE)
        .select("id")
        .eq("id", targetUserId)
        .single();

    if (findErr || !user) {
        throw new Error("User không tồn tại");
    }

    // 2. Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);

    // 3. Cập nhật mật khẩu
    const { error: updateErr } = await supabase
        .from(TABLE)
        .update({ password: hashed })
        .eq("id", targetUserId);

    if (updateErr) {
        throw new Error(updateErr.message);
    }

    return true;
};
