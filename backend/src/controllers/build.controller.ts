// src/controllers/build.controller.ts
import { Request, Response } from "express";
import * as BuildService from "../services/build.service";
import { BuildCreateSchema, BuildPatchSchema } from "../validators/build.validator";

export const create = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const payload = BuildCreateSchema.parse(req.body);

    const build = await BuildService.createBuild(lessonId, payload);
    res.json({ success: true, build });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = BuildPatchSchema.parse(req.body);

    const build = await BuildService.updateBuild(id, payload);
    res.json({ success: true, build });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await BuildService.deleteBuild(id);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
};

export const getByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const builds = await BuildService.getBuildsByLesson(lessonId);
    res.json({ success: true, builds });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
};

// Attach existing media to a build (admin)
// frontend should upload file first via /media/upload to get media_id
export const attachMedia = async (req: Request, res: Response) => {
  try {
    const buildId = Number(req.params.id);
    const { media_id, purpose, sort_order } = req.body;

    if (!media_id) return res.status(400).json({ error: "media_id required" });

    const { data, error } = await (require("../config/supabase").supabase)
      .from("content_media")
      .insert([{
        media_id,
        content_type: "lesson_build",
        content_id: buildId,
        purpose: purpose || "other",
        sort_order: sort_order || 0
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.json({ success: true, mapping: data });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
};
