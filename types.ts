
export interface PromptVersion {
  id: string;
  timestamp: number;
  content: string;
  description?: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
  variables: string[];
  clickCount?: number;
  lastUsedAt?: number;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  isDraft?: boolean;
  history: PromptVersion[]; // 新增：版本历史记录
}

export type ViewMode = 'grid' | 'list';

export interface AppState {
  prompts: Prompt[];
  categories: string[];
  selectedPromptId: string | null;
  searchQuery: string;
  activeCategory: string;
  theme: 'light' | 'dark' | 'system';
  viewMode: ViewMode;
  textScale: number;
  sortMode: 'recent' | 'click' | 'manual';
}
