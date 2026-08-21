import { useState } from "react";
import { getUploadUrl, uploadToR2, confirmUpload } from "../services/fileService.js";
import { useToast } from "../hooks/useToast.jsx";

function folderId(f) {
  return f?._id || f?.id;
}

function folderName(f) {
  return f?.folderName || f?.name;
}

export default function FilePopup({ folders, initialFolder, onClose, onAddFile }) {
  const toast = useToast();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(initialFolder || "");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || !selectedFolder || uploading) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of selectedFiles) {
        const { uploadUrl, fileKey } = await getUploadUrl({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
        await uploadToR2(uploadUrl, file);
        const saved = await confirmUpload({
          fileKey,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          folder: selectedFolder,
        });
        uploaded.push(saved);
      }
      onAddFile(uploaded);
      toast.success(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded`);
      onClose();
    } catch (err) {
      toast.error(err.message);
      setUploading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.08] bg-[#202024] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-200">Upload Files</h3>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Choose files from your computer</label>
            <div className="relative">
              <input type="file" id="file-upload" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="hidden" />
              <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-8 transition-all duration-200 hover:border-gold-400/30 hover:bg-white/[0.04]">
                <svg className="h-8 w-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm text-slate-400">{selectedFiles.length > 0 ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} selected` : "Click to browse files"}</span>
                {selectedFiles.length > 0 && <span className="text-xs text-slate-500">{selectedFiles.reduce((total, f) => total + f.size, 0) / 1024 / 1024 > 1 ? (selectedFiles.reduce((total, f) => total + f.size, 0) / 1024 / 1024).toFixed(1) + " MB" : (selectedFiles.reduce((total, f) => total + f.size, 0) / 1024).toFixed(1) + " KB"}</span>}
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto">
                {selectedFiles.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2.5 py-1.5">
                    <span className="truncate text-xs text-slate-300">{f.name}</span>
                    <button aria-label={`Remove ${f.name}`} onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))} className="shrink-0 text-slate-500 transition-colors hover:text-slate-300">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Destination Folder</label>
            <div className="relative">
              <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full appearance-none rounded-lg bg-white/[0.04] px-3 py-2 pr-9 text-sm text-slate-200 outline-none ring-1 ring-white/[0.06] transition-all duration-200 focus:ring-gold-400/40 [&>option]:bg-[#202024] [&>option]:text-slate-200">
                <option value="" disabled>Select a folder…</option>
                {folders.map((f) => (
                  <option key={folderId(f)} value={folderId(f)}>{folderName(f)}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {folders.length === 0 && (
              <p className="mt-1.5 text-xs text-slate-500">No folders yet — create one first.</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={selectedFiles.length === 0 || !selectedFolder || uploading} className="rounded-lg bg-gold-400 px-4 py-2 text-xs font-medium text-[#17171a] transition-all duration-150 hover:bg-gold-300 disabled:opacity-40 disabled:cursor-not-allowed">
            {uploading ? "Uploading…" : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ""}`.trim()}
          </button>
        </div>
      </div>
    </>
  );
}
