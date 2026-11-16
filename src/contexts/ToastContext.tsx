import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (title: string, variant?: ToastVariant, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, variant: ToastVariant = 'info', description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast]
  );

  const getStyle = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return {
          wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        };
      case 'error':
        return {
          wrapper: 'bg-rose-50 border-rose-200 text-rose-950',
          icon: <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        };
      case 'warning':
        return {
          wrapper: 'bg-amber-50 border-amber-200 text-amber-950',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        };
      default:
        return {
          wrapper: 'bg-slate-900 border-slate-800 text-white',
          icon: <Info className="w-4 h-4 text-[#ff7a1a] shrink-0 mt-0.5" />
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Accessible Floating Toast Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const st = getStyle(toast.variant);
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl border shadow-lg transition-all ${st.wrapper}`}
            >
              <div className="flex items-start gap-2.5">
                {st.icon}
                <div className="text-xs">
                  <p className="font-bold leading-snug">{toast.title}</p>
                  {toast.description && (
                    <p className="opacity-80 mt-0.5 leading-snug">{toast.description}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

