import { useState } from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "knowledge", label: "Knowledge Base", icon: DatabaseIcon },
  { id: "sync", label: "Sync", icon: SyncIcon },
  { id: "analytics", label: "Analytics", icon: AnalyticsIcon },
];

const FOLDER_TREE = [
  {
    id: "general",
    name: "General Knowledge",
    count: 10,
    children: [
      {
        id: "onboarding",
        name: "Onboarding",
        count: 3,
        children: [
          { id: "sub1", name: "Subfolder 1", count: 5 },
          { id: "sub2", name: "Subfolder 2", count: 10 },
        ],
      },
      { id: "integrations", name: "Integrations", count: null },
      { id: "documents", name: "Documents", count: null },
    ],
  },
  { id: "design", name: "Onboarding Design", count: null },
  { id: "interviews", name: "Team Interviews", count: null },
];

const FOLDER_CARDS = [
  { id: 1, name: "General Knowledge", files: 10, icons: ["notion", "gdrive", "word"], updated: "2h ago", peek: "pdf", tint: "from-indigo-500/8" },
  { id: 2, name: "Onboarding", files: 3, icons: ["notion", "pdf"], updated: "5h ago", peek: "doc", tint: "from-emerald-500/8" },
  { id: 3, name: "Integrations", files: 7, icons: ["gdrive", "slack"], updated: "1d ago", peek: null, tint: "from-amber-500/8" },
  { id: 4, name: "Documents", files: 15, icons: ["word", "pdf", "gdrive"], updated: "3h ago", peek: "pdf", tint: "from-sky-500/8" },
  { id: 5, name: "Onboarding Design", files: 8, icons: ["figma", "notion"], updated: "6h ago", peek: "figma", tint: "from-pink-500/8" },
  { id: 6, name: "Team Interviews", files: 4, icons: ["pdf", "word"], updated: "2d ago", peek: null, tint: "from-violet-500/8" },
];

const FILES = [
  { id: 1, name: "product-spec.pdf", type: "pdf", size: "2.4 MB", date: "Jul 25", addedBy: { name: "Sarah Chen", email: "sarah@cortex.io", gradient: "from-blue-500 to-cyan-400" } },
  { id: 2, name: "onboarding-guide.docx", type: "word", size: "1.1 MB", date: "Jul 24", addedBy: { name: "James Wilson", email: "james@cortex.io", gradient: "from-emerald-500 to-teal-400" } },
  { id: 3, name: "api-integration.md", type: "markdown", size: "340 KB", date: "Jul 23", addedBy: { name: "Alex Rivera", email: "alex@cortex.io", gradient: "from-violet-500 to-purple-400" } },
  { id: 4, name: "team-standup-notes.pdf", type: "pdf", size: "890 KB", date: "Jul 22", addedBy: { name: "Maria Lopez", email: "maria@cortex.io", gradient: "from-amber-500 to-orange-400" } },
  { id: 5, name: "design-system-v2.fig", type: "figma", size: "5.7 MB", date: "Jul 21", addedBy: { name: "Sarah Chen", email: "sarah@cortex.io", gradient: "from-blue-500 to-cyan-400" } },
  { id: 6, name: "q3-report.docx", type: "word", size: "1.8 MB", date: "Jul 20", addedBy: { name: "James Wilson", email: "james@cortex.io", gradient: "from-emerald-500 to-teal-400" } },
];

