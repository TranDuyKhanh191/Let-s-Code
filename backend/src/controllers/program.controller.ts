import { Request, Response } from "express";
import * as ProgramService from "../services/program.service";

// Lấy toàn bộ chương trình
export const getPrograms = async (_req: Request, res: Response) => {
    try {
        const programs = await ProgramService.getPrograms();
        res.json({ success: true, programs });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Lấy chương trình bằng ID
export const getProgramById = async (req: Request, res: Response) => {
    try {
        const programId = Number(req.params.id);

        const program = await ProgramService.getProgramById(programId);

        res.json({ success: true, program });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

// Tạo chương trình
export const createProgram = async (req: Request, res: Response) => {
    try {
        const program = await ProgramService.createProgram(req.body);
        res.json({ success: true, program });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Cập nhật chương trình
export const updateProgram = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const program = await ProgramService.updateProgram(id, req.body);
        res.json({ success: true, program });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Ẩn chương trình
export const hideProgram = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const program = await ProgramService.hideProgram(id);
        res.json({ success: true, program });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Hiện chương trình
export const showProgram = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const program = await ProgramService.showProgram(id);
        res.json({ success: true, program });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Xóa chương trình(hiện tại không được phép xóa chương trình nên chức năng này không được phép sử dụng)
export const deleteProgram = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await ProgramService.deleteProgram(id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
