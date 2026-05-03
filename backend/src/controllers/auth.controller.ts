import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, username, identifier, password } = req.body;
        const id = identifier || email || username;

        const result = await AuthService.login(id, password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const result = await AuthService.forgotPassword(email);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

export const resetPasswordWithOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                error: "Thiếu email, otp hoặc mật khẩu mới"
            });
        }

        const result = await AuthService.resetPasswordWithOTP(
            email,
            otp,
            newPassword
        );

        res.json(result);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};


export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        const result = await AuthService.resetPassword(token, newPassword);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};
