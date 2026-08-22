import { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast.jsx";
import { getStorageStats } from "../services/fileService";
import { updateUserProfile } from "../services/authService";

const DEFAULT_USER = { firstName: "", lastName: "", email: "", role: "" };

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function loadUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? { ...DEFAULT_USER, ...JSON.parse(stored) } : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

function initials(user) {
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
}

export default function ProfilePage({ foldersCount = 0, filesCount = 0, onOpenApiKey, onExitHome }) {
  const toast = useToast();
  const [profile, setProfile] = useState(loadUser);
  const [storageBytes, setStorageBytes] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    getStorageStats().then((s) => setStorageBytes(s.totalBytes)).catch(() => {});
  }, []);

  const startEditing = () => {
    setDraft({ firstName: profile.firstName, lastName: profile.lastName });
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ firstName: profile.firstName, lastName: profile.lastName });
    setEditing(false);
  };

  // Changes are persisted through the API and the session is refreshed with
  // the re-issued token. Email is permanent, so only names are sent.
  const handleSave = async () => {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    setSaving(true);
    try {
      const result = await updateUserProfile({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setProfile(result.user);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Signed out");
    onExitHome?.();
  };

  const setDraftField = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6 md:pb-8">
      {/* Header */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#1a1a1e] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-2xl font-bold text-[#17171a] shadow-lg shadow-gold-400/25">
            {initials(profile)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-slate-100">{profile.firstName} {profile.lastName}</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">{profile.email}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Manage your account details and security settings.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <Stat label="Folders" value={foldersCount} />
          <Stat label="Files" value={filesCount} />
          <Stat label="Storage" value={formatBytes(storageBytes)} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Account Information */}
        <Card title="Account Information" subtitle="Your personal details">
          {!editing && (
            <button onClick={startEditing}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-slate-300 ring-1 ring-white/[0.08] transition-colors duration-150 hover:bg-white/[0.09] hover:text-slate-100 sm:right-6 sm:top-6">
              <PencilIcon className="h-3 w-3" /> Edit
            </button>
          )}
          <div className={`grid gap-4 transition-opacity duration-150 sm:grid-cols-2 ${editing ? "" : "pointer-events-none opacity-70"}`}>
            <Field label="First name">
              <input type="text" value={draft.firstName} disabled={!editing} onChange={setDraftField("firstName")} className={`${inputCls} disabled:cursor-not-allowed`} />
            </Field>
            <Field label="Last name">
              <input type="text" value={draft.lastName} disabled={!editing} onChange={setDraftField("lastName")} className={`${inputCls} disabled:cursor-not-allowed`} />
            </Field>
            <Field label="Email address">
              <input type="email" value={profile.email} disabled title="Email can't be changed"
                className={`${inputCls} cursor-not-allowed`} />
            </Field>
          </div>
          {editing ? (
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={cancelEditing} disabled={saving}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-gold-400 px-4 py-2 text-xs font-medium text-[#17171a] transition-colors duration-150 hover:bg-gold-300 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <p className="mt-5 flex items-center gap-1.5 text-[11px] text-slate-600">
              <LockIcon className="h-3 w-3" /> Locked. Use Edit to change your name. Email can't be changed.
            </p>
          )}
        </Card>

        {/* Security */}
        <Card title="Security" subtitle="Manage your credentials">
          <button onClick={onOpenApiKey}
            className="group flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors duration-150 hover:border-gold-400/30 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/15 ring-1 ring-gold-400/20">
                <KeyIcon className="h-4 w-4 text-gold-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">AI Model</p>
                <p className="text-xs text-slate-500">Connect an API key or local model that powers AI features</p>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-slate-600 transition-colors duration-150 group-hover:text-gold-400" />
          </button>
          <div className="mt-3 border-t border-white/[0.06] pt-4">
            <button onClick={handleSignOut}
              className="flex w-full items-center justify-between rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-left transition-colors duration-150 hover:bg-red-500/[0.1]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 ring-1 ring-red-500/20">
                  <LogOutIcon className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-300">Sign out</p>
                  <p className="text-xs text-slate-500">End this session and return to the home page</p>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none ring-1 ring-white/[0.06] transition-all duration-200 focus:ring-gold-400/40";

function Stat({ label, value }) {
  return (
    <div className="px-4 py-4 text-center sm:py-5">
      <p className="text-xl font-semibold text-slate-100 sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium tracking-wider text-slate-500 uppercase">{label}</p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="relative rounded-2xl border border-white/[0.06] bg-[#1a1a1e] p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────────── */

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

function PencilIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function LogOutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
