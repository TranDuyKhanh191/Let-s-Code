export interface Program {
  id?: number;
  name: string;
  slug?: string;
  short_description?: string | null;
  status?: "draft" | "published" | "archived";
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}
