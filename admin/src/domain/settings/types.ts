export interface Settings {
  id: number;
  site_title: string;
  site_tagline?: string;
  logo_media_id?: number;
  header_menu_links?: Array<{ label: string; url: string; order: number }>;
  footer_menu_links?: Array<{ label: string; url: string; order: number }>;
  footer_text?: string;
  social_links?: Array<{ platform: string; url: string; icon: string }>;
  allow_search_indexing?: boolean;
  contact_email?: string;
  updated_at: string;
}
