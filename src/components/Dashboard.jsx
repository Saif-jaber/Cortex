import { useEffect, useRef, useState } from "react";
import FolderPopup from "./FolderPopup";
import FilePopup from "./FilePopup";
import ProfilePage from "./ProfilePage";
import { listFolders } from "../services/folderService.js"
import { deleteFolder } from "../services/folderService.js"
import { listFiles, deleteFile } from "../services/fileService.js"
import { askAI, listChats, getChat, deleteChat } from "../services/chatService.js"

const NAV_ITEMS = [
  { id: "knowledge", label: "Knowledge Base", mobile: "Knowledge", icon: DatabaseIcon },
  { id: "chat", label: "AI Chat", mobile: "Chat", icon: ChatIcon },
  { id: "analytics", label: "Analytics", mobile: "Analytics", icon: AnalyticsIcon },
  { id: "profile", label: "Profile", mobile: "Profile", icon: ProfileIcon },
];

function folderId(f) {
  return f?._id || f?.id;
}

function folderName(f) {
  return f?.folderName || f?.name;
}

function formatRelativeTime(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (!isFinite(seconds) || seconds < 0) return "";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function fileType(fileType) {
  if (!fileType) return "pdf";
  if (fileType.includes("pdf")) return "pdf";
  if (fileType.includes("word") || fileType.includes("document")) return "word";
  if (fileType.includes("presentation")) return "word";
  return "pdf";
}

function fileId(f) {
  return f?._id || f?.id;
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes / 1024 / 1024 >= 1) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
}

