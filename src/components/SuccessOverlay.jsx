import { useEffect } from "react";
import { CheckIcon } from "./icons";

export default function SuccessOverlay({ title, subtitle, onDone, duration = 4000 }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(timer);
  }, [onDone, duration]);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-toast-in">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-ink-800 px-8 py-10 text-center shadow-2xl shadow-black/60">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-8 ring-emerald-500/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/40">
            <CheckIcon className="h-6 w-6 text-white" />
          </span>
        </span>
        <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-slate-100">{title}</h3>
        {subtitle && <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>}
        <div className="mx-auto mt-6 h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ animation: `progress ${duration}ms linear forwards` }}
          />
        </div>
      </div>
    </div>
  );
}
