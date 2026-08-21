import { useState } from "react";
import { createFolder } from "../services/folderService.js"
import { useToast } from "../hooks/useToast.jsx"

export default function FolderPopup({ onClose, onCreate }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const folder = await createFolder({ folderName: name.trim() });
      onCreate(folder);
      toast.success("Folder created");
      onClose();
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.08] bg-[#202024] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-200">New Folder</h3>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Folder Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="e.g. New Project" autoFocus
              className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none ring-1 ring-white/[0.06] transition-all duration-200 focus:ring-gold-400/40" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim() || submitting} className="rounded-lg bg-gold-400 px-4 py-2 text-xs font-medium text-[#17171a] transition-all duration-150 hover:bg-gold-300 disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? "Creating…" : "Create Folder"}
          </button>
        </div>
      </div>
    </>
  );
}