function toFileCard(f) {
  return {
    id: fileId(f),
    name: f.fileName || f.name,
    type: fileType(f.fileType || f.type),
    size: formatFileSize(f.fileSize ?? f.size),
    date: formatRelativeTime(f.createdAt || f.date),
    folder: f.folder || null,
  };
}
export default function Dashboard({ onExitHome }) {
  const [activeNav, setActiveNav] = useState("knowledge");
  const [activeTab, setActiveTab] = useState("folders");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbOpen, setBreadcrumbOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [showPopup, setShowPopup] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [folderCards, setFolderCards] = useState([]);
  const [files, setFiles] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    let cancelled = false;
    listFolders()
      .then((folders) => { if (!cancelled) setFolderCards(folders); })
      .catch(() => {});
    listFiles()
      .then((files) => { if (!cancelled) setFiles(files.map((f) => toFileCard(f))); })
      .catch(() => {});
    return () => { cancelled = true; };
   }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

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

  async function handleDeleteFile(e, file) {
    e.stopPropagation();
    setConfirmDialog({
      title: "Delete file",
      message: `Delete "${file.name}"? This cannot be undone.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteFile(file.id);
          setFiles((prev) => prev.filter((f) => f.id !== file.id));
        } catch (err) {
          setConfirmDialog({ title: "Error", message: err.message, variant: "error", onConfirm: null });
        }
      },
    });
  }

  async function handleDeleteFolder(e, folder) {
    e.stopPropagation();
    const name = folder.folderName || folder.name;
    setConfirmDialog({
      title: "Delete folder",
      message: `Delete "${name}" and all its files? This cannot be undone.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteFolder(folderId(folder));
          setFolderCards((prev) => prev.filter((f) => folderId(f) !== folderId(folder)));
          setFiles((prev) => prev.filter((f) => f.folder !== folderId(folder)));
          if (selectedFolder === folderId(folder)) setSelectedFolder(null);
        } catch (err) {
          setConfirmDialog({ title: "Error", message: err.message, variant: "error", onConfirm: null });
        }
      },
    });
  }

  useEffect(() => {
    if (activeNav !== "chat") return;
    listChats()
      .then((chats) => setChatSessions(chats))
      .catch(() => {});
  }, [activeNav]);

  async function handleNewChat() {
    setMessages([]);
    setActiveChatId(null);
    setChatInput("");
  }

  async function handleSelectChat(chatId) {
    try {
      setMessages([]);
      setActiveChatId(chatId);
      setSidebarOpen(false);
      const chatDoc = await getChat(chatId);
      const loaded = [];
      for (const m of chatDoc.messages) {
        const role = m.role === "assistant" ? "bot" : "user";
        loaded.push({ role, text: m.content, time: formatTime(new Date(m.createdAt)), ...(role === "bot" ? { sources: m.sources || [] } : {}) });
      }
      setMessages(loaded);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  }

  async function handleDeleteChat(e, chatId) {
    e.stopPropagation();
    setConfirmDialog({
      title: "Delete chat",
      message: "Delete this conversation? This cannot be undone.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteChat(chatId);
          setChatSessions((prev) => prev.filter((c) => c._id !== chatId));
          if (activeChatId === chatId) {
            setActiveChatId(null);
            setMessages([]);
          }
        } catch (err) {
          setConfirmDialog({ title: "Error", message: err.message, variant: "error", onConfirm: null });
        }
      },
    });
  }

  const selectedFolderName = folderName(folderCards.find((f) => folderId(f) === selectedFolder)) || "All Folders";

  const filesByFolder = files.reduce((acc, f) => {
    if (f.folder) acc[f.folder] = (acc[f.folder] || 0) + 1;
    return acc;
  }, {});

  const visibleFiles = selectedFolder
    ? files.filter((f) => f.folder === selectedFolder)
    : files;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#0a0e1a] font-sans text-slate-100">
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
        {activeNav === "chat" ? (
          <ChatSidebarPanel closeButton={null} onOpenApiKey={() => setShowApiKey(true)}
            chats={chatSessions} activeChatId={activeChatId} onSelectChat={handleSelectChat}
            onNewChat={handleNewChat} onDeleteChat={handleDeleteChat} />
        ) : (
          <SidebarPanel
            closeButton={null}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            folders={folderCards}
            selectedFolder={selectedFolder}
            onSelect={handleSelectFolder}
          />
        )}
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
            {activeNav === "profile" ? (
              <div className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-200">
                <ProfileIcon className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Profile</span>
              </div>
            ) : (
              <button onClick={() => setBreadcrumbOpen(!breadcrumbOpen)}
                className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-200 transition-all duration-150 hover:bg-white/[0.06]">
                <FolderSmallIcon className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="truncate max-w-[90px] sm:max-w-[200px] md:max-w-none">{selectedFolderName}</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${breadcrumbOpen ? "rotate-180" : ""}`} />
              </button>
            )}
            {breadcrumbOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBreadcrumbOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1.5 w-60 overflow-hidden rounded-xl border border-white/[0.08] bg-[#182032] py-1.5 shadow-2xl shadow-black/40">
                  <div className="px-3 pb-2">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Folders</span>
                  </div>
                  {folderCards.map((f) => {
                    const isSel = selectedFolder === folderId(f);
                    return (
                      <button key={folderId(f)} onClick={() => { setSelectedFolder(folderId(f)); setBreadcrumbOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.06]">
                        <FolderSmallIcon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="flex-1 truncate">{folderName(f)}</span>
                        {isSel && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Settings" className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200 sm:flex">
              <SettingsIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 hidden h-5 w-px bg-white/[0.08] sm:block" />
            <button className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-all duration-150 hover:bg-white/[0.06]">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/20">
                {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"}
              </div>
              <span className="text-xs font-medium text-slate-300 hidden md:block">{user.firstName || "User"}</span>
            </button>
          </div>
        </div>

        {activeNav === "chat" ? (
          <ChatPage messages={messages} setMessages={setMessages} chatInput={chatInput} setChatInput={setChatInput}
            activeChatId={activeChatId} setActiveChatId={setActiveChatId} setChatSessions={setChatSessions} />
        ) : activeNav === "profile" ? (
          <ProfilePage
            foldersCount={folderCards.length}
            filesCount={files.length}
            onOpenApiKey={() => setShowApiKey(true)}
            onExitHome={onExitHome}
          />
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
              {folderCards.length === 0 ? (
                <EmptyState
                  title="No folders yet"
                  hint="Create your first folder to start organizing your knowledge base."
                  actionLabel="Create Folder"
                  onAction={() => setShowPopup("folder")}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
                  {folderCards.map((folder) => (
                    <FolderCard key={folderId(folder)} folder={folder} fileCount={filesByFolder[folderId(folder)] || 0} selected={selectedFolder === folderId(folder)} onSelect={() => handleSelectFolder(folderId(folder))} onDelete={handleDeleteFolder} />
                  ))}
                </div>
              )}
            </section>

            {/* Files Section */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-100">Files</h3>
                  {selectedFolder && (
                    <button onClick={() => handleSelectFolder(null)} className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/[0.08] transition-colors duration-150 hover:bg-white/[0.08]">
                      {selectedFolderName}
                      <XIcon className="h-3 w-3 text-slate-400" />
                    </button>
                  )}
                </div>
                <button onClick={() => setShowPopup("file")} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
                  <PlusIcon className="h-3.5 w-3.5" /> Add
                </button>
              </div>

              {visibleFiles.length === 0 ? (
                <EmptyState
                  title={selectedFolder ? "No files in this folder" : "No files yet"}
                  hint={selectedFolder ? "Upload a file into this folder to see it here." : "Upload a file and it will show up here."}
                  actionLabel={selectedFolder ? "Upload File" : "Upload File"}
                  onAction={() => setShowPopup("file")}
                />
              ) : (
                <>
                  <div className="space-y-2 md:hidden">
                    {visibleFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#131b2e] px-3.5 py-3 transition-colors duration-150 hover:bg-[#182032]">
                        <FileTypeIcon type={file.type} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{file.size} · {file.date}</p>
                        </div>
                        <button onClick={(e) => handleDeleteFile(e, file)} aria-label={`Delete ${file.name}`}
                          className="shrink-0 rounded-lg p-1.5 text-slate-600 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto rounded-xl border border-white/[0.06] bg-[#131b2e] md:block">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center border-b border-white/[0.06] px-5 py-3">
                      <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Name</span>
                      <span className="w-24 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Size</span>
                      <span className="w-20 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Date</span>
                      <span className="w-10" />
                    </div>
                    {visibleFiles.map((file, i) => (
                      <div key={file.id}
                        className={`group grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 transition-colors duration-150 hover:bg-white/[0.03] ${i < visibleFiles.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <FileTypeIcon type={file.type} />
                          <span className="truncate text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">{file.name}</span>
                        </div>
                        <span className="w-24 text-right text-xs text-slate-500">{file.size}</span>
                        <span className="w-20 text-right text-xs text-slate-500">{file.date}</span>
                        <button onClick={(e) => handleDeleteFile(e, file)} aria-label={`Delete ${file.name}`}
                          className="w-10 flex justify-end text-slate-600 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-red-400">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
        {showPopup === "folder" && <FolderPopup folders={folderCards} onClose={() => setShowPopup(null)} onCreate={(folder) => setFolderCards((prev) => [...prev, folder])} />}
        {showPopup === "file" && <FilePopup folders={folderCards} initialFolder={selectedFolder} onClose={() => setShowPopup(null)} onAddFile={(newFiles) => setFiles((prev) => [...newFiles.map((f) => toFileCard(f)), ...prev])} />}
        {showApiKey && <ApiKeyModal onClose={() => setShowApiKey(false)} />}
        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            variant={confirmDialog.variant}
            onConfirm={confirmDialog.onConfirm}
            onClose={() => setConfirmDialog(null)}
          />
        )}
      </main>

      {/* Mobile / Tablet Sidebar Drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div aria-hidden="true"
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)} />
        <aside aria-label="Knowledge base navigation" aria-hidden={!sidebarOpen}
          style={{ transition: "transform 300ms cubic-bezier(0.32, 0.72, 0.35, 1), visibility 300ms" }}
          className={`absolute left-0 top-0 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-white/[0.06] bg-[#0d1220] shadow-2xl shadow-black/50 ${sidebarOpen ? "visible translate-x-0" : "invisible -translate-x-full"}`}>
          {activeNav === "chat" ? (
            <ChatSidebarPanel
              closeButton={
                <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-200">
                  <XIcon className="h-4 w-4" />
                </button>
              }
              onOpenApiKey={() => {
                setShowApiKey(true);
                setSidebarOpen(false);
              }}
              chats={chatSessions} activeChatId={activeChatId} onSelectChat={handleSelectChat}
              onNewChat={handleNewChat} onDeleteChat={handleDeleteChat}
            />
          ) : (
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
              folders={folderCards}
              selectedFolder={selectedFolder}
              onSelect={handleSelectFolder}
            />
          )}
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

function SidebarPanel({ closeButton, activeTab, setActiveTab, searchQuery, setSearchQuery, folders, selectedFolder, onSelect }) {
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
        {folders.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-slate-500">No folders yet</p>
        ) : (() => {
          const q = searchQuery.toLowerCase().trim();
          const filtered = q ? folders.filter((f) => folderName(f).toLowerCase().includes(q)) : folders;
          return filtered.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-slate-500">No matching folders</p>
          ) : (
            filtered.map((folder) => (
              <FolderTreeNode key={folderId(folder)} folder={folder} selectedFolder={selectedFolder} onSelect={onSelect} />
            ))
          );
        })()}
      </div>
    </>
  );
}

function ChatSidebarPanel({ closeButton, onOpenApiKey, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) {
  const [query, setQuery] = useState("");

  const filtered = chats.filter(
    (chat) => chat.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-slate-200">Chats</h2>
        <div className="flex items-center gap-0.5">
          <button onClick={onNewChat} aria-label="New chat" title="New chat" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
            <PlusIcon className="h-4 w-4" />
          </button>
          {closeButton}
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06] transition-all duration-200 focus-within:bg-white/[0.06] focus-within:ring-indigo-500/30">
          <SearchIcon className="h-4 w-4 shrink-0 text-slate-500" />
          <input type="text" placeholder="Search chats..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Recent</p>
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-slate-500">{chats.length === 0 ? "No chats yet" : "No matching chats"}</p>
        ) : (
          filtered.map((chat) => (
            <div key={chat._id} className="group relative">
              <button onClick={() => onSelectChat(chat._id)}
                className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition-all duration-150 ${activeChatId === chat._id ? "bg-white/[0.07] text-slate-100" : "hover:bg-white/[0.04]"}`}>
                <ChatIcon className={`mt-0.5 h-4 w-4 shrink-0 ${activeChatId === chat._id ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`} strokeWidth={1.8} />
                <div className="min-w-0 max-w-[calc(100%-2rem)] flex-1">
                  <span className={`block truncate text-[13px] font-medium ${activeChatId === chat._id ? "text-slate-100" : "text-slate-200 group-hover:text-slate-100"}`}>{chat.title}</span>
                </div>
              </button>
              <button onClick={(e) => onDeleteChat(e, chat._id)} aria-label="Delete chat"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 opacity-0 transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100">
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/[0.06] p-2.5 sm:p-3">
        <button onClick={onOpenApiKey}
          className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[13px] font-medium text-slate-300 transition-all duration-150 hover:border-indigo-500/30 hover:bg-white/[0.06] hover:text-slate-100 sm:px-3.5">
          <span className="flex items-center gap-2.5">
            <KeyIcon className="h-4 w-4 text-slate-500" />
            API Key
          </span>
          <PlusIcon className="h-4 w-4 text-slate-500" />
        </button>
      </div>
    </>
  );
}

function FolderTreeNode({ folder, selectedFolder, onSelect }) {
  const isSelected = selectedFolder === folderId(folder);
  return (
    <div className="overflow-hidden">
      <button onClick={() => onSelect(folderId(folder))}
        className={`group flex w-full items-center gap-2 rounded-lg py-1.5 pl-2 pr-2 text-left text-sm transition-all duration-200 ${isSelected ? "bg-white/[0.07] text-slate-100" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-300"}`}>
        <FolderSmallIcon className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isSelected ? "text-indigo-400" : "text-slate-600"}`} />
        <span className="flex-1 truncate">{folderName(folder)}</span>
      </button>
    </div>
  );
}

function FolderCard({ folder, fileCount, selected, onSelect, onDelete }) {
  const updated = folder.updated || (folder.updatedAt ? formatRelativeTime(folder.updatedAt) : "");
  return (
    <div className="group relative">
      <button onClick={onSelect}
        className={`flex w-full flex-col items-center rounded-xl border p-4 transition-colors duration-150 sm:p-5 ${selected ? "border-indigo-500/40 bg-[#182032] ring-1 ring-indigo-500/20" : "border-white/[0.06] bg-[#131b2e] hover:bg-[#182032]"}`}>
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
        <span className="text-[13px] font-medium text-slate-200">{folder.folderName || folder.name}</span>
        <span className="mt-0.5 text-[11px] text-slate-500">{fileCount} File{fileCount === 1 ? "" : "s"}</span>
        <span className="mt-1 text-[10px] text-slate-600">{updated}</span>
      </button>
      {onDelete && (
        <button onClick={(e) => onDelete(e, folder)} aria-label={`Delete ${folder.folderName || folder.name}`}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-600 opacity-0 transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100">
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, variant, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!onConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.1] bg-[#131b2e] shadow-2xl shadow-black/60">
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${variant === "error" ? "bg-red-500/10" : "bg-red-500/10"}`}>
              {variant === "error" ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-100">{title}</h3>
              <p className="mt-0.5 text-sm text-slate-400">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          {onConfirm && (
            <button onClick={onClose}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200">
              Cancel
            </button>
          )}
          {onConfirm ? (
            <button onClick={handleConfirm} disabled={loading}
              className="rounded-lg bg-red-500/90 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50">
              {loading ? "Deleting..." : "Delete"}
            </button>
          ) : (
            <button onClick={onClose}
              className="rounded-lg bg-white/[0.08] px-3.5 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.12]">
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, hint, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
        <FolderLargeIcon className="h-6 w-6 opacity-70" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-300">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{hint}</p>
      <button onClick={onAction}
        className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3.5 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-indigo-400">
        <PlusIcon className="h-3.5 w-3.5" /> {actionLabel}
      </button>
    </div>
  );
}

function FileTypeIcon({ type, size = "md" }) {
  const box = size === "sm" ? "h-5 w-5 rounded-md" : "h-8 w-8 rounded-lg";
  const icon = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const colors = { pdf: "text-red-400", word: "text-blue-400", markdown: "text-slate-400", figma: "text-pink-400" };
  return (
    <div className={`flex ${box} shrink-0 items-center justify-center bg-white/[0.04] ${colors[type] || "text-slate-400"}`}>
      <FileTypeSVG type={type} className={icon} />
    </div>
  );
}

/* ─── SVG Icons ──────────────────────────────────────────────── */

function ProfileIcon({ className, strokeWidth }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
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

function KeyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3L21 2" />
      <path d="M17 6l3 3" />
      <path d="M13.5 9.5l2.5 2.5" />
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

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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

function ApiKeyModal({ onClose }) {
  const [currentKey] = useState("sk-proj-•••••••••••••••••x4F2");
  const [newKey, setNewKey] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = () => {
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-40 flex max-h-[88vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#182032] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/20">
              <KeyIcon className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">API Key</h3>
              <p className="text-[11px] text-slate-500">Manage your AI credentials</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Current Key</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={currentKey} readOnly aria-label="Current API key"
                className="w-full rounded-lg bg-white/[0.03] px-3 py-2 pr-10 text-sm text-slate-300 outline-none ring-1 ring-white/[0.06]" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} aria-label={showCurrent ? "Hide current key" : "Show current key"}
                className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-300">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">New Key</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newKey} onChange={(e) => setNewKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="Enter a new key..." autoFocus
                className="w-full rounded-lg bg-white/[0.04] px-3 py-2 pr-10 text-sm text-slate-200 placeholder-slate-500 outline-none ring-1 ring-white/[0.06] transition-all duration-200 focus:ring-indigo-500/30" />
              <button type="button" onClick={() => setShowNew(!showNew)} aria-label={showNew ? "Hide new key" : "Show new key"}
                className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-300">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">Your key is stored securely on this device and used only to power AI features.</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:flex-row sm:justify-end sm:px-5 sm:pb-4">
          <button onClick={onClose} className="w-full rounded-lg px-4 py-2.5 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-slate-200 sm:w-auto sm:py-2">Cancel</button>
          <button onClick={handleSubmit} disabled={!newKey.trim()} className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-medium text-white transition-all duration-150 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto sm:py-2">
            Save Key
          </button>
        </div>
      </div>
    </>
  );
}

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const SUGGESTIONS = [
  "Summarize my recent documents",
  "What's inside the Onboarding folder?",
  "Draft a weekly team update",
  "Find files about integrations",
];

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={i} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[12.5px] text-indigo-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer"
            className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-2 transition-colors hover:text-indigo-300 hover:decoration-indigo-300/50">
            {match[1]}
          </a>
        );
      }
    }
    return part;
  });
}

