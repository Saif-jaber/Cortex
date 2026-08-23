import { useState } from "react";
import Modal from "./Modal";
import SuccessOverlay from "./SuccessOverlay";
import { ArrowRightIcon } from "./icons";
import { loginUser } from "../services/authService.js"
import { useToast } from "../hooks/useToast.jsx"

export default function SignInModal({ onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { 
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setSuccess(true);
    } 
    catch (error) {
        toast.error(error.message);
    } 
    finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Welcome back" subtitle="Sign in to continue to your workspace.">
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
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-gold-400 focus:bg-white/[0.05] sm:px-3.5 sm:py-2.5"
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
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-gold-400 focus:bg-white/[0.05] sm:px-3.5 sm:py-2.5"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400">
            <input type="checkbox" className="h-4 w-4 rounded border-white/[0.1] bg-white/[0.03] text-gold-400" />
            Remember me
          </label>
          <button type="button" className="font-medium text-gold-400 hover:text-gold-300">
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-2.5 text-sm font-semibold text-[#17171a] shadow-lg shadow-gold-400/25 transition-all duration-200 hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
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
          className="font-semibold text-gold-400 hover:text-gold-300"
        >
          Create account
        </button>
      </p>
      {success && (
        <SuccessOverlay
          title="Logged in successfully"
          subtitle="You have been logged in successfully"
          duration={2500}
          onDone={() => {
            window.location.hash = "#/app";
          }}
        />
      )}
    </Modal>
  );
}
