
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
  cardColor?: string;
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
  activeTag: string | null;
  theme: 'light' | 'dark' | 'system';
  colorTheme: 'ocean' | 'emerald' | 'sunset' | 'slate';
  viewMode: ViewMode;
  textScale: number;
  sortMode: 'recent' | 'click' | 'manual';
  cardWidth: number;
  cardHeight: number;
}
