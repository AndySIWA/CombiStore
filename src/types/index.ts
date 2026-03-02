export type SourceType = 'url' | 'html';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface MiniApp {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  sourceType: SourceType;
  /** URL string for 'url' type, raw HTML string for 'html' type */
  source: string;
  icon: string;
  addedAt: number;
}
