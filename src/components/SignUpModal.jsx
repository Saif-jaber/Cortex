import { useState } from "react";
import Modal from "./Modal";
import { ArrowRightIcon, CheckIcon, GitHubIcon, GoogleIcon } from "./icons";

const PASSWORD_RULES = [
  { label: "At least 15 characters", test: (p) => p.length >= 15 },
  { label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p) => /\d/.test(p) },
  { label: "One symbol (!@#$%^&*)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignUpModal({ onClose, onSwitchToSignIn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const checks = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }));
  const strong = checks.every((rule) => rule.met);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!strong) return;
    setSubmitting(true);
    window.setTimeout(() => {
      window.location.hash = "#/app";
    }, 400);
  };

  return (
    <Modal onClose={onClose} title="Create your account" subtitle="Start your free 14-day trial. No credit card required.">
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.06] sm:py-2.5"
        >
          <GitHubIcon className="h-4 w-4" />
          GitHub
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.06] sm:py-2.5"
        >
          <GoogleIcon className="h-4 w-4" />
          Google
        </button>
      </div>

      <div className="my-3.5 flex items-center gap-3 sm:my-5">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-400 focus:bg-white/[0.05] sm:px-3.5 sm:py-2.5"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-400 focus:bg-white/[0.05] sm:px-3.5 sm:py-2.5"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••••"
            autoComplete="new-password"
            className={`w-full rounded-xl border bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors sm:px-3.5 sm:py-2.5 ${
              password.length > 0 && !strong
                ? "border-red-500/50 focus:border-red-400"
                : strong
                  ? "border-emerald-500/50 focus:border-emerald-400"
                  : "border-white/[0.1] focus:border-indigo-400"
            }`}
          />
          {password.length > 0 && (
            <ul className="mt-2 grid grid-cols-1 gap-1.5 min-[400px]:grid-cols-2">
              {checks.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-[11px] leading-tight transition-colors duration-200 ${
                    rule.met ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {rule.met ? (
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <CheckIcon className="h-2 w-2 text-emerald-400" />
                    </span>
                  ) : (
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/[0.15]" />
                  )}
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting || !strong}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
        >
          {submitting ? "Creating your workspace…" : "Create account"}
          {!submitting && <ArrowRightIcon className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Sign in
        </button>
      </p>
    </Modal>
  );
}
