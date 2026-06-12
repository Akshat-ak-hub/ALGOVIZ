import { useState, useCallback, useRef } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { ToastContext } from "../hooks/useToast";

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle,
    bg: "bg-[#3fb950]/10",
    border: "border-[#3fb950]/30",
    text: "text-[#e6edf3]",
    iconColor: "text-[#3fb950]",
  },
  error: {
    icon: XCircle,
    bg: "bg-[#f85149]/10",
    border: "border-[#f85149]/30",
    text: "text-[#e6edf3]",
    iconColor: "text-[#f85149]",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-[#d29922]/10",
    border: "border-[#d29922]/30",
    text: "text-[#e6edf3]",
    iconColor: "text-[#d29922]",
  },
  info: {
    icon: Info,
    bg: "bg-[#58a6ff]/10",
    border: "border-[#58a6ff]/30",
    text: "text-[#e6edf3]",
    iconColor: "text-[#58a6ff]",
  },
};

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove from DOM after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (message, variant = "info", duration = 3500) => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, message, variant, exiting: false }]);

      // Auto-dismiss
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
        delete timersRef.current[id];
      }, duration);

      return id;
    },
    [removeToast]
  );

  const dismissToast = useCallback(
    (id) => {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
      removeToast(id);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast container — fixed top-right */}
      <div className="fixed top-20 right-4 z-[999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const v = TOAST_VARIANTS[toast.variant] || TOAST_VARIANTS.info;
          const Icon = v.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-md
                ${v.bg} ${v.border}
                ${toast.exiting ? "toast-exit" : "toast-enter"}`}
            >
              <Icon size={18} className={`${v.iconColor} flex-shrink-0 mt-0.5`} />
              <span className={`text-sm font-semibold ${v.text} flex-grow leading-snug`}>
                {toast.message}
              </span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer mt-0.5"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
