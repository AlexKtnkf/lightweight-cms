export interface Media {
  id: number;
  filename: string;
  original_filename: string;
  path: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  thumbnail_path?: string;
  webp_path?: string;
  alt_text?: string;
  uploaded_at: string;
}
