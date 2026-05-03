import { Request, Response } from "express";
import * as MediaService from "../services/media.service";

export const upload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file upload" });
    }

    const media = await MediaService.uploadMedia(req.file);

    res.json({
      success: true,
      media
    });
  } catch (err: unknown) {
    res.status(500).json({
      error: (err as Error).message
    });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    await MediaService.deleteMedia(id);

    res.json({
      success: true
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message
    });
  }
};
