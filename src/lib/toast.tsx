'use client';

import * as React from 'react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

type ToastOptions = Omit<Toast, 'id'>;

type ToastContextType = {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'default', title, description, duration = 5000 }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  // Initialize global toast function
  useEffect(() => {
    initializeToast(addToast);
  }, [addToast]);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toaster() {
  const context = useContext(ToastContext);
  if (!context) return null; // don't throw error
  const { toasts, removeToast } = context;

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800'
              : toast.type === 'error'
              ? 'bg-red-100 text-red-800'
              : toast.type === 'warning'
              ? 'bg-yellow-100 text-yellow-800'
              : toast.type === 'info'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-white text-gray-800'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && (
                <p className="text-sm mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-current opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- GLOBAL TOAST FUNCTION ----------

let toastFunction: ToastContextType['addToast'] | null = null;

export function toast(options: ToastOptions) {
  if (toastFunction) {
    return toastFunction(options);
  }
  console.warn(
    'Toast not initialized. Make sure to wrap your app with <ToastProvider>'
  );
  return '';
}

export function initializeToast(addToast: ToastContextType['addToast']) {
  toastFunction = addToast;
}
