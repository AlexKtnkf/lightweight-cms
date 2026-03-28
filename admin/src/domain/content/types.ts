export interface Page {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  blocks: Block[];
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image_id?: number;
  image_media_id?: number;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  published_at?: string;
  blocks: Block[];
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image_id?: number;
}

export interface Block {
  block_type: BlockType;
  block_data: Record<string, any>;
}

export type BlockType = 
  | 'rich_text' 
  | 'hero' 
  | 'encart_principal' 
  | 'accroche'
  | 'question_reponse'
  | 'pin_grid'
  | 'numbered_cards'
  | 'lead_magnet'
  | 'contact_form';
