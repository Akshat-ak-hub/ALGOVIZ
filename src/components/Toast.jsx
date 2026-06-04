import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    iconColor: "text-emerald-400",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  },
  error: {
    icon: XCircle,
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    iconColor: "text-rose-400",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    iconColor: "text-amber-400",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  },
  info: {
    icon: Info,
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    iconColor: "text-cyan-400",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
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
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl
                ${v.bg} ${v.border} ${v.glow}
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

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
