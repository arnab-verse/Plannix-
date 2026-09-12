/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Lock,
  ArrowLeft,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  authService,
  formatFirebaseAuthError,
  isUnauthorizedDomainError,
} from '../services/authService';

interface AuthViewProps {
  onSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
  isMandatory?: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onCancel, isMandatory = false }) => {
  // Mode: 'signin' | 'signup' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const resetFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUnauthorizedDomain(false);
  };

  const handleCopyHostname = async () => {
    if (!currentHostname) return;
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Google Sign In handler with account picker
  const handleGoogleSignIn = async () => {
    setLoading(true);
    resetFeedback();
    try {
      const user = await authService.signInWithGoogle();
      onSuccess(user);
    } catch (err) {
      if (isUnauthorizedDomainError(err)) {
        setIsUnauthorizedDomain(true);
      }
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Email Sign In / Sign Up form handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!email.trim()) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (authMode === 'forgot_password') {
      setLoading(true);
      try {
        await authService.sendPasswordReset(email.trim());
        setSuccessMsg(`Password reset instructions have been sent to ${email.trim()}.`);
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      try {
        const user = await authService.signUpWithEmail(fullName.trim(), email.trim(), password);
        onSuccess(user);
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
    } else {
      // Sign In mode
      setLoading(true);
      try {
        const user = await authService.signInWithEmail(email.trim(), password);
        onSuccess(user);
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 sm:space-y-5">
      {/* Top Header Badge: 𝑴𝒂𝒅𝒆 𝑩𝒚 𝑨𝒓𝒏𝒂𝒃𝑽𝒆𝒓𝒔𝒆 */}
      <div className="flex justify-center text-center">
        <div className="fancy-arnab-badge shadow-md" title="𝑴𝒂𝒅𝒆 𝑩𝒚 𝑨𝒓𝒏𝒂𝒃𝑽𝒆𝒓𝒔𝒆">
          <span className="fancy-arnab-text text-xs sm:text-sm tracking-wide select-none">
            𝑴𝒂𝒅𝒆 𝑩𝒚 𝑨𝒓𝒏𝒂𝒃𝑽𝒆𝒓𝒔𝒆
          </span>
        </div>
      </div>

      {/* Return button if optional */}
      {!isMandatory && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          id="auth-return-btn"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-purple-300 dark:hover:text-purple-100 cursor-pointer no-overlap-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Workspace</span>
        </button>
      )}

      {/* Main card */}
      <div className="rounded-3xl border border-sky-100/90 bg-white/75 p-5 sm:p-7 shadow-[0_8px_32px_rgba(186,215,233,0.35)] backdrop-blur-md dark:border-purple-500/25 dark:bg-[#0c0e29]/75 dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 dark:from-indigo-600 dark:to-purple-600 text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {authMode === 'signup'
              ? 'Create Your Account'
              : authMode === 'forgot_password'
              ? 'Reset Your Password'
              : 'Sign In to Plannix'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {authMode === 'signup'
              ? 'Sign up with your email to start syncing tasks securely across devices.'
              : authMode === 'forgot_password'
              ? 'Enter your registered email address to receive password reset instructions.'
              : 'Welcome back! Sign in with your Google account or email credentials.'}
          </p>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Domain Authorization Diagnostic Card */}
        {isUnauthorizedDomain && (
          <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 text-xs dark:border-amber-500/30 dark:bg-[#1a1608]/90">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>How to Authorize This Domain in Firebase</span>
            </div>
            
            <p className="mt-1.5 text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Google Sign-In is blocked because this hosted domain has not yet been registered in Firebase Authentication settings.
            </p>

            {/* Current Domain Box with Copy Button */}
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-300/70 bg-white/90 px-3 py-2 dark:border-amber-500/20 dark:bg-slate-900/90">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentHostname || 'your-deployed-domain.app'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHostname}
                className="flex items-center gap-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 transition-colors cursor-pointer shrink-0"
              >
                {copiedDomain ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Domain</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="mt-3 space-y-1.5 text-[11px] text-amber-900/80 dark:text-amber-300/80">
              <p className="font-semibold text-amber-950 dark:text-amber-200">Quick 1-Minute Fix:</p>
              <ol className="list-decimal list-inside space-y-1 pl-0.5">
                <li>Go to Firebase Console &rarr; <strong>Authentication</strong> &rarr; <strong>Settings</strong></li>
                <li>Scroll down to <strong>Authorized domains</strong> &rarr; click <strong>Add domain</strong></li>
                <li>Paste <code className="font-mono font-bold bg-amber-200/50 dark:bg-amber-950/70 px-1 rounded">{currentHostname}</code> (and <code className="font-mono bg-amber-200/50 dark:bg-amber-950/70 px-1 rounded">vercel.app</code> or <code className="font-mono bg-amber-200/50 dark:bg-amber-950/70 px-1 rounded">netlify.app</code>)</li>
                <li>Click <strong>Add</strong>. Google Sign-In will work immediately!</li>
              </ol>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <a
                href="https://console.firebase.google.com/project/gen-lang-client-0699548618/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 text-xs transition-colors shadow-xs"
              >
                <span>Open Firebase Settings</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <span className="text-[11px] text-amber-700 dark:text-amber-400">
                Or sign in with <strong>Email & Password</strong> below immediately.
              </span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Primary Action 1: Direct Google Sign-In with device account picker */}
        {authMode !== 'forgot_password' && (
          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              id="google-signin-btn"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 dark:border-purple-500/30 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-purple-950/30 cursor-pointer no-overlap-btn transition-all"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.45 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27A7.08 7.08 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.26A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.55 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
              Selects from all Google accounts available on your device
            </p>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-purple-500/20" />
              <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 dark:bg-[#0c0e29] dark:text-slate-500">
                or use email ID
              </span>
            </div>
          </div>
        )}

        {/* Toggle between Sign In and Sign Up tabs */}
        {authMode !== 'forgot_password' && (
          <div className="flex rounded-2xl border border-sky-100 bg-slate-100/80 p-1 dark:border-purple-500/20 dark:bg-[#090b22] mb-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                resetFeedback();
              }}
              id="auth-mode-signin-tab"
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer no-overlap-btn ${
                authMode === 'signin'
                  ? 'bg-white text-sky-950 shadow-xs dark:bg-purple-600/40 dark:text-purple-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                resetFeedback();
              }}
              id="auth-mode-signup-tab"
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer no-overlap-btn ${
                authMode === 'signup'
                  ? 'bg-white text-sky-950 shadow-xs dark:bg-purple-600/40 dark:text-purple-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {/* Full Name (Sign Up only) */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-purple-300">
                Full Name
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-sky-200/80 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-purple-300">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-sky-200/80 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Password (Sign In & Sign Up) */}
          {authMode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-purple-300">
                  Password
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      resetFeedback();
                    }}
                    className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  required
                  className="w-full rounded-xl border border-sky-200/80 bg-white pl-9 pr-10 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Sign Up only) */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-purple-300">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full rounded-xl border border-sky-200/80 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            id="email-auth-submit-btn"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 dark:from-indigo-600 dark:to-purple-600 cursor-pointer no-overlap-btn transition-all mt-4"
          >
            <span>
              {loading
                ? 'Processing...'
                : authMode === 'signup'
                ? 'Create Account'
                : authMode === 'forgot_password'
                ? 'Send Reset Link'
                : 'Sign In with Email'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Mode switch helper / Back to Sign In */}
        <div className="mt-4 text-center">
          {authMode === 'forgot_password' ? (
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                resetFeedback();
              }}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer"
            >
              ← Back to Sign In
            </button>
          ) : authMode === 'signin' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  resetFeedback();
                }}
                className="font-bold text-sky-600 hover:text-sky-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  resetFeedback();
                }}
                className="font-bold text-sky-600 hover:text-sky-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-purple-500/20">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-500 dark:text-purple-400" />
            <span>Protected by Google Firebase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
