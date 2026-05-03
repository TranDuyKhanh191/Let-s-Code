import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const attachMedia = async (req: Request, res: Response) => {
  try {
    const { media_id, content_type, content_id, purpose, sort_order } = req.body;

    const { data, error } = await supabase
      .from("content_media")
      .insert({
        media_id,
        content_type,
        content_id,
        purpose: purpose || "other",
        sort_order: sort_order ?? 0
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.json({ success: true, mapping: data });

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
