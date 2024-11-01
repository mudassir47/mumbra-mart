// components/ui/use-toast.ts
import { createContext, useContext, useState, ReactNode } from 'react';

type Toast = {
  title: string;
  description?: string;
};

type ToastContextType = {
  toast: (toast: Toast) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Toast) => {
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== newToast));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4">
        {toasts.map((t, index) => (
          <div key={index} className="bg-white p-2 rounded shadow-lg mb-2">
            <strong>{t.title}</strong>
            {t.description && <p>{t.description}</p>}
          </div>
        ))}
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
