
import React from 'react';
import { Search, Plus, Grid, LayoutGrid, StretchHorizontal, Trash2, Tag, Copy, Check, Pin } from 'lucide-react';
import { Prompt, ViewMode } from '../types';

interface PromptBrowserProps {
  prompts: Prompt[];
  activeCategory: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPromptId: string | null;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onSelectPrompt: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  onAddNew: () => void;
  onTogglePin: (id: string) => void;
  onReorderPrompt: (sourceId: string, targetId: string) => void;
  onCopyPrompt: (id: string) => void;
  cardWidth: number;
  cardHeight: number;
  sortMode: 'recent' | 'click' | 'manual';
  setSortMode: (mode: 'recent' | 'click' | 'manual') => void;
}

const PromptBrowser: React.FC<PromptBrowserProps> = ({ 
  prompts,
  activeCategory,
  searchQuery,
  setSearchQuery,
  selectedPromptId,
  viewMode,
  setViewMode,
  onSelectPrompt,
  onDeletePrompt,
  onAddNew,
  onTogglePin,
  onReorderPrompt,
  onCopyPrompt,
  cardWidth,
  cardHeight,
  sortMode,
  setSortMode
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const filtered = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === '全部' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });
  const sorted = React.useMemo(() => {
    if (sortMode === 'manual') {
      return filtered;
    }
    const next = [...filtered];
    next.sort((a, b) => {
      const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;
      if (sortMode === 'click') {
        const clickDiff = (b.clickCount || 0) - (a.clickCount || 0);
        if (clickDiff !== 0) return clickDiff;
      }
      return b.updatedAt - a.updatedAt;
    });
    return next;
  }, [filtered, sortMode]);

  const handleCopy = (e: React.MouseEvent, content: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onCopyPrompt(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeletePrompt(id);
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors relative text-sm">
      {/* Header Section */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">本地提示词库</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">
              {activeCategory} · 共计 {filtered.length} 项资源
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              title="网格视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              title="列表视图"
            >
              <StretchHorizontal className="w-4 h-4" />
            </button>
          </div>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as 'recent' | 'click' | 'manual')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
            title="排序方式"
          >
            <option value="recent">最近更新</option>
            <option value="click">复制次数</option>
            <option value="manual">手动拖拽</option>
          </select>
          <button 
            onClick={onAddNew}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-[14px] font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <Plus className="w-4.5 h-4.5" />
            新建工作流
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-5 py-2">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text"
            placeholder="搜索库中的提示词标题、功能描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] py-3 pl-11 pr-5 font-semibold text-slate-800 dark:text-white focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
        {filtered.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-20">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-[40px] flex items-center justify-center mb-6">
              <Grid className="w-16 h-16 text-slate-300 dark:text-slate-800" />
            </div>
            <p className="text-xl font-black text-slate-300 dark:text-slate-800 tracking-[0.3em] uppercase">库中暂无内容</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 pb-6" 
            : "flex flex-col gap-3 pb-6"
          }>
            {sorted.map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectPrompt(p.id)}
                draggable={sortMode === 'manual'}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggingId(p.id);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                onDragOver={(e) => {
                  if (sortMode === 'manual') {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverId(p.id);
                  }
                }}
                onDragLeave={() => {
                  if (sortMode === 'manual') {
                    setDragOverId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (sortMode === 'manual' && draggingId && draggingId !== p.id) {
                    onReorderPrompt(draggingId, p.id);
                  }
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                style={{ maxWidth: `${cardWidth * 360}px`, minHeight: `${cardHeight * 120}px` }}
                className={`transition-all duration-300 cursor-pointer relative group flex ${
                  viewMode === 'grid' 
                    ? 'flex-col p-4 rounded-[20px]' 
                    : 'flex-col p-4 rounded-[16px]'
                } ${draggingId === p.id ? 'opacity-60 scale-[0.98]' : ''} ${dragOverId === p.id ? 'ring-2 ring-brand-300/60' : ''} border ${
                  selectedPromptId === p.id 
                    ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-brand-500/10 z-10' 
                    : 'border-slate-200/50 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/40 hover:border-brand-300 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Badge Section */}
                <div className={`${viewMode === 'grid' ? 'mb-3 w-full' : 'mb-2 w-full'} flex justify-between items-center`}>
                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-widest shadow-sm">
                    {p.category}
                  </div>
                  {viewMode === 'grid' && (
                    <div className="flex items-center gap-2 relative z-20">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 px-2 py-1 rounded-lg bg-slate-100/60 dark:bg-slate-800/60" title="复制次数">
                        {p.clickCount || 0}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(p.id);
                        }}
                        className={`p-2 rounded-lg transition-all shadow-md ${p.pinned ? 'bg-brand-600 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'} active:scale-90`}
                        title={p.pinned ? '取消置顶' : '置顶'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleCopy(e, p.content, p.id)}
                        className={`p-2 rounded-lg transition-all shadow-md ${copiedId === p.id ? 'bg-emerald-500 text-white animate-bounce' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 active:scale-90'}`}
                      >
                        {copiedId === p.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, p.id)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition-all active:scale-90 shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-black text-slate-900 dark:text-white truncate group-hover:text-brand-600 transition-colors ${viewMode === 'grid' ? 'text-base mb-1.5' : 'text-sm mb-1'}`}>
                    {p.title || ''}
                  </h3>
                  {p.description && (
                    <p className={`text-slate-500 dark:text-slate-400 font-semibold leading-relaxed ${viewMode === 'grid' ? 'text-sm line-clamp-3' : 'text-sm line-clamp-2'}`}>
                      {p.description}
                    </p>
                  )}
                  
                  {/* Tags Display */}
                  {p.tags && p.tags.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-4">
                       {p.tags.slice(0, 4).map(tag => (
                         <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold">
                           <Tag className="w-3 h-3 mr-1" />
                           {tag}
                         </span>
                       ))}
                       {p.tags.length > 4 && <span className="text-[10px] text-slate-400 self-center">+{p.tags.length - 4}</span>}
                     </div>
                  )}
                  
                </div>

                {/* List Mode Actions */}
                {viewMode === 'list' && (
                  <div className="flex items-center gap-2.5 ml-auto pl-5 border-l border-slate-100 dark:border-slate-800 relative z-30">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 px-2 py-1 rounded-lg bg-slate-100/60 dark:bg-slate-800/60" title="复制次数">
                      {p.clickCount || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(p.id);
                      }}
                      className={`p-2.5 rounded-lg transition-all shadow-md ${p.pinned ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'} active:scale-90`}
                      title={p.pinned ? '取消置顶' : '置顶'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleCopy(e, p.content, p.id)}
                      className={`p-2.5 rounded-lg transition-all shadow-md ${copiedId === p.id ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 active:scale-90'}`}
                    >
                      {copiedId === p.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, p.id)}
                      className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition-all active:scale-90 shadow-md group"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptBrowser;
