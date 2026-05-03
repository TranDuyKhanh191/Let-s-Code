// src/controllers/logs.controller.ts
import { Request, Response } from "express";
import * as LogsService from "../services/logs.service";

export const getAssignmentLogs = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const logs = await LogsService.getAssignmentLogs(id);
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const logs = await LogsService.getSystemLogs();
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};