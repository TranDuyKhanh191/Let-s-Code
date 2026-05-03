// src/controllers/dashboard.controller.ts
import { Request, Response } from "express";
import * as DashboardService from "../services/dashboard.service";

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
