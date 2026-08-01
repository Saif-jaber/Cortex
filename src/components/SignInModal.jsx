import { useState } from "react";
import Modal from "./Modal";
import { ArrowRightIcon, GitHubIcon, GoogleIcon } from "./icons";

export default function SignInModal({ onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      window.location.hash = "#/app";
    }, 400);
  };

  return (
    <Modal onClose={onClose} title="Welcome back" subtitle="Sign in to continue to your workspace.">
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
          <label htmlFor="signin-email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="signin-email"
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
          <label htmlFor="signin-password" className="mb-1.5 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-400 focus:bg-white/[0.05] sm:px-3.5 sm:py-2.5"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400">
            <input type="checkbox" className="h-4 w-4 rounded border-white/[0.1] bg-white/[0.03] text-indigo-500" />
            Remember me
          </label>
          <button type="button" className="font-medium text-indigo-400 hover:text-indigo-300">
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
        >
          {submitting ? "Opening your workspace…" : "Sign in"}
          {!submitting && <ArrowRightIcon className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        New to Cortex?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Create account
        </button>
      </p>
    </Modal>
  );
}
