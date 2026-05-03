import { Request, Response } from "express";
import * as AttachmentService from "../services/attachment.service";
import { AttachmentCreateSchema } from "../validators/attachment.validator";

export const add = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const payload = AttachmentCreateSchema.parse(req.body);

    const mapping = await AttachmentService.addAttachment(lessonId, payload);
    res.json({ success: true, attachment: mapping });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const mapId = Number(req.params.id);
    await AttachmentService.removeAttachment(mapId);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const attachments = await AttachmentService.getAttachmentsByLesson(lessonId);
    res.json({ success: true, attachments });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const reorder = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: "order must be array" });

    await AttachmentService.reorderAttachments(lessonId, order);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
};
