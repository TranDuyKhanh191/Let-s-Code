export enum LessonMediaPurpose {
  COVER = "cover",
  INTRO = "intro", //video giới thiệu || lesson_models
  MAIN = "main", //lý thuyết || lesson_content
  GALLERY = "gallery", //slide hình ảnh 
  ATTACHMENT = "attachment", //vật liệu chuẩn bị || lesson_presentation
  OTHER = "other" //thử thách || lesson_challenge
}

export interface Media {
  id: number;
  url: string;
  mime_type: string | null;
  file_size: number | null;
  duration: number | null;
  thumbnail_url: string | null;
}

export interface LessonMedia {
  id: number;              // content_media.id
  purpose: LessonMediaPurpose;
  sort_order: number;
  media: Media;
}

export interface AttachLessonMediaInput {
  lessonId: number;
  mediaId: number;
  purpose?: LessonMediaPurpose;
  sortOrder?: number;
}
