import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  variant?: ToastVariant;
};

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />
};

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-slate-50 text-slate-700 border-slate-200'
};

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-6 bottom-6 z-[120] flex flex-col gap-2">
      {toasts.map((toast) => {
        const variant = toast.variant ?? 'info';
        return (
          <button
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 shadow-md text-sm font-semibold transition-all hover:shadow-lg ${variantClasses[variant]}`}
          >
            {iconMap[variant]}
            <span>{toast.message}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ToastStack;
