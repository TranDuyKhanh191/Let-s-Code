import { Request, Response } from "express";
import * as LessonOrderService from "../services/lessonOrder.service";

export const reorder = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const { table, order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order must be an array" });
    }

    await LessonOrderService.reorderBlocks(table, lessonId, order);

    res.json({ success: true });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};
