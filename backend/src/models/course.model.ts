export interface Course {
  id?: number;
  program_id: number;
  name: string;
  slug?: string;
  short_description?: string | null;
  age_group?: string | null;
  general_objectives?: string | null;
  course_code?: string | null;
  lesson_count?: number;
  status?: "draft" | "published" | "archived";
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}
