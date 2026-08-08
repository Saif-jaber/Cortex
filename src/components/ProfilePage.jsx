import { useState } from "react";
import { useToast } from "../hooks/useToast.jsx";

const DEFAULT_USER = {
  firstName: "Sarah",
  lastName: "Chen",
  email: "sarah@cortex.io",
  role: "Admin",
};

function loadUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? { ...DEFAULT_USER, ...JSON.parse(stored) } : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

function initials(user) {
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "SC";
}

export default function ProfilePage({ foldersCount = 0, filesCount = 0, onOpenApiKey, onExitHome }) {
  const toast = useToast();
  const [profile, setProfile] = useState(loadUser);

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(profile));
    toast.success("Profile updated");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Signed out");
    onExitHome?.();
  };

  const setField = (key) => (e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6 md:pb-8">
      {/* Header */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#131b2e] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
            {initials(profile)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-slate-100">{profile.firstName} {profile.lastName}</h1>
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 ring-1 ring-indigo-500/20">{profile.role}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{profile.email}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Manage your account details and security settings.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <Stat label="Folders" value={foldersCount} />
          <Stat label="Files" value={filesCount} />
          <Stat label="Storage" value="2.4 GB" />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Account Information */}
        <Card title="Account Information" subtitle="Your personal details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input type="text" value={profile.firstName} onChange={setField("firstName")} className={inputCls} />
            </Field>
            <Field label="Last name">
              <input type="text" value={profile.lastName} onChange={setField("lastName")} className={inputCls} />
            </Field>
            <Field label="Email address">
              <input type="email" value={profile.email} onChange={setField("email")} className={inputCls} />
            </Field>
            <Field label="Role">
              <div className="flex h-10 items-center rounded-lg bg-white/[0.04] px-3 text-sm text-slate-400 ring-1 ring-white/[0.06]">{profile.role}</div>
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={handleSave}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-indigo-400">
              Save Changes
            </button>
          </div>
        </Card>

        {/* Security */}
        <Card title="Security" subtitle="Manage your credentials">
          <button onClick={onOpenApiKey}
            className="group flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors duration-150 hover:border-indigo-500/30 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/20">
                <KeyIcon className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">API Key</p>
                <p className="text-xs text-slate-500">Manage the key that powers AI features</p>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-slate-600 transition-colors duration-150 group-hover:text-indigo-400" />
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
  "w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none ring-1 ring-white/[0.06] transition-all duration-200 focus:ring-indigo-500/30";

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
    <section className="rounded-2xl border border-white/[0.06] bg-[#131b2e] p-5 sm:p-6">
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
