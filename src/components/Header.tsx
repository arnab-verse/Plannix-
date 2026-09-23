/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  BarChart3,
  History,
  Settings,
  Clock,
  Sparkles,
  Flower2,
  Flame,
  Waves,
  LogIn,
  LogOut,
  Palette,
  ChevronDown,
  Check,
  ListTodo,
  Mail,
  X,
  ShieldCheck,
} from 'lucide-react';
import { AppView, AppTheme, UserProfile, NavigationTab } from '../types';

interface HeaderProps {
  currentView?: AppView;
  activeTab?: NavigationTab;
  onSelectView?: (view: AppView) => void;
  onSelectTab?: (tab: NavigationTab) => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  todayCount?: { total: number; completed: number };
  todayTaskCount?: number;
  todayMetrics?: {
    total: number;
    completedOnTime: number;
    completedLate: number;
    missed: number;
  };
  activeMetricFilter?: 'all' | 'on_time' | 'late' | 'missed';
  onSelectMetricFilter?: (filter: 'all' | 'on_time' | 'late' | 'missed') => void;
  totalTasksCount?: number;
  completedTasksCount?: number;
  currentUser: UserProfile | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

const LiveClock: React.FC = React.memo(() => {
  const [timeString, setTimeString] = useState<string>(() => {
    return new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  });

  useEffect(() => {
    const update = () => {
      setTimeString(
        new Date().toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="tabular-nums font-medium whitespace-nowrap">{timeString}</span>;
});

export const Header: React.FC<HeaderProps> = React.memo(({
  currentView,
  activeTab,
  onSelectView,
  onSelectTab,
  currentTheme,
  onSelectTheme,
  todayCount,
  todayTaskCount,
  todayMetrics,
  activeMetricFilter = 'all',
  onSelectMetricFilter,
  totalTasksCount = 0,
  completedTasksCount = 0,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const activeCurrentView: AppView = currentView || (activeTab as AppView) || 'today';
  const resolvedTodayCount =
    todayCount ||
    (typeof todayTaskCount === 'number'
      ? { total: todayTaskCount, completed: 0 }
      : { total: 0, completed: 0 });

  const metrics = todayMetrics || {
    total: resolvedTodayCount.total,
    completedOnTime: resolvedTodayCount.completed,
    completedLate: 0,
    missed: 0,
  };

  const handleSelectView = (view: AppView) => {
    if (view === 'auth') {
      if (onOpenAuth) onOpenAuth();
      if (onSelectView) onSelectView('auth');
    } else {
      if (onSelectView) onSelectView(view);
      if (onSelectTab) onSelectTab(view as NavigationTab);
    }
  };

  const [isThemesOpen, setIsThemesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const themesMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (themesMenuRef.current && !themesMenuRef.current.contains(target)) {
        setIsThemesOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };
    if (isThemesOpen || isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemesOpen, isProfileOpen]);

  // Settings removed from the top navigation bar per user request and moved to the top right corner!
  const navItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: CheckCircle2 },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  const themeOptions: {
    id: AppTheme;
    label: string;
    emoji: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'volcano',
      label: 'Volcano',
      emoji: '🌋',
      description: 'Molten magma fissures & glowing embers',
      Icon: Flame,
      accentColor: 'text-orange-600 dark:text-amber-300',
    },
    {
      id: 'galaxy',
      label: 'Galaxy',
      emoji: '🌌',
      description: 'Cosmic void, twinkling stars & meteors',
      Icon: Sparkles,
      accentColor: 'text-purple-600 dark:text-purple-300',
    },
    {
      id: 'cherry_blossom',
      label: 'Cherry Blossom',
      emoji: '🌸',
      description: 'Dancing sakura blossoms, fluttering petals & spring radiance',
      Icon: Flower2,
      accentColor: 'text-pink-600 dark:text-pink-300',
    },
    {
      id: 'ocean',
      label: 'Ocean',
      emoji: '🌊',
      description: 'Deep sea abyss & rising bubbles',
      Icon: Waves,
      accentColor: 'text-cyan-600 dark:text-cyan-300',
    },
  ];

  // Brand Icon & Badge based on current theme
  const getBrandDetails = () => {
    switch (currentTheme) {
      case 'volcano':
        return {
          icon: <Flame className="h-5 w-5 animate-pulse text-amber-200" />,
          gradient: 'from-amber-500 via-orange-600 to-red-600 shadow-[0_0_18px_rgba(239,68,68,0.4)]',
          badgeClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
          themeLabel: 'Volcano',
        };
      case 'ocean':
        return {
          icon: <Waves className="h-5 w-5 animate-pulse text-cyan-200" />,
          gradient: 'from-teal-400 via-cyan-600 to-blue-600 shadow-[0_0_18px_rgba(6,182,212,0.4)]',
          badgeClass: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
          themeLabel: 'Ocean',
        };
      case 'galaxy':
        return {
          icon: <Sparkles className="h-5 w-5 animate-pulse text-purple-200" />,
          gradient: 'from-indigo-600 via-purple-600 to-pink-600 shadow-[0_0_18px_rgba(168,85,247,0.4)]',
          badgeClass: 'border-purple-500/30 bg-purple-950/40 text-purple-300',
          themeLabel: 'Galaxy',
        };
      case 'cherry_blossom':
      default:
        return {
          icon: <Flower2 className="h-5 w-5 animate-pulse text-rose-100" />,
          gradient: 'from-pink-400 via-rose-500 to-amber-200 shadow-xs shadow-pink-200/80',
          badgeClass: 'border-pink-200/90 bg-pink-50 text-rose-800 dark:border-pink-500/30 dark:bg-pink-950/40 dark:text-pink-300',
          themeLabel: 'Cherry Blossom',
        };
    }
  };

  const brand = getBrandDetails();

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100/90 bg-white/75 backdrop-blur-md transition-colors duration-500 dark:border-purple-500/20 dark:bg-[#070818]/75 dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Top Row on mobile: Brand on Left, Settings/Themes/Auth on Right */}
          <div className="mobile-header-top flex items-center justify-between gap-2 min-w-0">
            {/* Brand & Dynamic Clock */}
            <div
              onClick={() => onSelectView('today')}
              className="mobile-header-brand flex cursor-pointer items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90 min-w-0"
              id="brand-logo-btn"
            >
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white transition-all duration-500 ${brand.gradient}`}
              >
                {brand.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-slate-900 transition-colors duration-500 dark:text-white whitespace-nowrap">
                    Plannix <span className="text-[11px] sm:text-xs font-normal text-slate-500 dark:text-slate-400 whitespace-nowrap">(Your Task Manager)</span>
                  </h1>
                  <span
                    className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-bold lg:inline ${brand.badgeClass}`}
                  >
                    {brand.themeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3 shrink-0 text-sky-500 dark:text-purple-400" />
                  <LiveClock />
                </div>
              </div>
            </div>

            {/* TOP RIGHT CORNER: Themes Dropdown + SETTINGS BUTTON + User Account */}
            <div className="mobile-header-actions flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 md:order-3">
              {/* Themes Dropdown Button */}
              <div className="relative" ref={themesMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsThemesOpen((prev) => !prev)}
                  id="header-themes-btn"
                  aria-expanded={isThemesOpen}
                  aria-haspopup="true"
                  title="Click to view available themes"
                  className={`mobile-action-btn flex items-center gap-1.5 rounded-2xl border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all duration-300 cursor-pointer no-overlap-btn backdrop-blur-md ${
                    isThemesOpen
                      ? 'border-amber-400 bg-amber-50/90 text-amber-950 shadow-xs dark:border-amber-500/60 dark:bg-amber-950/60 dark:text-amber-200 ring-2 ring-amber-400/30'
                      : 'border-sky-200/70 bg-white/75 text-slate-700 hover:border-amber-300 hover:bg-amber-50/60 dark:border-purple-500/30 dark:bg-[#0c0e2a]/75 dark:text-slate-200 dark:hover:border-amber-500/40'
                  }`}
                >
                  <Palette className="h-3.5 w-3.5 text-orange-500 dark:text-amber-400 shrink-0" />
                  <span className="hidden md:inline">Themes</span>
                  <span className="flex items-center gap-1 rounded-lg bg-slate-100/90 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 dark:bg-white/10 dark:text-slate-200">
                    <span>{themeOptions.find((t) => t.id === currentTheme)?.emoji}</span>
                    <span className="hidden lg:inline">
                      {themeOptions.find((t) => t.id === currentTheme)?.label}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                      isThemesOpen ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>

                {/* Dropdown displaying available themes */}
                {isThemesOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    id="header-themes-dropdown"
                    className="absolute right-0 top-full mt-2 w-60 sm:w-64 rounded-2xl border-2 border-rose-400/80 bg-[#990011] p-2 shadow-[0_20px_45px_rgba(153,0,17,0.75),0_0_15px_rgba(220,20,60,0.5)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 select-none"
                    style={{ backgroundColor: '#990011', opacity: 1 }}
                  >
                    <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-rose-300/30 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                        Theme Atmosphere
                      </span>
                      <span className="text-[10px] font-semibold text-rose-100 bg-rose-900/60 px-1.5 py-0.5 rounded border border-rose-400/40">
                        Default: Volcano
                      </span>
                    </div>
                    <div className="space-y-1">
                      {themeOptions.map((th) => {
                        const isSelected = currentTheme === th.id;
                        return (
                          <button
                            key={th.id}
                            type="button"
                            role="menuitem"
                            id={`theme-option-${th.id}-btn`}
                            onClick={() => {
                              onSelectTheme(th.id);
                              setIsThemesOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white/25 text-white font-bold border border-white/50 shadow-sm'
                                : 'text-rose-100 hover:bg-white/15 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{th.emoji}</span>
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-white">
                                  <span>{th.label}</span>
                                  {th.id === 'volcano' && (
                                    <span className="rounded bg-white/30 px-1 py-0.2 text-[9px] font-extrabold text-white">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-normal text-rose-200 leading-tight block">
                                  {th.description}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-white shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SETTINGS BUTTON: Positioned in top right corner for better spacing and accessible everywhere */}
              <button
                type="button"
                onClick={() => handleSelectView('settings')}
                id="header-settings-btn"
                aria-label="Settings"
                title="Settings & Preferences"
                className={`mobile-action-btn flex items-center gap-1.5 rounded-2xl border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all duration-300 cursor-pointer no-overlap-btn backdrop-blur-md ${
                  activeCurrentView === 'settings'
                    ? 'border-indigo-400 bg-indigo-50/90 text-indigo-950 shadow-xs dark:border-indigo-500/60 dark:bg-indigo-950/60 dark:text-indigo-200 ring-2 ring-indigo-400/30'
                    : 'border-sky-200/70 bg-white/75 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-purple-500/30 dark:bg-[#0c0e2a]/75 dark:text-slate-200 dark:hover:border-indigo-500/40'
                }`}
              >
                <Settings
                  className={`h-3.5 w-3.5 shrink-0 ${
                    activeCurrentView === 'settings'
                      ? 'rotate-45 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400'
                  } transition-transform duration-300`}
                />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {/* User Account / Profile Button Only */}
              {currentUser ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    id="header-profile-pic-btn"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                    title={`Click to view profile & details: ${currentUser.name}`}
                    className={`group relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                      isProfileOpen
                        ? 'ring-2 ring-sky-500 shadow-md scale-105 dark:ring-purple-400'
                        : 'hover:ring-2 hover:ring-sky-300 dark:hover:ring-purple-400/60'
                    }`}
                  >
                    <img
                      src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-sky-300/80 dark:border-purple-400/60 shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070818]" />
                  </button>

                  {/* Profile Details Popover Dropdown */}
                  {isProfileOpen && (
                    <div
                      id="profile-details-popover"
                      className="absolute right-0 mt-2.5 w-72 sm:w-80 rounded-3xl border border-sky-100 bg-white/90 p-4 sm:p-5 shadow-[0_16px_40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-purple-500/30 dark:bg-[#0c0e2a]/90 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Top bar with Close */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-500/20 pb-3">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-purple-200">
                          <ShieldCheck className="h-4 w-4 text-sky-500 dark:text-purple-400" />
                          <span>User Profile</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsProfileOpen(false)}
                          id="profile-popover-close-btn"
                          aria-label="Close profile details"
                          className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-purple-950/60 dark:hover:text-slate-200 cursor-pointer transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* User Info Header */}
                      <div className="mt-4 flex flex-col items-center text-center">
                        <div className="relative">
                          <img
                            src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                            alt={currentUser.name}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-sky-400 object-cover shadow-sm dark:border-purple-400"
                          />
               <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c0e2a]" />
                        </div>
                        <h3 className="mt-2.5 text-sm sm:text-base font-black text-slate-900 dark:text-white truncate max-w-full">
                          {currentUser.name}
                        </h3>
                        <div className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-full">
                          <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{currentUser.email || 'Registered User'}</span>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 uppercase dark:bg-purple-950/80 dark:text-purple-300">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            {currentUser.authProvider === 'google' ? 'Google Account' : 'Email ID Login'}
                          </span>
                        </div>
                      </div>

                      {/* Stats Section: Total Tasks Raised Till Date */}
                      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50/90 p-2.5 dark:bg-[#111333]/90 border border-slate-100 dark:border-purple-500/20 backdrop-blur-md">
                        <div className="rounded-xl bg-white/80 p-2.5 text-center shadow-2xs dark:bg-slate-900/80">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <ListTodo className="h-3 w-3 text-sky-500 dark:text-purple-400" />
                            <span>Total Tasks</span>
                          </div>
                          <div className="mt-1 text-lg font-black text-slate-900 dark:text-white tabular-nums">
                            {totalTasksCount}
                          </div>
                          <div className="text-[10px] text-slate-400">Raised till date</div>
                        </div>

                        <div className="rounded-xl bg-white p-2.5 text-center shadow-2xs dark:bg-slate-900/90">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Completed</span>
                          </div>
                          <div className="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {completedTasksCount}
                          </div>
                          <div className="text-[10px] text-slate-400">Completed on record</div>
                        </div>
                      </div>

                      {/* Log Out Button at the very end */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-purple-500/20">
                        {onLogout && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              onLogout();
                            }}
                            id="header-profile-logout-btn"
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 py-2.5 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Log Out</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectView('auth')}
                  id="header-auth-btn"
                  className="mobile-action-btn flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white/90 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-purple-500/30 dark:bg-[#0c0e2a]/90 dark:text-slate-200 dark:hover:border-purple-400/50 cursor-pointer no-overlap-btn"
                >
                  <LogIn className="h-3.5 w-3.5 text-sky-600 dark:text-purple-400 shrink-0" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Top 4 Metric Buttons / Stats Display (Theme-Adaptive) */}
          <div
            id="header-metric-buttons-container"
            className="w-full overflow-x-auto pb-0.5 md:w-auto md:order-2 md:pb-0 scrollbar-none"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSelectMetricFilter) onSelectMetricFilter('all');
                  if (onSelectView) onSelectView('today');
                  if (onSelectTab) onSelectTab('today');
                }}
                id="header-metric-total-btn"
                className={`mobile-action-btn flex items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer no-overlap-btn ${
                  activeMetricFilter === 'all' && activeCurrentView === 'today'
                    ? 'border-sky-400 bg-sky-50 text-sky-800 ring-2 ring-sky-300 dark:border-cyan-400/80 dark:bg-cyan-950/60 dark:text-cyan-200 dark:ring-cyan-500/40 glow-cyan'
                    : 'border-slate-200/90 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total:</span>
                <span className="font-bold text-slate-900 dark:text-white">{metrics.total}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectMetricFilter) onSelectMetricFilter('on_time');
                  if (onSelectView) onSelectView('today');
                  if (onSelectTab) onSelectTab('today');
                }}
                id="header-metric-ontime-btn"
                className={`mobile-action-btn flex items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer no-overlap-btn ${
                  activeMetricFilter === 'on_time' && activeCurrentView === 'today'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300 dark:border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-500/40 glow-green'
                    : 'border-emerald-200/90 bg-emerald-50/60 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
                }`}
              >
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">On-Time:</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-200">{metrics.completedOnTime}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectMetricFilter) onSelectMetricFilter('late');
                  if (onSelectView) onSelectView('today');
                  if (onSelectTab) onSelectTab('today');
                }}
                id="header-metric-late-btn"
                className={`mobile-action-btn flex items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer no-overlap-btn ${
                  activeMetricFilter === 'late' && activeCurrentView === 'today'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-300 dark:border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-500/40 glow-amber'
                    : 'border-amber-200/90 bg-amber-50/60 text-amber-700 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/40'
                }`}
              >
                <span className="text-[11px] text-amber-600 dark:text-amber-400">Late:</span>
                <span className="font-bold text-amber-800 dark:text-amber-200">{metrics.completedLate}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectMetricFilter) onSelectMetricFilter('missed');
                  if (onSelectView) onSelectView('today');
                  if (onSelectTab) onSelectTab('today');
                }}
                id="header-metric-missed-btn"
                className={`mobile-action-btn flex items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer no-overlap-btn ${
                  activeMetricFilter === 'missed' && activeCurrentView === 'today'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-300 dark:border-rose-400 dark:bg-rose-950/60 dark:text-rose-200 dark:ring-rose-500/40 glow-red'
                    : 'border-rose-200/90 bg-rose-50/60 text-rose-700 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-500/20 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="text-[11px] text-rose-600 dark:text-rose-400">Missed:</span>
                <span className="font-bold text-rose-800 dark:text-rose-200">{metrics.missed}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
