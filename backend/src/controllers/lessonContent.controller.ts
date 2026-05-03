import { Request, Response } from "express";
import * as ContentService from "../services/lessonContent.service";
import { LessonContentCreateSchema, LessonContentPatchSchema } from "../validators/lessonContent.validator";

export const create = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const payload = LessonContentCreateSchema.parse(req.body);
    const content = await ContentService.createContent(lessonId, payload);
    res.json({ success: true, content });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(400).json({ success: false, error: e.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = LessonContentPatchSchema.parse(req.body);
    const content = await ContentService.updateContent(id, payload);
    res.json({ success: true, content });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(400).json({ success: false, error: e.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await ContentService.deleteContent(id);
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const contents = await ContentService.getContentsByLesson(lessonId);
    res.json({ success: true, contents });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(500).json({ success: false, error: e.message });
  }
};

export const reorder = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const order = req.body.order as number[];
    if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array of ids" });

    await ContentService.reorderContents(lessonId, order);
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(500).json({ success: false, error: e.message });
  }
};
