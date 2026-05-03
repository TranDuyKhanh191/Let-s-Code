import { supabase } from "../config/supabase";
import { slugify } from "./slugify";

export const generateUniqueSlug = async (
  table: string,
  title: string
): Promise<string> => {
  let base = slugify(title);
  let finalSlug = base;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) break;

    finalSlug = `${base}-${counter}`;
    counter++;
  }

  return finalSlug;
};
