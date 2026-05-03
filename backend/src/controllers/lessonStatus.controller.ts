import { Request, Response } from "express";
import * as StatusService from "../services/lessonStatus.service";

export const publishLesson = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Validate trước khi publish
    await StatusService.validateLessonBeforePublish(id);

    const result = await StatusService.setStatus(id, "published");

    res.json({ success: true, lesson: result });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const setDraft = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await StatusService.setStatus(id, "draft");
    res.json({ success: true, lesson: result });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const archiveLesson = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await StatusService.setStatus(id, "archived");
    res.json({ success: true, lesson: result });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};
