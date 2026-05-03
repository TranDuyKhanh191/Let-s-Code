import { Request, Response } from "express";
import * as UserService from "../services/user.service";

export const createUser = async (req: Request, res: Response) => {
    try {
        const user = await UserService.createUser(req.body);
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await UserService.getAllUsers();
        res.json({ success: true, users });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const user = await UserService.updateUser(req.params.id, req.body);
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await UserService.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const { targetUserId, newPassword } = req.body;

        if (!targetUserId || !newPassword) {
            return res.status(400).json({ error: "Thiếu targetUserId hoặc newPassword" });
        }

        await UserService.resetUserPassword(targetUserId, newPassword);

        res.json({ success: true, message: "Admin đã đổi mật khẩu user thành công" });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

