import { Request, Response } from "express";
import * as PreparationService from "../services/preparation.service";
import { PreparationSchema } from "../validators/preparation.validator";

export const upsert = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const data = PreparationSchema.parse(req.body);

    const result = await PreparationService.upsertPreparation(lessonId, data);
    res.json({ success: true, preparation: result });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);

    const result = await PreparationService.getPreparation(lessonId);
    res.json({ success: true, preparation: result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const patch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = PreparationSchema.partial().parse(req.body);

    const result = await PreparationService.patchPreparation(id, data);
    res.json({ success: true, preparation: result });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await PreparationService.deletePreparation(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
