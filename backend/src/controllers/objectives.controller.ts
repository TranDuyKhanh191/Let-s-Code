import { Request, Response } from "express";
import * as ObjectivesService from "../services/objectives.service";
import { ObjectivesSchema } from "../validators/objectives.validator";

export const upsert = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const parsed = ObjectivesSchema.parse(req.body);

    const result = await ObjectivesService.upsertObjectives(lessonId, parsed);
    res.json({ success: true, objectives: result });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getOneByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const objectives = await ObjectivesService.getObjectives(lessonId);
    res.json({ success: true, objectives });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(500).json({ success: false, error: e.message });
  }
};

export const patch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const parsed = ObjectivesSchema.partial().parse(req.body);
    const result = await ObjectivesService.patchObjectives(id, parsed);
    res.json({ success: true, objectives: result });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(400).json({ success: false, error: e.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await ObjectivesService.deleteObjectives(id);
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as Error;
    res.status(500).json({ success: false, error: e.message });
  }
};
