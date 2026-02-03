
import React, { useState, useEffect } from 'react';
import { Save, Sparkles, X, History } from 'lucide-react';
import { Prompt, PromptVersion } from '../types';
import { extractVariables, generateId } from '../lib/utils';
import { TAG_PRESETS, CARD_COLOR_PRESETS } from '../lib/presets';

interface PromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  categories: string[];
  onSave: (p: Partial<Prompt>, shouldClose?: boolean) => void;
  onDelete: (id: string) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ isOpen, onClose, prompt, categories, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('通用');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [history, setHistory] = useState<PromptVersion[]>([]);
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');
  const [clickCount, setClickCount] = useState(0);
  const [cardColor, setCardColor] = useState('default');

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setCategory(prompt.category);
      setDescription(prompt.description);
      setTags(prompt.tags || []);
      setHistory(prompt.history || []);
      setClickCount(prompt.clickCount || 0);
      setCardColor(prompt.cardColor || 'default');
      setInitialSnapshot(JSON.stringify({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        description: prompt.description,
        tags: prompt.tags || [],
        history: prompt.history || [],
        clickCount: prompt.clickCount || 0,
        cardColor: prompt.cardColor || 'default'
      }));
    }
  }, [prompt]);

  const currentSnapshot = JSON.stringify({
    title,
    content,
    category,
    description,
    tags,
    history,
    clickCount,
    cardColor
  });
  const isDirty = Boolean(prompt) && currentSnapshot !== initialSnapshot;

  const handleSave = () => {
    if (!prompt) return;
    if (!isDirty) {
      if (prompt.isDraft) {
        onDelete(prompt.id);
      }
      onClose();
      return;
    }
    onSave({ 
      id: prompt.id, 
      title, 
      content, 
      category, 
      description, 
      tags,
      history,
      clickCount,
      cardColor,
      variables: extractVariables(content) 
    }, true);
  };

  const toggleTag = (tagId: string) => {
    setTags(prev => (prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]));
  };

  const createSnapshot = () => {
    const newVersion: PromptVersion = {
      id: generateId(),
      timestamp: Date.now(),
      content: content,
      description: `Snapshot at ${new Date().toLocaleTimeString()}`
    };
    const updatedHistory = [...history, newVersion];
    setHistory(updatedHistory);
    // 自动保存快照但不关闭
    if (prompt) {
       onSave({ id: prompt.id, history: updatedHistory }, false);
    }
  };

  const restoreVersion = (v: PromptVersion) => {
    setContent(v.content);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      
      {/* Editor Header */}
      <div className="h-20 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
        <div className="space-y-1">
          <h3 className="text-lg font-black dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            提示词编辑器
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-7">Properties & Logic</p>
        </div>
        <button
          onClick={() => {
            if (prompt && !isDirty && prompt.isDraft) {
              onDelete(prompt.id);
            }
            onClose();
          }}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Editor Form Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        
        {/* Top Metadata - Compact */}
        <div className="space-y-4">
           <div className="space-y-2">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">标题</label>
             <input 
               type="text" 
               value={title} 
               onChange={e => setTitle(e.target.value)}
               className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3.5 font-bold text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
               placeholder="输入标题..."
             />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">分类</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3.5 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none"
                >
                  {categories.filter(c => c !== '全部').map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">标签 (点击选择)</label>
                 <div className="grid grid-cols-2 gap-2">
                   {TAG_PRESETS.map(tag => {
                     const isSelected = tags.includes(tag.id);
                     return (
                       <button
                         key={tag.id}
                         type="button"
                         onClick={() => toggleTag(tag.id)}
                         className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                           isSelected
                             ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                             : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-300'
                         }`}
                       >
                         <span className="flex items-center gap-2">
                           <span className="text-sm">{tag.icon}</span>
                           {tag.label}
                         </span>
                         {isSelected && <span className="text-[10px]">已选</span>}
                       </button>
                     );
                   })}
                 </div>
              </div>
           </div>

           <div className="space-y-2">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">卡片颜色</label>
             <div className="flex flex-wrap gap-2">
               {CARD_COLOR_PRESETS.map(color => {
                 const isActive = cardColor === color.id;
                 return (
                   <button
                     key={color.id}
                     type="button"
                     onClick={() => setCardColor(color.id)}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                       isActive
                         ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                         : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-300'
                     }`}
                   >
                     {color.label}
                   </button>
                 );
               })}
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">复制次数</label>
             <div className="flex items-center gap-2">
               <button
                 type="button"
                 onClick={() => setClickCount(prev => Math.max(0, prev - 1))}
                 className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                 -
               </button>
               <div className="flex-1 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3.5 font-semibold text-slate-700 dark:text-slate-200">
                 {clickCount}
               </div>
               <button
                 type="button"
                 onClick={() => setClickCount(prev => prev + 1)}
                 className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                 +
               </button>
             </div>
           </div>
           
           <div className="space-y-2">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">简介</label>
             <input 
               type="text" 
               value={description} 
               onChange={e => setDescription(e.target.value)}
               className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3.5 font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
               placeholder="功能描述..."
             />
           </div>
        </div>

        {/* Prompt Content */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Prompt 内容</label>
            <div className="flex gap-2">
               {/* Version Snapshots Buttons */}
               {history.length > 0 && (
                 <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   {history.map((v, idx) => {
                     const isActive = v.content === content;
                     return (
                       <button
                         key={v.id}
                         onClick={() => restoreVersion(v)}
                         title={`点击回溯: ${formatDate(v.timestamp)}`}
                         className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-black transition-all shadow-sm ${
                           isActive 
                             ? 'bg-brand-600 text-white scale-110 shadow-brand-500/30' 
                             : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-600'
                         }`}
                       >
                         {idx + 1}
                       </button>
                     );
                   })}
                 </div>
               )}
               <button 
                 onClick={createSnapshot}
                 className="flex items-center gap-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg text-[10px] font-bold hover:bg-brand-100 transition-colors"
               >
                 <History className="w-3 h-3" />
                 创建快照
               </button>
            </div>
          </div>
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)}
            className="w-full h-[420px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 resize-none shadow-inner focus:ring-2 focus:ring-brand-500/20 outline-none transition-all custom-scrollbar"
            placeholder="在此输入您的提示词..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4">
        {/* Deleted button was here */}
        <button 
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] ${
            isDirty
              ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
          disabled={!isDirty}
        >
          <Save className="w-4 h-4" />
          保存并关闭
        </button>
      </div>
    </div>
  );
};

export default PromptEditor;
