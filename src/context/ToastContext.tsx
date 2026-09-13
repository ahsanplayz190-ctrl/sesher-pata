'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Heart, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'wishlist';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
        {toasts.map((toast) => {
          let bgClass = 'bg-zinc-900 text-white border-zinc-700';
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-950/95 text-emerald-100 border-emerald-800/80 shadow-emerald-950/20';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-950/95 text-rose-100 border-rose-800/80 shadow-rose-950/20';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          } else if (toast.type === 'wishlist') {
            bgClass = 'bg-rose-950/95 text-rose-100 border-rose-800/80 shadow-rose-950/20';
            icon = <Heart className="w-5 h-5 text-rose-400 fill-rose-400 shrink-0" />;
          } else if (toast.type === 'info') {
            bgClass = 'bg-amber-950/95 text-amber-100 border-amber-800/80 shadow-amber-950/20';
            icon = <Info className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 font-['Noto_Sans_Bengali',sans-serif] ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <p className="text-xs sm:text-sm font-medium leading-tight">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
