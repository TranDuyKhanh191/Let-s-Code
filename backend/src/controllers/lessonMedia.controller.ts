import { Request, Response } from "express";
import {
  getLessonMedia,
  attachLessonMedia,
  removeLessonMedia,
  updateLessonMediaOrder
} from "../services/lessonMedia.service";
import { LessonMediaPurpose } from "../models/lessonMedia.model";

// ================= GET =================
export const getByLesson = async (req: Request, res: Response) => {
  const lessonId = Number(req.params.lessonId);
  const data = await getLessonMedia(lessonId);
  res.json(data);
};

// ================= CREATE =================
export const attach = async (req: Request, res: Response) => {
  const lessonId = Number(req.params.lessonId);
  const { mediaId, purpose, sortOrder } = req.body;

  if (purpose && !Object.values(LessonMediaPurpose).includes(purpose)) {
    return res.status(400).json({ error: "Invalid purpose" });
  }

  const data = await attachLessonMedia({
    lessonId,
    mediaId,
    purpose,
    sortOrder
  });

  res.status(201).json(data);
};

// ================= DELETE =================
export const remove = async (req: Request, res: Response) => {
  await removeLessonMedia(Number(req.params.id));
  res.json({ success: true });
};

// ================= ORDER =================
export const updateOrder = async (req: Request, res: Response) => {
  const data = await updateLessonMediaOrder(
    Number(req.params.id),
    req.body.sortOrder
  );
  res.json(data);
};
