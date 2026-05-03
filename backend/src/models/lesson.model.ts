export interface Lesson {
  id?: number;
  course_id: number;
  title: string;
  subtitle?: string | null;
  slug?: string;
  overview?: string | null;
  status?: "draft" | "published" | "archived";
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}
