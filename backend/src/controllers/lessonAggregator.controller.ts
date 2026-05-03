import { Request, Response } from "express";
import * as AggregatorService from "../services/lessonAggregator.service";

export const getFullLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    if (isNaN(lessonId)) return res.status(400).json({ error: "ID không hợp lệ" });

    const full = await AggregatorService.getFullLesson(lessonId);
    if (!full) return res.status(404).json({ error: "Lesson không tồn tại" });

    res.json({ success: true, data: full });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
};
