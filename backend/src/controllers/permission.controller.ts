import { Request, Response } from "express";
import * as permissionService from "../services/permission.service";

// Xem toàn bộ quyền
export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const { teacher_id, resource_type, status } = req.query;

        const filters: any = {};
        if (teacher_id) filters.teacher_id = Number(teacher_id);
        if (resource_type) filters.resource_type = resource_type;
        if (status) filters.status = status;

        const data = await permissionService.getAllAssignments(filters);

        res.json({ success: true, assignments: data });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

// Xem lịch sử cấp quyền
export const getAssignmentLogs = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.assignmentId);
        const logs = await permissionService.getAssignmentLogs(id);

        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const assign = async (req: Request, res: Response) => {
    try {
        const adminId = req.user!.id; // CHỈ ADMIN GỌI ĐƯỢC
        const {
            teacher_id,
            resource_type, // 'program' | 'course'
            resource_id,
            access_code,
            start_at,
            end_at,
            code_expires_at
        } = req.body;

        const assignment = await permissionService.createAssignment({
            teacher_id,
            resource_type,
            resource_id,
            access_code,
            start_at,
            end_at,
            code_expires_at,
            created_by_user_id: adminId
        });

        res.json({ success: true, assignment });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const changeStatus = async (req: Request, res: Response) => {
    try {
        const adminId = req.user!.id;
        const assignmentId = Number(req.params.id);
        const { status } = req.body; // 'pending' | 'active' | 'revoked'

        const updated = await permissionService.updateAssignmentStatus(
            assignmentId,
            status,
            adminId
        );

        res.json({ success: true, updated });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const myAssignments = async (req: Request, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const assignments = await permissionService.getActiveAssignmentsForTeacher(teacherId);

        res.json({ success: true, assignments });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};