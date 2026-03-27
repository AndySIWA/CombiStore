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
  /** Optional reference to remote origin if imported */
  remoteId?: string;
  version?: string;
}

export interface RemoteApp extends Omit<MiniApp, 'addedAt' | 'id'> {
  id: string; // Remote identifier
}

export interface RemoteRegistry {
  version: string;
  lastUpdated: number;
  apps: RemoteApp[];
}
