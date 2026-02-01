
import React, { useState } from 'react';
import { Plus, Tag, Settings, Sun, Moon, Monitor, Edit2, Trash2, Check, Command } from 'lucide-react';

interface SidebarProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (cat: string) => void;
  onRenameCategory: (old: string, updated: string) => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  categories, activeCategory, setActiveCategory, onAddCategory, onDeleteCategory, onRenameCategory, theme, onToggleTheme, onOpenSettings 
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  const handleAdd = () => {
    onAddCategory();
  };

  const startEdit = (cat: string) => {
    setEditingCategory(cat);
    setEditValue(cat);
  };

  const saveEdit = () => {
    if (editingCategory && editValue.trim() && editValue !== editingCategory) {
      onRenameCategory(editingCategory, editValue.trim());
    }
    setEditingCategory(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
  };

  // 处理删除，不需要 e.stopPropagation() 因为点击区域已经分离
  const handleDeleteTrigger = (cat: string) => {
    if (window.confirm(`确定要删除分类“${cat}”吗？该分类下的提示词将被移至“通用”。`)) {
      onDeleteCategory(cat);
    }
  };

  return (
    <div className="w-[320px] h-screen border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col p-6 space-y-8 flex-shrink-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <Command className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black dark:text-white tracking-tight">PromptHub</h1>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center justify-between px-2 mb-4">
          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">分类导航</span>
          <button 
            onClick={handleAdd} 
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-brand-600"
            title="新建分类"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {categories.map(cat => (
          <div key={cat} className="mb-1">
            {editingCategory === cat ? (
              <div className="w-full flex items-center gap-2 px-2 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-brand-200 dark:border-brand-500/30">
                <input 
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  onBlur={saveEdit}
                  className="flex-1 bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none min-w-0"
                />
                <button onClick={saveEdit} className="text-brand-600"><Check className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div
                className={`group flex items-center w-full rounded-xl transition-all ${
                  activeCategory === cat 
                    ? 'bg-brand-600 shadow-md' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 text-sm font-bold text-left outline-none bg-transparent border-none cursor-pointer overflow-hidden ${
                    activeCategory === cat 
                      ? 'text-white' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Tag className={`w-4 h-4 opacity-70 shrink-0 ${activeCategory === cat ? 'text-white' : ''}`} />
                  <span className="truncate">{cat}</span>
                </button>
                
                {cat !== '全部' && (
                  <div className={`flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity ${activeCategory === cat ? 'text-white' : 'text-slate-500'}`}>
                    <button 
                      onClick={() => startEdit(cat)}
                      className={`p-1.5 rounded-lg transition-colors ${activeCategory === cat ? 'hover:bg-brand-500 text-white/80 hover:text-white' : 'hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500'}`}
                      title="重命名"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTrigger(cat)}
                      className={`p-1.5 rounded-lg transition-colors ${activeCategory === cat ? 'hover:bg-brand-500 text-white/80 hover:text-white' : 'hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 text-slate-500'}`}
                      title="删除分类"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button onClick={onToggleTheme} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            <ThemeIcon className="w-4 h-4" />
            视觉主题
          </div>
          <span className="text-[10px] uppercase font-black opacity-50">{theme}</span>
        </button>
        <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <Settings className="w-4 h-4" />
          系统偏好设置
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