function renderTextBlock(lines, startIdx) {
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      i++;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const Tag = `h${level}`;
      const sizes = {
        1: "text-xl font-bold mt-4 mb-2 text-slate-50",
        2: "text-lg font-bold mt-4 mb-1.5 text-slate-100",
        3: "text-base font-semibold mt-3 mb-1.5 text-slate-100",
        4: "text-sm font-semibold mt-3 mb-1 text-slate-200",
        5: "text-sm font-medium mt-2 mb-1 text-slate-200",
        6: "text-xs font-medium mt-2 mb-1 text-slate-300",
      };
      elements.push(
        <Tag key={startIdx + i} className={sizes[level] || sizes[3]}>
          {renderInline(headingMatch[2])}
        </Tag>
      );
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(
        <hr key={startIdx + i} className="my-3 border-white/[0.08]" />
      );
      i++;
      continue;
    }

    const blockquoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      const quoteLines = [blockquoteMatch[1]];
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      elements.push(
        <blockquote key={startIdx + i} className="my-2 border-l-2 border-indigo-400/40 pl-3 text-sm italic text-slate-400">
          {quoteLines.map((ql, qi) => (
            <p key={qi} className={qi > 0 ? "mt-1" : ""}>{renderInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i++;
      }
      elements.push(
        <div key={startIdx + i} className="my-1.5 space-y-1 pl-0.5">
          {listItems.map((item, li) => (
            <div key={li} className="flex items-start gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span className="text-sm leading-relaxed">{renderInline(item)}</span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const m = lines[i].trim().match(/^(\d+)\.\s+(.+)$/);
        if (m) listItems.push({ num: m[1], text: m[2] });
        i++;
      }
      elements.push(
        <div key={startIdx + i} className="my-1.5 space-y-1 pl-0.5">
          {listItems.map((item, li) => (
            <div key={li} className="flex items-start gap-2.5">
              <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-[13px] font-medium text-indigo-400/70">{item.num}.</span>
              <span className="text-sm leading-relaxed">{renderInline(item.text)}</span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    const paraLines = [trimmed];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|(-{3,}|\*{3,}|_{3,})$|>\s?|[-*+]\s+|\d+\.\s+)/.test(lines[i].trim())) {
      paraLines.push(lines[i].trim());
      i++;
    }
    elements.push(
      <p key={startIdx + i} className="my-1.5 text-sm leading-relaxed text-slate-300">
        {paraLines.length === 1 ? renderInline(paraLines[0]) : paraLines.map((pl, pi) => (
          <span key={pi}>{pi > 0 && <br />}{renderInline(pl)}</span>
        ))}
      </p>
    );
  }

  return elements;
}

function parseMessageSegments(text) {
  const lines = text.split("\n");
  const segments = [];
  let currentTextLines = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("```")) {
      if (currentTextLines.length > 0) {
        segments.push({ type: "text", lines: currentTextLines, startIdx: segments.reduce((s, seg) => s + (seg.type === "text" ? seg.lines.length : 1), 0) });
        currentTextLines = [];
      }
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      segments.push({ type: "code", lang, code: codeLines.join("\n"), incomplete: false });
    } else {
      currentTextLines.push(lines[i]);
      i++;
    }
  }

  if (currentTextLines.length > 0) {
    segments.push({ type: "text", lines: currentTextLines, startIdx: 0 });
  }

  return segments;
}

function renderMessageText(text) {
  const segments = parseMessageSegments(text);
  let idx = 0;
  return segments.map((seg) => {
    if (seg.type === "code") {
      return <CodeBlock key={idx++} language={seg.lang} code={seg.code} />;
    }
    return <span key={idx++}>{renderTextBlock(seg.lines, idx)}</span>;
  });
}

/* ─── Syntax Highlighting ──────────────────────────────────────── */

const HL_RULES = [
  { pattern: /(\/\/.*$)/gm, className: "hl-comment" },
  { pattern: /(\/\*[\s\S]*?\*\/)/g, className: "hl-comment" },
  { pattern: /(#[^!].*$)/gm, className: "hl-comment" },
  { pattern: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, className: "hl-string" },
  { pattern: /\b(true|false|null|undefined|None|True|False|nil|NaN|Infinity)\b/g, className: "hl-keyword" },
  { pattern: /\b(function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|import|from|export|default|const|let|var|async|await|try|catch|finally|throw|typeof|instanceof|in|of|yield|delete|void)\b/g, className: "hl-keyword" },
  { pattern: /\b(def|self|print|as|with|is|not|and|or|elif|except|lambda|global|nonlocal|raise|pass|del|assert|for|while|return|class|try|finally|from|import|global)\b/g, className: "hl-keyword" },
  { pattern: /\b(int|float|str|list|dict|set|tuple|bool|char|double|long|short|byte|public|private|protected|static|final|abstract|interface|implements|package|synchronized|volatile|transient|native|strictfp|enum|struct|union|typedef|sizeof|NULL|malloc|free|printf|scanf|cin|cout|nullptr|auto|register|extern|inline|constexpr|noexcept|template|typename|concept|requires|co_await|co_return|co_yield)\b/g, className: "hl-keyword" },
  { pattern: /\b(fmt|func|go|chan|select|case|defer|fallthrough|range|type|map|make|len|cap|append|copy|delete|close|panic|recover|error|bool|string|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|float32|float64|complex64|complex128|byte|rune)\b/g, className: "hl-keyword" },
  { pattern: /\b(console|document|window|Math|Array|Object|String|Number|Boolean|RegExp|Date|Promise|Map|Set|JSON|Error|Symbol|BigInt|WeakMap|WeakSet|Proxy|Reflect|globalThis|fetch|Response|Request|URL|Headers|AbortController|setTimeout|setInterval|clearTimeout|clearInterval|parseInt|parseFloat|isNaN|isFinite|encodeURI|decodeURI|encodeURIComponent|decodeURIComponent|alert|confirm|prompt|location|navigator|history|localStorage|sessionStorage|indexedDB|caches|crypto|performance|origin|name|status|ok|type|url|redirected|body|bodyUsed|headers|arrayBuffer|blob|formData|json|text|clone)\b/g, className: "hl-builtin" },
  { pattern: /\b(print|len|range|input|open|read|write|close|append|sort|map|filter|reduce|type|isinstance|issubclass|super|property|staticmethod|classmethod|__init__|__str__|__repr__|__enter__|__exit__|__call__|__iter__|__next__|__len__|__getitem__|__setitem__|__delitem__|__contains__|__add__|__sub__|__mul__|__truediv__|__floordiv__|__mod__|__pow__|__and__|__or__|__xor__|__lshift__|__rshift__|__neg__|__pos__|__abs__|__invert__)\b/g, className: "hl-builtin" },
  { pattern: /\b(\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, className: "hl-number" },
  { pattern: /(=>|===|!==|==|!=|<=|>=|&&|\|\||\.\.\.|\?\?|\?\.|->|<-|::|\.\.)/g, className: "hl-operator" },
];

const HL_KEYWORD = "#c084fc";
const HL_STRING = "#86efac";
const HL_COMMENT = "#64748b";
const HL_NUMBER = "#fbbf24";
const HL_BUILTIN = "#67e8f9";
const HL_OPERATOR = "#f472b6";

function highlightCode(code, _language) {
  const tokens = [{ text: code, className: null }];
  for (const rule of HL_RULES) {
    const newTokens = [];
    for (const token of tokens) {
      if (token.className !== null) {
        newTokens.push(token);
        continue;
      }
      const parts = token.text.split(rule.pattern);
      for (let j = 0; j < parts.length; j++) {
        if (parts[j] === "") continue;
        if (j % 2 === 1) {
          newTokens.push({ text: parts[j], className: rule.className });
        } else {
          newTokens.push({ text: parts[j], className: null });
        }
      }
    }
    tokens.length = 0;
    tokens.push(...newTokens);
  }
  return tokens.filter((t) => t.text);
}

const HL_COLOR_MAP = {
  "hl-keyword": HL_KEYWORD,
  "hl-string": HL_STRING,
  "hl-comment": HL_COMMENT,
  "hl-number": HL_NUMBER,
  "hl-builtin": HL_BUILTIN,
  "hl-operator": HL_OPERATOR,
};

/* ─── Code Block Component ─────────────────────────────────────── */

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  const langLabel = language || "plaintext";
  const tokens = highlightCode(code, language);

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d1117] text-[12px] sm:my-3 sm:rounded-xl sm:text-[13px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-3 py-1.5 sm:px-4 sm:py-2">
        <span className="font-mono text-[10px] font-medium text-slate-400 sm:text-[11px]">{langLabel}</span>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-200 sm:px-2 sm:py-1 sm:text-[11px]">
          {copied ? (
            <>
              <svg className="h-3 w-3 text-emerald-400 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span className="hidden sm:inline">Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto px-3 py-2 sm:px-4 sm:py-3">
        <pre className="m-0 whitespace-pre font-mono text-[12px] leading-relaxed sm:text-[13px]">
          <code>
            {tokens.map((token, i) => {
              if (!token.className) return <span key={i}>{token.text}</span>;
              const color = HL_COLOR_MAP[token.className];
              return <span key={i} style={{ color }}>{token.text}</span>;
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1a2540] ring-1 ring-white/[0.08]">
      <img src="/logo.svg" alt="Cortex AI" className="h-5 w-5" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1a2540] text-[11px] font-bold text-slate-300 ring-1 ring-white/[0.08]">
      SC
    </div>
  );
}

function MessageAction({ label, children }) {
  return (
    <button aria-label={label} title={label}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-200">
      {children}
    </button>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex items-end justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-500/15 px-4 py-3 text-sm leading-relaxed text-slate-100 ring-1 ring-indigo-500/20 sm:max-w-[70%]">
          {msg.text}
        </div>
        <UserAvatar />
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 sm:gap-3">
      <BotAvatar />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline gap-2 px-1">
          <span className="text-[13px] font-semibold text-slate-100">Cortex AI</span>
          <span className="text-[11px] text-slate-500">{msg.time}</span>
        </div>
        <div className="rounded-2xl rounded-tl-md bg-[#1a2540] px-4 py-3.5 text-sm leading-relaxed text-slate-300 ring-1 ring-white/[0.06]">
          {renderMessageText(msg.text)}
        </div>
        {msg.sources?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-1">
            <span className="mr-0.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Sources</span>
            {msg.sources.map((s) => (
              <button key={s.name} aria-label={`Open source ${s.name}`}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1 pl-1 pr-2 text-[11px] text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-200">
                <FileTypeIcon type={s.type} size="sm" />
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-0.5 px-1 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <MessageAction label="Copy response"><CopyIcon className="h-3.5 w-3.5" /></MessageAction>
          <MessageAction label="Regenerate response"><RefreshIcon className="h-3.5 w-3.5" /></MessageAction>
          <MessageAction label="Like response"><ThumbsUpIcon className="h-3.5 w-3.5" /></MessageAction>
          <MessageAction label="Dislike response"><ThumbsDownIcon className="h-3.5 w-3.5" /></MessageAction>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3" role="status" aria-label="Cortex AI is typing">
      <BotAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-[#1a2540] px-4 py-3.5 ring-1 ring-white/[0.06]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none"
            style={{ animationDelay: `${i * 150}ms` }} />
        ))}
        <span className="sr-only">Cortex AI is typing</span>
      </div>
    </div>
  );
}

function WelcomeState({ onPick }) {
  return (
    <div className="flex flex-col items-center px-2 pt-6 pb-4 text-center sm:pt-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a2540] ring-1 ring-white/[0.08]">
        <img src="/logo.svg" alt="Cortex AI" className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-100">Ask Cortex AI</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">Answers grounded in your knowledge base. Search documents, summarize files, and draft content.</p>
      <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => onPick(s)}
            className="group flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#131b2e] px-3.5 py-2.5 text-left text-[13px] text-slate-300 transition-colors duration-150 hover:border-indigo-500/30 hover:bg-[#182032] hover:text-slate-100">
            <span className="truncate">{s}</span>
            <ArrowUpRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-colors duration-150 group-hover:text-indigo-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatPage({ messages, setMessages, chatInput, setChatInput, activeChatId, setActiveChatId, setChatSessions }) {
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!chatInput.trim() || isTyping) return;
    const text = chatInput.trim();
    setMessages((prev) => [...prev, { role: "user", text, time: formatTime(new Date()) }]);
    setChatInput("");
    setIsTyping(true);
    setStatusText("");

    let answer = "";
    let sources = [];
    let failed = null;
    let newChatId = null;

    try {
      await askAI(text, {
        chatId: activeChatId,
        onStatus: (msg) => setStatusText(msg),
        onChatId: (id) => { newChatId = id; },
        onDelta: (t) => {
          answer += t;
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "bot" && last.streaming) {
              next[next.length - 1] = { ...last, text: answer };
            } else {
              next.push({ role: "bot", text: answer, time: formatTime(new Date()), streaming: true });
            }
            return next;
          });
        },
        onSources: (s) => { sources = s; },
        onError: (msg) => { failed = msg; },
      });
    } catch (err) {
      failed = err.message;
    }

    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "bot" && last.streaming) {
        next[next.length - 1] = { ...last, streaming: false, text: answer || "No response generated.", sources };
      } else if (failed && !answer) {
        next.push({ role: "bot", text: `Error: ${failed}`, time: formatTime(new Date()) });
      }
      return next;
    });

    if (newChatId) {
      setActiveChatId(newChatId);
      setChatSessions((prev) => [{ _id: newChatId, title: text.slice(0, 80), updatedAt: new Date().toISOString() }, ...prev]);
    } else if (activeChatId) {
      setChatSessions((prev) => prev.map((c) => c._id === activeChatId ? { ...c, updatedAt: new Date().toISOString() } : c));
    }

    listChats().then((chats) => setChatSessions(chats)).catch(() => {});
    setStatusText("");
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isFresh = messages.length === 0;

  return (
    <div className="flex flex-1 flex-col min-h-0 pb-[calc(env(safe-area-inset-bottom)+3.5rem)] md:pb-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain [scroll-behavior:auto]">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
          {isFresh ? (
            <WelcomeState onPick={(s) => setChatInput(s)} />
          ) : (
            messages.map((msg, i) => <Message key={i} msg={msg} />)
          )}
          {isTyping && !messages.some((m) => m.streaming) && <TypingIndicator />}
          {statusText && <p className="pb-1 text-center text-xs text-slate-500">{statusText}</p>}
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-1.5 rounded-xl bg-[#1a2540] px-2.5 py-2 ring-1 ring-white/[0.06] transition-all duration-200 focus-within:bg-[#1d2740] focus-within:ring-indigo-500/30">
            <button aria-label="Attach file" className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-300">
              <PaperclipIcon className="h-4 w-4" />
            </button>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask Cortex AI anything..." aria-label="Message Cortex AI"
              className="flex-1 bg-transparent px-1 text-sm text-slate-200 placeholder-slate-500 outline-none" />
            <button onClick={handleSend} disabled={!chatInput.trim() || isTyping} aria-label="Send message"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-indigo-500 text-white transition-colors duration-150 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Chat Icons ─────────────────────────────────────────────── */

function CopyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function ThumbsUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 011.92 2.56l-2.33 8A2 2 0 0117.5 22H4a2 2 0 01-2-2v-8a2 2 0 012-2h2.76a2 2 0 001.79-1.11L12 2h0a3.13 3.13 0 013 3.88Z" />
    </svg>
  );
}

function ThumbsDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 01-1.92-2.56l2.33-8A2 2 0 016.5 2H20a2 2 0 012 2v8a2 2 0 01-2 2h-2.76a2 2 0 00-1.79 1.11L12 22h0a3.13 3.13 0 01-3-3.88Z" />
    </svg>
  );
}

function PaperclipIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 01-8.49-8.49l8.57-8.57A4 4 0 1118.84 5l-8.59 8.57a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function ArrowUpRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}
