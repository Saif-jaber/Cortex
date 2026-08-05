import { useCallback, useRef, useState } from "react";
import Toast from "../components/Toast";
import { ToastContext } from "../context/ToastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, duration = 4000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ success: (m, d) => push("success", m, d), error: (m, d) => push("error", m, d), info: (m, d) => push("info", m, d) }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex flex-col items-center gap-2.5 px-4 pt-4 sm:px-6 sm:pt-6">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
