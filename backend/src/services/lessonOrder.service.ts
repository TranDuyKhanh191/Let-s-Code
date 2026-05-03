import { supabase } from "../config/supabase";

export const reorderBlocks = async (
  table: string,
  lessonId: number,
  blockIds: number[]
) => {
  // kiểm tra block có thuộc lesson không (security)
  const { data: rows, error: checkErr } = await supabase
    .from(table)
    .select("id")
    .eq("lesson_id", lessonId);

  if (checkErr) throw new Error(checkErr.message);

  const allowedIds = rows.map((r: any) => r.id);
  blockIds.forEach(id => {
    if (!allowedIds.includes(id)) {
      throw new Error(`Block ${id} không thuộc lesson ${lessonId}`);
    }
  });

  // update từng block theo vị trí trong array
  for (let i = 0; i < blockIds.length; i++) {
    const id = blockIds[i];
    const { error } = await supabase
      .from(table)
      .update({ sort_order: i })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  return true;
};
