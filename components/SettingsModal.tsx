
import React, { useRef } from 'react';
import { X, Download, Upload, Info, FileText } from 'lucide-react';

interface SettingsModalProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onExport, onImport, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="px-12 py-10 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">系统偏好设置</h3>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">数据备份、迁移与全局维护</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X className="w-8 h-8 text-slate-400" />
          </button>
        </div>

        <div className="p-12 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-600" />
              <label className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">数据管理</label>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <button 
                onClick={onExport}
                className="flex flex-col items-center gap-4 p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[32px] hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                  <Download className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-800 dark:text-white">导出备份</span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Markdown 格式</span>
                </div>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-4 p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[32px] hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-800 dark:text-white">导入数据</span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase">支持解析 MD 文档</span>
                </div>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".md,.markdown" />
            </div>
          </section>

          <div className="p-8 bg-brand-50/50 dark:bg-brand-500/5 rounded-3xl border border-brand-100 dark:border-brand-500/10 flex gap-5 items-start">
            <Info className="w-6 h-6 text-brand-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-black text-brand-900 dark:text-brand-400 mb-1">导入说明</h4>
              <p className="text-sm font-medium text-brand-800/70 dark:text-brand-400/70 leading-relaxed">
                导入功能仅支持由本应用导出的 Markdown 格式文件。文件采用 YAML 前置元数据结构，请确保导入文件的格式匹配。
              </p>
            </div>
          </div>
        </div>

        <div className="p-12 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-slate-800 dark:bg-white dark:text-slate-950 text-white px-10 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95"
          >
            关闭面板
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
