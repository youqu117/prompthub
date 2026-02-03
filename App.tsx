
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PromptBrowser from './components/PromptBrowser';
import PromptEditor from './components/PromptEditor';
import SettingsModal from './components/SettingsModal';
import { Prompt, AppState } from './types';
import { generateId } from './lib/utils';

const STORAGE_KEY = 'prompthub_pro_v5_data';
const DEFAULT_CATEGORIES = ['全部', '通用', '编程', '科研', '创意写作', '生产力'];

// 英文 -> 中文 映射，用于回退之前的更改
const CATEGORY_MAP_REVERT: Record<string, string> = {
  'All': '全部',
  'General': '通用',
  'Coding': '编程',
  'Research': '科研', 
  'Creative': '创意写作',
  'Productivity': '生产力'
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.viewMode) parsed.viewMode = 'list';
          if (!parsed.textScale) parsed.textScale = 0.95;
          if (!parsed.sortMode) parsed.sortMode = 'recent';
          if (!parsed.colorTheme) parsed.colorTheme = 'ocean';
          if (!parsed.cardWidth) parsed.cardWidth = 1;
          if (!parsed.cardHeight) parsed.cardHeight = 1;
        
          parsed.prompts = parsed.prompts.map((p: any) => ({
            ...p,
            history: p.history || [],
            tags: p.tags || [],
            pinned: p.pinned || false,
            clickCount: typeof p.clickCount === 'number' ? p.clickCount : 0,
            isDraft: false
          }));

        // 数据迁移：将英文分类恢复为中文
        const migrateCategory = (cat: string) => CATEGORY_MAP_REVERT[cat] || cat;

        parsed.categories = parsed.categories.map(migrateCategory);
        parsed.categories = Array.from(new Set(parsed.categories));
        
        // 确保包含默认分类
        if (parsed.categories.length === 0) parsed.categories = DEFAULT_CATEGORIES;

        parsed.prompts = parsed.prompts.map((p: any) => ({
          ...p,
          category: migrateCategory(p.category)
        }));

        parsed.activeCategory = migrateCategory(parsed.activeCategory);

        return parsed;
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    return {
      prompts: [],
      categories: DEFAULT_CATEGORIES,
      selectedPromptId: null,
      searchQuery: '',
      activeCategory: '全部',
      theme: 'system',
      colorTheme: 'ocean',
      viewMode: 'list',
      textScale: 0.95,
      sortMode: 'recent',
      cardWidth: 1,
      cardHeight: 1
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    root.dataset.theme = state.colorTheme;
  }, [state.theme]);

  useEffect(() => {
    window.document.documentElement.dataset.theme = state.colorTheme;
  }, [state.colorTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleAddPrompt = () => {
    const now = Date.now();
    const newPrompt: Prompt = {
      id: generateId(),
      title: '',
      content: '',
      description: '',
      category: state.activeCategory === '全部' ? '通用' : state.activeCategory,
      tags: [],
      variables: [],
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
      history: [],
      pinned: false,
      isDraft: true
    };
    setState(prev => ({ ...prev, prompts: [newPrompt, ...prev.prompts], selectedPromptId: newPrompt.id }));
    setIsEditorOpen(true);
  };

  const handleUpdatePrompt = (updated: Partial<Prompt>, shouldClose: boolean = true) => {
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => p.id === updated.id ? { ...p, ...updated, updatedAt: Date.now(), isDraft: false } : p)
    }));
    if (shouldClose) {
      setIsEditorOpen(false);
    }
  };

  const handleDeletePrompt = (id: string) => {
    setState(prev => ({ ...prev, prompts: prev.prompts.filter(p => p.id !== id), selectedPromptId: null }));
    setIsEditorOpen(false);
  };

  const handleTogglePin = (id: string) => {
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p)
    }));
  };

  const handleCopyPrompt = (id: string) => {
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => p.id === id ? { ...p, clickCount: (p.clickCount || 0) + 1 } : p)
    }));
  };

  const handleSelectPrompt = (id: string) => {
    setState(prev => {
      const isSame = prev.selectedPromptId === id;
      if (isSame) {
        setIsEditorOpen(false);
        return { ...prev, selectedPromptId: null };
      }
      setIsEditorOpen(true);
      return {
        ...prev,
        selectedPromptId: id
      };
    });
  };

  const handleReorderPrompt = (sourceId: string, targetId: string) => {
    setState(prev => {
      const sourceIndex = prev.prompts.findIndex(p => p.id === sourceId);
      const targetIndex = prev.prompts.findIndex(p => p.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        return prev;
      }
      const next = [...prev.prompts];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return { ...prev, prompts: next };
    });
  };

  const handleAddCategory = () => {
    let baseName = "新分类";
    let name = baseName;
    let counter = 1;
    while (state.categories.includes(name)) {
      name = `${baseName} ${counter++}`;
    }
    setState(prev => ({ ...prev, categories: [...prev.categories, name] }));
  };

  const handleDeleteCategory = (cat: string) => {
    setState(prev => {
      const newCats = prev.categories.filter(c => c !== cat);
      const newActive = prev.activeCategory === cat ? '全部' : prev.activeCategory;
      const newPrompts = prev.prompts.map(p => p.category === cat ? { ...p, category: '通用' } : p);
      return { ...prev, categories: newCats, activeCategory: newActive, prompts: newPrompts };
    });
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    if (!newName || oldName === '全部') return;
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c === oldName ? newName : c),
      activeCategory: prev.activeCategory === oldName ? newName : prev.activeCategory,
      prompts: prev.prompts.map(p => p.category === oldName ? { ...p, category: newName } : p)
    }));
  };

  const handleExport = () => {
    const headers = [
      'id',
      'title',
      'category',
      'description',
      'content',
      'tags',
      'createdAt',
      'updatedAt',
      'copyCount',
      'pinned',
      'history'
    ];
    const rows = state.prompts.map(p => [
      p.id,
      p.title,
      p.category,
      p.description,
      p.content,
      JSON.stringify(p.tags || []),
      p.createdAt,
      p.updatedAt,
      p.clickCount || 0,
      p.pinned ? '1' : '0',
      JSON.stringify(p.history || [])
    ]);
    const escapeCell = (value: string | number) => {
      const str = String(value ?? '');
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csv = [headers.join(','), ...rows.map(row => row.map(escapeCell).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptHub_Backup_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parseCsv = (input: string) => {
        const rows: string[][] = [];
        let current: string[] = [];
        let value = '';
        let inQuotes = false;
        for (let i = 0; i < input.length; i += 1) {
          const char = input[i];
          const next = input[i + 1];
          if (char === '"' && inQuotes && next === '"') {
            value += '"';
            i += 1;
            continue;
          }
          if (char === '"') {
            inQuotes = !inQuotes;
            continue;
          }
          if (char === ',' && !inQuotes) {
            current.push(value);
            value = '';
            continue;
          }
          if (char === '\n' && !inQuotes) {
            current.push(value);
            rows.push(current);
            current = [];
            value = '';
            continue;
          }
          if (char === '\r') continue;
          value += char;
        }
        if (value.length > 0 || current.length > 0) {
          current.push(value);
          rows.push(current);
        }
        return rows;
      };
      const rows = parseCsv(text);
      if (rows.length < 2) return;
      const headers = rows[0].map(h => h.trim());
      const newPrompts: Prompt[] = [];
      const newCats = new Set(state.categories);

      rows.slice(1).forEach(row => {
        const data: Record<string, string> = {};
        headers.forEach((header, idx) => {
          data[header] = row[idx] ?? '';
        });
        if (!data.title && !data.content) return;
        let parsedTags: string[] = [];
        let parsedHistory = [];
        try {
          if (data.tags) parsedTags = JSON.parse(data.tags);
        } catch {
          parsedTags = data.tags ? data.tags.split(',').filter(t => t) : [];
        }
        try {
          if (data.history) parsedHistory = JSON.parse(data.history);
        } catch {
          parsedHistory = [];
        }
        const now = Date.now();
        const category = data.category || '通用';
        newPrompts.push({
          id: data.id || generateId(),
          title: data.title || '',
          category,
          description: data.description || '',
          content: data.content || '',
          tags: parsedTags,
          variables: [],
          clickCount: Number(data.copyCount) || 0,
          createdAt: Number(data.createdAt) || now,
          updatedAt: Number(data.updatedAt) || now,
          history: parsedHistory,
          pinned: data.pinned === '1',
          isDraft: false
        });
        newCats.add(category);
      });

      setState(prev => ({
        ...prev,
        prompts: [...newPrompts, ...prev.prompts],
        categories: Array.from(newCats)
      }));
      alert(`成功导入 ${newPrompts.length} 条提示词。`);
    };
    reader.readAsText(file);
  };

  const activePrompt = state.prompts.find(p => p.id === state.selectedPromptId) || null;

  return (
    <div
      className="flex h-screen bg-white dark:bg-slate-950 font-sans transition-colors overflow-hidden"
      style={{ fontSize: `${state.textScale}rem` }}
    >
      <Sidebar 
        categories={state.categories}
        activeCategory={state.activeCategory}
        setActiveCategory={(cat) => setState(prev => ({ ...prev, activeCategory: cat }))}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onRenameCategory={handleRenameCategory}
        theme={state.theme}
        onToggleTheme={() => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : prev.theme === 'dark' ? 'system' : 'light' }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Layout Area: Browser + Editor Side-by-Side */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0">
           <PromptBrowser 
            prompts={state.prompts}
            activeCategory={state.activeCategory}
            searchQuery={state.searchQuery}
            setSearchQuery={(q) => setState(prev => ({ ...prev, searchQuery: q }))}
            selectedPromptId={state.selectedPromptId}
            viewMode={state.viewMode}
            setViewMode={(v) => setState(prev => ({ ...prev, viewMode: v }))}
            sortMode={state.sortMode}
            setSortMode={(mode) => setState(prev => ({ ...prev, sortMode: mode }))}
            onSelectPrompt={handleSelectPrompt}
            onDeletePrompt={handleDeletePrompt}
            onAddNew={handleAddPrompt}
            onTogglePin={handleTogglePin}
            onReorderPrompt={handleReorderPrompt}
            onCopyPrompt={handleCopyPrompt}
            cardWidth={state.cardWidth}
            cardHeight={state.cardHeight}
          />
        </div>

        <div 
          className={`absolute top-0 h-full transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col
            ${isEditorOpen ? 'right-0 w-[520px] sm:w-[560px] lg:w-[600px] xl:w-[640px] opacity-100' : '-right-[520px] sm:-right-[560px] lg:-right-[600px] xl:-right-[640px] w-[520px] sm:w-[560px] lg:w-[600px] xl:w-[640px] opacity-0 pointer-events-none'}
          `}
        >
          <div className="w-full h-full flex flex-col">
            <PromptEditor 
              isOpen={isEditorOpen}
              onClose={() => setIsEditorOpen(false)}
              prompt={activePrompt}
              categories={state.categories}
              onSave={handleUpdatePrompt}
              onDelete={handleDeletePrompt}
            />
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          onExport={handleExport}
          onImport={handleImport}
          textScale={state.textScale}
          onChangeTextScale={(value) => setState(prev => ({ ...prev, textScale: value }))}
          colorTheme={state.colorTheme}
          onChangeColorTheme={(value) => setState(prev => ({ ...prev, colorTheme: value }))}
          cardWidth={state.cardWidth}
          cardHeight={state.cardHeight}
          onChangeCardWidth={(value) => setState(prev => ({ ...prev, cardWidth: value }))}
          onChangeCardHeight={(value) => setState(prev => ({ ...prev, cardHeight: value }))}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
