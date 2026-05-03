import { Request, Response } from "express";
import * as ModelService from "../services/model.service";
import { ModelSchema } from "../validators/model.validator";

export const create = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const data = ModelSchema.parse(req.body);

    const model = await ModelService.createModel(lessonId, data);
    res.json({ success: true, model });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = ModelSchema.partial().parse(req.body);

    const model = await ModelService.updateModel(id, data);
    res.json({ success: true, model });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await ModelService.deleteModel(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const models = await ModelService.getModelsByLesson(lessonId);
    res.json({ success: true, models });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
