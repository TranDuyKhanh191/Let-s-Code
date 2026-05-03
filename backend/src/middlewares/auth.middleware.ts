import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";

export const authRequired = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Không có token" });

    try {
        const user = AuthService.verifyToken(token);
        (req as any).user = user;
        next();
    } catch {
        res.status(401).json({ error: "Token không hợp lệ" });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!roles.includes(user.role)) {
            return res.status(403).json({ error: "Không đủ quyền" });
        }

        next();
    };
};
