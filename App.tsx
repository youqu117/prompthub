
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
        if (!parsed.viewMode) parsed.viewMode = 'grid';
        
        parsed.prompts = parsed.prompts.map((p: any) => ({
          ...p,
          history: p.history || [],
          tags: p.tags || []
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
      viewMode: 'grid'
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleAddPrompt = () => {
    const now = Date.now();
    const newPrompt: Prompt = {
      id: generateId(),
      title: '未命名提示词',
      content: '',
      description: '',
      category: state.activeCategory === '全部' ? '通用' : state.activeCategory,
      tags: [],
      variables: [],
      createdAt: now,
      updatedAt: now,
      history: []
    };
    setState(prev => ({ ...prev, prompts: [newPrompt, ...prev.prompts], selectedPromptId: newPrompt.id }));
    setIsEditorOpen(true);
  };

  const handleUpdatePrompt = (updated: Partial<Prompt>, shouldClose: boolean = true) => {
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => p.id === updated.id ? { ...p, ...updated, updatedAt: Date.now() } : p)
    }));
    if (shouldClose) {
      setIsEditorOpen(false);
    }
  };

  const handleDeletePrompt = (id: string) => {
    setState(prev => ({ ...prev, prompts: prev.prompts.filter(p => p.id !== id), selectedPromptId: null }));
    setIsEditorOpen(false);
  };

  const handleSelectPrompt = (id: string) => {
    setState(prev => {
      const isSame = prev.selectedPromptId === id;
      if (isSame) {
        setIsEditorOpen(false);
        return { ...prev, selectedPromptId: null };
      }
      setIsEditorOpen(true);
      return { ...prev, selectedPromptId: id };
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
    const content = state.prompts.map(p => {
      const historyJson = JSON.stringify(p.history || []);
      const tagsJson = JSON.stringify(p.tags || []);
      
      return `---
title: ${p.title}
category: ${p.category}
description: ${p.description}
id: ${p.id}
createdAt: ${p.createdAt}
updatedAt: ${p.updatedAt}
tags: ${tagsJson}
history: ${historyJson}
---

${p.content}

`;
    }).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptHub_Backup_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const promptBlocks = text.split('---').filter(b => b.trim().length > 0);
      const newPrompts: Prompt[] = [];
      const newCats = new Set(state.categories);

      for (let i = 0; i < promptBlocks.length; i += 2) {
        const metadataRaw = promptBlocks[i];
        const contentRaw = promptBlocks[i+1];
        if (!metadataRaw || !contentRaw) continue;

        const metadata: any = {};
        metadataRaw.split('\n').forEach(line => {
          const [key, ...val] = line.split(':');
          if (key && val) metadata[key.trim()] = val.join(':').trim();
        });

        if (metadata.title) {
          const now = Date.now();
          
          let parsedTags = [];
          let parsedHistory = [];
          
          try {
            if (metadata.tags && metadata.tags.trim().startsWith('[')) {
               parsedTags = JSON.parse(metadata.tags);
            } else if (metadata.tags) {
               parsedTags = metadata.tags.split(',').filter((t:string) => t);
            }

            if (metadata.history && metadata.history.trim().startsWith('[')) {
               parsedHistory = JSON.parse(metadata.history);
            }
          } catch (e) {
            console.warn("Error parsing metadata fields", e);
          }

          newPrompts.push({
            id: metadata.id || generateId(),
            title: metadata.title,
            category: metadata.category || '通用',
            description: metadata.description || '',
            content: contentRaw.trim(),
            tags: parsedTags,
            variables: [],
            createdAt: parseInt(metadata.createdAt) || now,
            updatedAt: parseInt(metadata.updatedAt) || now,
            history: parsedHistory
          });
          if (metadata.category) newCats.add(metadata.category);
        }
      }

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
    <div className="flex h-screen bg-white dark:bg-slate-950 font-sans text-[14px] transition-colors overflow-hidden">
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
            onSelectPrompt={handleSelectPrompt}
            onDeletePrompt={handleDeletePrompt}
            onAddNew={handleAddPrompt}
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
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
