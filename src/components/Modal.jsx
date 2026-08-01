import { useLayoutEffect } from "react";
import { XIcon } from "./icons";

export default function Modal({ onClose, title, subtitle, children }) {
  useLayoutEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[340px] overflow-hidden rounded-2xl border border-white/[0.1] bg-ink-800 shadow-2xl shadow-black/60 sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-3.5 py-2.5 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-4 w-4 sm:h-6 sm:w-6" />
            <span className="font-display text-sm font-bold tracking-tight text-slate-100 sm:text-base">Cortex</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 sm:h-8 sm:w-8"
          >
            <XIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>
        </div>

        <div className="px-3.5 py-3.5 sm:px-5 sm:py-5">
          <h3 className="font-display text-[17px] font-bold tracking-tight text-slate-100 sm:text-lg">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400 sm:mt-1">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
