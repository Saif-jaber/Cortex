import { useEffect } from "react";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "./icons";

const VARIANTS = {
  success: {
    icon: CheckIcon,
    iconClass: "bg-emerald-500/15 text-emerald-400",
    ring: "ring-emerald-500/20",
    title: "Success",
  },
  error: {
    icon: AlertIcon,
    iconClass: "bg-red-500/15 text-red-400",
    ring: "ring-red-500/20",
    title: "Something went wrong",
  },
  info: {
    icon: InfoIcon,
    iconClass: "bg-gold-400/15 text-gold-300",
    ring: "ring-sky-500/20",
    title: "Heads up",
  },
};

export default function Toast({ toast, onDismiss }) {
  const variant = VARIANTS[toast.type] || VARIANTS.info;
  const Icon = variant.icon;

  useEffect(() => {
    if (!toast.duration) return;
    const timer = window.setTimeout(onDismiss, toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-white/[0.08] bg-ink-800/95 p-3.5 shadow-2xl shadow-black/50 ring-1 backdrop-blur-xl animate-toast-in ${variant.ring}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${variant.iconClass}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-slate-100">{variant.title}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-slate-400">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
