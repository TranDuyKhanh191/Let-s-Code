import { Request, Response } from "express";
import * as ChallengeService from "../services/challenge.service";
import { ChallengeCreateSchema, ChallengePatchSchema } from "../validators/challenge.validator";

export const create = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const payload = ChallengeCreateSchema.parse(req.body);
    const challenge = await ChallengeService.createChallenge(lessonId, payload);
    res.json({ success: true, challenge });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = ChallengePatchSchema.parse(req.body);
    const challenge = await ChallengeService.updateChallenge(id, payload);
    res.json({ success: true, challenge });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await ChallengeService.deleteChallenge(id);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
};

export const getByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const challenges = await ChallengeService.getChallengesByLesson(lessonId);
    res.json({ success: true, challenges });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
};
