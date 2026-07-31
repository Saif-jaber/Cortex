import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home", mobile: "Home", icon: HomeIcon },
  { id: "knowledge", label: "Knowledge Base", mobile: "Knowledge", icon: DatabaseIcon },
  { id: "chat", label: "AI Chat", mobile: "Chat", icon: ChatIcon },
  { id: "analytics", label: "Analytics", mobile: "Analytics", icon: AnalyticsIcon },
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

const DEFAULT_FOLDER_CARDS = [
  { id: 1, name: "General Knowledge", files: 10, updated: "2h ago", peek: "pdf", tint: "from-indigo-500/8" },
  { id: 2, name: "Onboarding", files: 3, updated: "5h ago", peek: "doc", tint: "from-emerald-500/8" },
  { id: 3, name: "Integrations", files: 7, updated: "1d ago", peek: null, tint: "from-amber-500/8" },
  { id: 4, name: "Documents", files: 15, updated: "3h ago", peek: "pdf", tint: "from-sky-500/8" },
  { id: 5, name: "Onboarding Design", files: 8, updated: "6h ago", peek: "figma", tint: "from-pink-500/8" },
  { id: 6, name: "Team Interviews", files: 4, updated: "2d ago", peek: null, tint: "from-violet-500/8" },
];

const DEFAULT_FILES = [
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

export default function Dashboard({ onExitHome }) {
  const [activeNav, setActiveNav] = useState("knowledge");
  const [activeTab, setActiveTab] = useState("folders");
  const [expandedFolders, setExpandedFolders] = useState(new Set(["general"]));
  const [selectedFolder, setSelectedFolder] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbOpen, setBreadcrumbOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi! I'm Cortex AI. How can I help you today?" }]);
  const [chatInput, setChatInput] = useState("");
  const [showPopup, setShowPopup] = useState(null);
  const [folderCards, setFolderCards] = useState(DEFAULT_FOLDER_CARDS);
  const [files, setFiles] = useState(DEFAULT_FILES);

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const handleSelectFolder = (id) => {
    setSelectedFolder(id);
    setSidebarOpen(false);
  };

  const selectedFolderName = findFolderName(FOLDER_TREE, selectedFolder) || "General Knowledge";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0e1a] font-sans text-slate-100">
      {/* Left Icon Rail */}
      <aside className="relative hidden w-14 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#0d1220] py-5 md:flex sm:w-16">
        <div className="mb-8 flex h-10 w-10 items-center justify-center">
          {onExitHome ? (
            <button onClick={onExitHome} aria-label="Back to home" title="Back to home" className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]">
              <img src="/logo.svg" alt="Cortex" className="h-7 w-7" />
            </button>
          ) : (
            <img src="/logo.svg" alt="Cortex" className="h-7 w-7" />
          )}
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
        <SidebarPanel
          closeButton={null}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          expandedFolders={expandedFolders}
          selectedFolder={selectedFolder}
          onToggle={toggleFolder}
          onSelect={handleSelectFolder}
        />
      </aside>

      {/* Main Content */}
      <main className={`flex flex-1 flex-col bg-[#0f1525] ${activeNav === "chat" ? "overflow-hidden" : "overflow-y-auto scroll-smooth"}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0f1525]/80 backdrop-blur-xl px-2 sm:px-6 py-3">
          <div className="relative flex min-w-0 items-center gap-1">
            <button onClick={() => setSidebarOpen(true)} aria-label="Open navigation" aria-expanded={sidebarOpen}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200 lg:hidden">
              <MenuIcon className="h-4.5 w-4.5" />
            </button>
            <button onClick={() => setBreadcrumbOpen(!breadcrumbOpen)}
              className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-200 transition-all duration-150 hover:bg-white/[0.06]">
              <FolderSmallIcon className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate max-w-[90px] sm:max-w-[200px] md:max-w-none">{selectedFolderName}</span>
              <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${breadcrumbOpen ? "rotate-180" : ""}`} />
            </button>
            {breadcrumbOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBreadcrumbOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1.5 w-60 overflow-hidden rounded-xl border border-white/[0.08] bg-[#182032] py-1.5 shadow-2xl shadow-black/40">
                  <div className="px-3 pb-2">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Folders</span>
                  </div>
                  {folderCards.map((f) => {
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
            <button aria-label="Settings" className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200 sm:flex">
              <SettingsIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 hidden h-5 w-px bg-white/[0.08] sm:block" />
            <button className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-all duration-150 hover:bg-white/[0.06]">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/20">SC</div>
              <span className="text-xs font-medium text-slate-300 hidden md:block">Sarah</span>
            </button>
          </div>
        </div>

        {activeNav === "chat" ? (
          <ChatPage messages={messages} setMessages={setMessages} chatInput={chatInput} setChatInput={setChatInput} />
        ) : (
          <div className="flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-6">
            {/* Folders Section */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Folders</h3>
                <button onClick={() => setShowPopup("folder")} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
                  <PlusIcon className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
                {folderCards.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </section>

            {/* Files Section */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Files</h3>
                <button onClick={() => setShowPopup("file")} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
                  <PlusIcon className="h-3.5 w-3.5" /> Add
                </button>
              </div>

              <div className="space-y-2 md:hidden">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#131b2e] px-3.5 py-3 transition-colors duration-150 hover:bg-[#182032]">
                    <FileTypeIcon type={file.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{file.size} · {file.date}</p>
                    </div>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${file.addedBy.gradient} text-[9px] font-bold text-white shadow-sm`}>
                      {file.addedBy.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-white/[0.06] bg-[#131b2e] md:block">
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center border-b border-white/[0.06] px-5 py-3">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Name</span>
                  <span className="w-24 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Size</span>
                  <span className="w-20 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Date</span>
                  <span className="w-28 sm:w-44 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Added By</span>
                </div>
                {files.map((file, i) => (
                  <div key={file.id}
                    className={`group grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 transition-colors duration-150 hover:bg-white/[0.03] ${i < files.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <FileTypeIcon type={file.type} />
                      <span className="truncate text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">{file.name}</span>
                    </div>
                    <span className="w-24 text-right text-xs text-slate-500">{file.size}</span>
                    <span className="w-20 text-right text-xs text-slate-500">{file.date}</span>
                    <div className="flex w-28 sm:w-44 items-center justify-end gap-2.5">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${file.addedBy.gradient} text-[9px] font-bold text-white shadow-sm`}>
                        {file.addedBy.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="hidden sm:block text-xs text-slate-400">{file.addedBy.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {showPopup && <Popup type={showPopup} onClose={() => setShowPopup(null)} onAddFolder={(name) => setFolderCards((prev) => [...prev, { id: Date.now(), name, files: 0, updated: "just now", peek: null, tint: "from-indigo-500/8" }])} onAddFile={(file) => setFiles((prev) => [...prev, { id: Date.now(), name: file.name, type: file.name.split(".").pop().toLowerCase(), size: (file.size / 1024).toFixed(1) + " KB", date: "just now", addedBy: { name: "Sarah Chen", email: "sarah@cortex.io", gradient: "from-blue-500 to-cyan-400" } }])} />}
      </main>

      {/* Mobile / Tablet Sidebar Drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div aria-hidden="true"
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)} />
        <aside aria-label="Knowledge base navigation" aria-hidden={!sidebarOpen}
          style={{ transition: "transform 300ms cubic-bezier(0.32, 0.72, 0.35, 1), visibility 300ms" }}
          className={`absolute left-0 top-0 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-white/[0.06] bg-[#0d1220] shadow-2xl shadow-black/50 ${sidebarOpen ? "visible translate-x-0" : "invisible -translate-x-full"}`}>
          <SidebarPanel
            closeButton={
              <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
                <XIcon className="h-4 w-4" />
              </button>
            }
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            expandedFolders={expandedFolders}
            selectedFolder={selectedFolder}
            onToggle={toggleFolder}
            onSelect={handleSelectFolder}
          />
        </aside>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav aria-label="Main navigation" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-white/[0.06] bg-[#0d1220]/90 backdrop-blur-xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button key={item.id} onClick={() => setActiveNav(item.id)} aria-label={item.label}
              className={`group flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 transition-colors duration-200 ${isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}>
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              <span className={`text-[10px] font-medium ${isActive ? "text-indigo-300" : "text-slate-500"}`}>{item.mobile}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarPanel({ closeButton, activeTab, setActiveTab, searchQuery, setSearchQuery, expandedFolders, selectedFolder, onToggle, onSelect }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-slate-200">Knowledge Base</h2>
        <div className="flex items-center gap-0.5">
          <button aria-label="Create new" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
            <PlusIcon className="h-4 w-4" />
          </button>
          <button aria-label="Toggle layout" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
            <GridIcon className="h-4 w-4" />
          </button>
          {closeButton}
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
          <FolderTreeNode key={folder.id} folder={folder} depth={0} expandedFolders={expandedFolders} selectedFolder={selectedFolder} onToggle={onToggle} onSelect={onSelect} />
        ))}
      </div>
    </>
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
    <button className="group flex w-full flex-col items-center rounded-xl border border-white/[0.06] bg-[#131b2e] p-4 transition-colors duration-150 hover:bg-[#182032] sm:p-5">
      <div className="relative mb-3 sm:mb-4">
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
      </div>
      <span className="text-[13px] font-medium text-slate-200">{folder.name}</span>
      <span className="mt-0.5 text-[11px] text-slate-500">{folder.files} Files</span>
      <span className="mt-1 text-[10px] text-slate-600">{folder.updated}</span>
    </button>
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

function ChatIcon({ className, strokeWidth }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="14" y2="13" />
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

function MenuIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function Popup({ type, onClose, onAddFolder, onAddFile }) {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = () => {
    if (type === "folder") {
      if (!name.trim()) return;
      onAddFolder(name.trim());
      onClose();
    } else {
      if (!selectedFile) return;
      onAddFile(selectedFile);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-40 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.08] bg-[#182032] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-200">{type === "folder" ? "New Folder" : "Upload File"}</h3>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          {type === "folder" ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Folder Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="e.g. New Project" autoFocus
                className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none ring-1 ring-white/[0.06] transition-all duration-200 focus:ring-indigo-500/30" />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Choose a file from your computer</label>
              <div className="relative">
                <input type="file" id="file-upload" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
                <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-8 transition-all duration-200 hover:border-indigo-500/30 hover:bg-white/[0.04]">
                  <svg className="h-8 w-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-sm text-slate-400">{selectedFile ? selectedFile.name : "Click to browse files"}</span>
                  {selectedFile && <span className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>}
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={type === "folder" ? !name.trim() : !selectedFile} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-white transition-all duration-150 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed">
            {type === "folder" ? "Create Folder" : "Upload File"}
          </button>
        </div>
      </div>
    </>
  );
}

function ChatPage({ messages, setMessages, chatInput, setChatInput }) {
  const handleSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: "Thanks for your message! I'm a demo AI assistant. In production, I'd connect to your knowledge base to answer your questions." }]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[70%] ${
              msg.role === "user"
                ? "bg-indigo-500/20 text-slate-100 border border-indigo-500/20"
                : "bg-[#1a2540] text-slate-200 border border-white/[0.06]"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#1a2540] px-4 py-3 ring-1 ring-white/[0.06] transition-all duration-200 focus-within:ring-indigo-500/30">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask Cortex AI anything..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none" />
          <button onClick={handleSend} disabled={!chatInput.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition-all duration-150 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
