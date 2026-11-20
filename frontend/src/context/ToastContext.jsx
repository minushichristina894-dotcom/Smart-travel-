import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-slide-up shadow-lg rounded-xl border-l-4 px-4 py-3 flex items-start justify-between gap-3 ${
              toast.type === 'success'
                ? 'bg-white border-green-500 text-green-800'
                : toast.type === 'error'
                ? 'bg-white border-red-500 text-red-800'
                : toast.type === 'warning'
                ? 'bg-white border-yellow-500 text-yellow-800'
                : 'bg-white border-primary-500 text-primary-800'
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'Warning' : 'Info'}
              </p>
              <p className="text-sm font-medium mt-0.5">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