function findFolderName(tree, id) {
  for (const f of tree) {
    if (f.id === id) return f.name;
    if (f.children) {
      const found = findFolderName(f.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("knowledge");
  const [activeTab, setActiveTab] = useState("folders");
  const [expandedFolders, setExpandedFolders] = useState(new Set(["general"]));
  const [selectedFolder, setSelectedFolder] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbOpen, setBreadcrumbOpen] = useState(false);

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedFolderName = findFolderName(FOLDER_TREE, selectedFolder) || "General Knowledge";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0e1a] font-sans text-slate-100">
      {/* Left Icon Rail */}
      <aside className="relative flex w-16 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#0d1220] py-5">
        <div className="mb-8 flex h-10 w-10 items-center justify-center">
          <img src="/logo.svg" alt="Cortex" className="h-7 w-7" />
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1.5">          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)} aria-label={item.label}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${isActive ? "bg-white/[0.08] text-slate-100" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"}`}>
                {isActive && <span className="absolute -left-[13px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-indigo-400" />}
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Second Sidebar */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0d1220] lg:flex">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-slate-200">Knowledge Base</h2>
          <div className="flex items-center gap-0.5">
            <button aria-label="Create new" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
              <PlusIcon className="h-4 w-4" />
            </button>
            <button aria-label="Toggle layout" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
              <GridIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06] transition-all duration-200 focus-within:bg-white/[0.06] focus-within:ring-indigo-500/30">
            <SearchIcon className="h-4 w-4 shrink-0 text-slate-500" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none" />
            <kbd className="hidden shrink-0 select-none items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:flex">
              <span className="text-[11px]">&#x2318;</span>K
            </kbd>
          </div>
        </div>

        <div className="flex gap-1 px-4 pb-3">
          {["Folders", "Tags"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${activeTab === tab.toLowerCase() ? "bg-white/[0.08] text-slate-100 shadow-sm ring-1 ring-white/[0.08]" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-300"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {FOLDER_TREE.map((folder) => (
            <FolderTreeNode key={folder.id} folder={folder} depth={0} expandedFolders={expandedFolders} selectedFolder={selectedFolder} onToggle={toggleFolder} onSelect={setSelectedFolder} />
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#0f1525] scroll-smooth">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0f1525]/80 backdrop-blur-xl px-6 py-3">
          <div className="relative">
            <button onClick={() => setBreadcrumbOpen(!breadcrumbOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 transition-all duration-150 hover:bg-white/[0.06]">
              <FolderSmallIcon className="h-4 w-4 text-slate-500" />
              {selectedFolderName}
              <ChevronDownIcon className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${breadcrumbOpen ? "rotate-180" : ""}`} />
            </button>
            {breadcrumbOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBreadcrumbOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1.5 w-60 overflow-hidden rounded-xl border border-white/[0.08] bg-[#182032] py-1.5 shadow-2xl shadow-black/40">
                  <div className="px-3 pb-2">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Folders</span>
                  </div>
                  {FOLDER_CARDS.map((f) => {
                    const isSel = selectedFolder === f.id;
                    return (
                      <button key={f.id} onClick={() => setBreadcrumbOpen(false)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.06]">
                        <FolderSmallIcon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="flex-1 truncate">{f.name}</span>
                        {isSel && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
              <BellIcon className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 ring-2 ring-[#0f1525]" />
            </button>
            <button aria-label="Settings" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
              <SettingsIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 h-5 w-px bg-white/[0.08]" />
            <button className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-all duration-150 hover:bg-white/[0.06]">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/20">SC</div>
              <span className="text-xs font-medium text-slate-300 hidden md:block">Sarah</span>
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 py-6">
          {/* Folders Section */}
          <section className="mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Folders</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 pr-6 scrollbar-hide">
              {FOLDER_CARDS.map((folder) => (
                <FolderCard key={folder.id} folder={folder} />
              ))}
            </div>
          </section>

          {/* Files Section */}
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Files</h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#131b2e]">
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center border-b border-white/[0.06] px-5 py-3">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Name</span>
                <span className="w-24 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Size</span>
                <span className="w-20 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Date</span>
                <span className="w-44 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Added By</span>
              </div>
              {FILES.map((file, i) => (
                <div key={file.id}
                  className={`group grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 transition-colors duration-150 hover:bg-white/[0.03] ${i < FILES.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                  <div className="flex items-center gap-3">
                    <FileTypeIcon type={file.type} />
                    <span className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">{file.name}</span>
                  </div>
                  <span className="w-24 text-right text-xs text-slate-500">{file.size}</span>
                  <span className="w-20 text-right text-xs text-slate-500">{file.date}</span>
                  <div className="flex w-44 items-center justify-end gap-2.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${file.addedBy.gradient} text-[9px] font-bold text-white shadow-sm`}>
                      {file.addedBy.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-xs text-slate-400">{file.addedBy.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function FolderTreeNode({ folder, depth, expandedFolders, selectedFolder, onToggle, onSelect }) {
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolder === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div className="overflow-hidden">
      <button onClick={() => { onSelect(folder.id); if (hasChildren) onToggle(folder.id); }}
        className={`group flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-sm transition-all duration-200 ${depth > 0 ? "ml-4 pl-3" : "pl-2"} ${isSelected ? "bg-white/[0.07] text-slate-100" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-300"}`}>
        {hasChildren ? (
          <ChevronIcon className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90 text-slate-500" : "text-slate-600"}`} />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <FolderSmallIcon className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isSelected ? "text-indigo-400" : "text-slate-600"}`} />
        <span className="flex-1 truncate">{folder.name}</span>
        {folder.count != null && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors duration-200 ${isSelected ? "bg-indigo-500/15 text-indigo-300" : "bg-white/[0.05] text-slate-500"}`}>
            {folder.count}
          </span>
        )}
      </button>
      {hasChildren && isExpanded && (
        <div className="relative ml-3">
          <div className="absolute bottom-1 left-[9px] top-1 w-px bg-gradient-to-b from-white/[0.08] to-transparent" />
          <div className="pl-1">
            {folder.children.map((child) => (
              <FolderTreeNode key={child.id} folder={child} depth={depth + 1} expandedFolders={expandedFolders} selectedFolder={selectedFolder} onToggle={onToggle} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FolderCard({ folder }) {
  return (
    <button className="group flex w-[174px] shrink-0 flex-col items-center rounded-xl border border-white/[0.06] bg-[#131b2e] p-5 transition-colors duration-150 hover:bg-[#182032]">
      <div className="relative mb-4">
        {folder.peek === "pdf" && (
          <div className="absolute -right-2 -top-1 flex h-7 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-[#1a2540] shadow-md">
            <svg className="h-3.5 w-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        )}
        {folder.peek === "doc" && (
          <div className="absolute -right-2 -top-1 flex h-7 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-[#1a2540] shadow-md">
            <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
              <path d="M8 13h2" /><path d="M8 17h6" />
            </svg>
          </div>
        )}
        {folder.peek === "figma" && (
          <div className="absolute -right-2 -top-1 flex h-7 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-[#1a2540] shadow-md">
            <svg className="h-3.5 w-3.5 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
            </svg>
          </div>
        )}
        <FolderLargeIcon className="h-[50px] w-[50px]" />
        <div className="absolute -bottom-1 -left-2 flex -space-x-1.5">
          {folder.icons.slice(0, 3).map((icon, i) => (
            <AppBadge key={i} type={icon} />
          ))}
        </div>
      </div>
      <span className="text-[13px] font-medium text-slate-200">{folder.name}</span>
      <span className="mt-0.5 text-[11px] text-slate-500">{folder.files} Files</span>
      <span className="mt-1 text-[10px] text-slate-600">{folder.updated}</span>
    </button>
  );
}

function AppBadge({ type }) {
  const config = {
    notion: { bg: "bg-slate-100", color: "text-slate-800", label: "N" },
    gdrive: { bg: "bg-slate-100", color: "text-slate-700", label: "G" },
    word: { bg: "bg-blue-100", color: "text-blue-700", label: "W" },
    pdf: { bg: "bg-red-100", color: "text-red-600", label: "P" },
    slack: { bg: "bg-purple-100", color: "text-purple-600", label: "S" },
    figma: { bg: "bg-pink-100", color: "text-pink-600", label: "F" },
  };
  const c = config[type] || config.notion;
  return (
    <div className={`flex h-5 w-5 items-center justify-center rounded-full border border-slate-600 text-[8px] font-bold shadow-sm ${c.bg} ${c.color}`}>
      {c.label}
    </div>
  );
}

function FileTypeIcon({ type }) {
  const colors = { pdf: "text-red-400", word: "text-blue-400", markdown: "text-slate-400", figma: "text-pink-400" };
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] ${colors[type] || "text-slate-400"}`}>
      <FileTypeSVG type={type} className="h-4 w-4" />
    </div>
  );
}

/* ─── SVG Icons ──────────────────────────────────────────────── */

function CortexLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function HomeIcon({ className, strokeWidth }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DatabaseIcon({ className, strokeWidth }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function SyncIcon({ className, strokeWidth }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

function AnalyticsIcon({ className, strokeWidth }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function GridIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FolderSmallIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
    </svg>
  );
}

function FolderLargeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <path d="M8 16a4 4 0 014-4h14l6 8h20a4 4 0 014 4v24a4 4 0 01-4 4H12a4 4 0 01-4-4V16z" fill="url(#folderGrad)" stroke="rgba(148,163,184,0.12)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 24h48v24a4 4 0 01-4 4H12a4 4 0 01-4-4V24z" fill="url(#folderGrad2)" stroke="rgba(148,163,184,0.12)" strokeWidth="2" strokeLinejoin="round" />
      <defs>
        <linearGradient id="folderGrad" x1="8" y1="12" x2="56" y2="32">
          <stop stopColor="#94a3b8" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="folderGrad2" x1="8" y1="24" x2="56" y2="56">
          <stop stopColor="#64748b" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FileTypeSVG({ type, className }) {
  const icons = {
    pdf: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    word: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M8 13h2" />
        <path d="M8 17h6" />
      </svg>
    ),
    markdown: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M7 15V9l2.5 2.5L12 9v6" />
        <path d="M17 15l-2.5-2.5" />
      </svg>
    ),
    figma: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
        <path d="M12 12a3 3 0 01-3 3H6a3 3 0 010-6h3" />
        <path d="M12 12a3 3 0 003 3h3a3 3 0 000-6h-3" />
      </svg>
    ),
  };
  return icons[type] || icons.pdf;
}
