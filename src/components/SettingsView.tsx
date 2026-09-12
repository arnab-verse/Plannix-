/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  Trash2,
  CalendarClock,
  Clock,
  Globe,
  RefreshCw,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { AppTheme, UserProfile } from '../types';
import { getLocalTimezoneName } from '../utils/dateUtils';

interface SettingsViewProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  taskCount: number;
  onOpenOrganizeTasks?: () => void;
  onExportData: () => Promise<string>;
  onImportData: (jsonStr: string) => Promise<number>;
  onClearAllTasks: () => Promise<void>;
  onRunRolloverCheck: () => Promise<{ updatedCount: number }>;
  onSeedHistoricalArchive?: () => Promise<number>;
  currentUser?: UserProfile | null;
  onNavigateToAuth?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onSelectTheme,
  taskCount,
  onOpenOrganizeTasks,
  onExportData,
  onImportData,
  onClearAllTasks,
  onRunRolloverCheck,
  onSeedHistoricalArchive,
  currentUser = null,
  onNavigateToAuth,
  onLogout,
}) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCheckingRollover, setIsCheckingRollover] = useState(false);
  const [isSeedingArchive, setIsSeedingArchive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const localTimezone = getLocalTimezoneName();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExport = async () => {
    try {
      const dataStr = await onExportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Export downloaded successfully.');
    } catch {
      showToast('Failed to export tasks.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const count = await onImportData(text);
      showToast(`Successfully imported ${count} tasks.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      showToast('Import failed: invalid JSON format.');
    }
  };

  const handleManualRolloverCheck = async () => {
    setIsCheckingRollover(true);
    try {
      const res = await onRunRolloverCheck();
      if (res.updatedCount > 0) {
        showToast(`Rollover evaluated: ${res.updatedCount} unfinished tasks transitioned to missed.`);
      } else {
        showToast('Rollover check complete: all tasks are already up-to-date.');
      }
    } finally {
      setIsCheckingRollover(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs font-semibold text-indigo-800 shadow-sm dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
          {notification}
        </div>
      )}

      {/* Header card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white/75 p-4 sm:p-6 shadow-xs backdrop-blur-md dark:border-neutral-800 dark:bg-[#090c23]/75">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Settings className="h-4 w-4" />
          <span>System Preferences</span>
        </div>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Application Settings
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Manage appearance, inspect timezone rules, review rollover status, and backup data.
        </p>
      </div>

      {/* Account & Authentication Card */}
      <div className="rounded-2xl border border-sky-100/90 bg-white/75 p-4 sm:p-6 shadow-xs backdrop-blur-md space-y-4 dark:border-purple-500/20 dark:bg-[#0c0e29]/75">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-purple-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Account & Authentication</span>
          </div>
          {currentUser ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Authenticated
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Guest Mode
            </span>
          )}
        </div>

        {currentUser ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 rounded-xl bg-slate-50/80 p-3.5 sm:p-4 dark:bg-slate-900/60 border border-slate-100 dark:border-purple-500/20">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-sky-300 dark:border-purple-400 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </span>
                  <span className="rounded-md bg-sky-100 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-sky-800 uppercase dark:bg-purple-950 dark:text-purple-300 shrink-0">
                    {currentUser.authProvider}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.email || 'Registered User'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onNavigateToAuth}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-purple-500/30 dark:text-slate-300 dark:hover:bg-purple-900/30 cursor-pointer no-overlap-btn"
              >
                Switch Account
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 cursor-pointer no-overlap-btn"
                >
                  <LogOut className="h-3.5 w-3.5 inline mr-1" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 rounded-xl bg-slate-50/80 p-3.5 sm:p-4 dark:bg-slate-900/60 border border-slate-100 dark:border-purple-500/20">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                You are currently exploring as a guest
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Sign in with Google or your email ID to sync and secure your tasks.
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToAuth}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-indigo-500 cursor-pointer no-overlap-btn shrink-0"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>

      {/* Section 1: Appearance & Timezone */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white/75 p-4 sm:p-6 shadow-xs backdrop-blur-md space-y-4 dark:border-neutral-800 dark:bg-[#090c23]/75">
        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          Appearance & Environment
        </h3>

        {/* Theme selection */}
        <div className="space-y-3 border-b border-sky-100/70 pb-4 dark:border-purple-500/20">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Atmospheric Environment Theme
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Select your ambient environment theme with live canvas effects and custom styling.
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* 1. Volcano - Default */}
            <button
              type="button"
              onClick={() => onSelectTheme('volcano')}
              id="settings-theme-volcano-btn"
              className={`flex flex-col items-start rounded-2xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer ${
                currentTheme === 'volcano'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-amber-300 ring-2 ring-orange-500/40'
                  : 'border-slate-200/90 bg-white/70 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🌋</span>
                <span className="text-xs font-bold">Volcano</span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700 dark:text-amber-300">
                  Default
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Molten magma fissures & rising glowing embers.
              </p>
            </button>

            {/* 2. Galaxy */}
            <button
              type="button"
              onClick={() => onSelectTheme('galaxy')}
              id="settings-theme-galaxy-btn"
              className={`flex flex-col items-start rounded-2xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer ${
                currentTheme === 'galaxy'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/40'
                  : 'border-slate-200/90 bg-white/70 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🌌</span>
                <span className="text-xs font-bold">Galaxy</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Cosmic void, twinkling stars & shooting meteors.
              </p>
            </button>

            {/* 3. Cherry Blossom */}
            <button
              type="button"
              onClick={() => onSelectTheme('cherry_blossom')}
              id="settings-theme-cherry_blossom-btn"
              className={`flex flex-col items-start rounded-2xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer ${
                currentTheme === 'cherry_blossom'
                  ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-300 ring-2 ring-pink-500/40'
                  : 'border-slate-200/90 bg-white/70 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <span className="text-xs font-bold">Cherry Blossom</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Dancing sakura petals & spring light radiance.
              </p>
            </button>

            {/* 4. Ocean */}
            <button
              type="button"
              onClick={() => onSelectTheme('ocean')}
              id="settings-theme-ocean-btn"
              className={`flex flex-col items-start rounded-2xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer ${
                currentTheme === 'ocean'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 ring-2 ring-cyan-500/40'
                  : 'border-slate-200/90 bg-white/70 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🌊</span>
                <span className="text-xs font-bold">Ocean</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Deep sea abyss with rising bioluminescent bubbles.
              </p>
            </button>
          </div>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <Globe className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span>Local Timezone</span>
            </div>
            <div className="text-xs text-neutral-500">
              Determines the 11:59:59 PM deadline and rollover.
            </div>
          </div>
          <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 shrink-0">
            {localTimezone}
          </span>
        </div>
      </div>

      {/* Section 2: Automatic Midnight Rollover Engine */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          Midnight Rollover Engine
        </h3>
        <div className="rounded-xl bg-neutral-50 p-3.5 text-xs text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Automatic Rollover Time: 12:00:00 AM (Midnight)</span>
          </div>
          <p>
            At 12:00:00 AM local time, yesterday's workspace closes, all unfinished tasks transition to <span className="font-semibold text-rose-600 dark:text-rose-400">Missed</span>, and a clean slate opens for the new date.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <div className="text-xs text-neutral-500">
            Force immediate re-evaluation of tasks:
          </div>
          <button
            type="button"
            onClick={handleManualRolloverCheck}
            disabled={isCheckingRollover}
            id="manual-rollover-check-btn"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 cursor-pointer no-overlap-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isCheckingRollover ? 'animate-spin' : ''}`} />
            <span>Run Rollover Check</span>
          </button>
        </div>
      </div>

      {/* Section 3: Data & Persistence */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          Data & Persistence
        </h3>
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <Database className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Storage Status</span>
            </div>
            <div className="text-xs text-neutral-500">
              IndexedDB browser database with backup.
            </div>
          </div>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
            {taskCount} Tasks Saved
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
          {onOpenOrganizeTasks && (
            <button
              type="button"
              onClick={onOpenOrganizeTasks}
              id="settings-organize-tasks-btn"
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs font-bold text-purple-900 hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-950/30 dark:text-purple-200 dark:hover:bg-purple-900/50 cursor-pointer no-overlap-btn"
            >
              <CalendarClock className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Organize Task Timeline</span>
            </button>
          )}

          {onSeedHistoricalArchive && currentUser?.email?.toLowerCase() === 'arnab.bhtt06@gmail.com' && (
            <button
              type="button"
              onClick={async () => {
                setIsSeedingArchive(true);
                try {
                  const count = await onSeedHistoricalArchive();
                  showToast(`Successfully synced and saved ${count} historical tasks (Sep 2025 – Sep 2026)!`);
                } catch {
                  showToast('Failed to sync historical task archive.');
                } finally {
                  setIsSeedingArchive(false);
                }
              }}
              disabled={isSeedingArchive}
              id="settings-seed-historical-btn"
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs font-bold text-amber-950 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/50 cursor-pointer no-overlap-btn"
            >
              <RefreshCw className={`h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 ${isSeedingArchive ? 'animate-spin' : ''}`} />
              <span>{isSeedingArchive ? 'Syncing Historical Tasks...' : 'Sync Sep 2025–2026 Archive'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExport}
            id="settings-export-btn"
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 cursor-pointer no-overlap-btn"
          >
            <Download className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Export Tasks (JSON)</span>
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 no-overlap-btn">
            <Upload className="h-4 w-4 text-cyan-600 shrink-0" />
            <span>Import Tasks (JSON)</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </label>

          {showClearConfirm ? (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-rose-50 p-2 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                Are you sure?
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    await onClearAllTasks();
                    setShowClearConfirm(false);
                    showToast('All tasks cleared.');
                  }}
                  id="confirm-clear-all-btn"
                  className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer no-overlap-btn"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 cursor-pointer no-overlap-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              id="settings-clear-all-btn"
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-950/40 cursor-pointer no-overlap-btn"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span>Clear All Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
