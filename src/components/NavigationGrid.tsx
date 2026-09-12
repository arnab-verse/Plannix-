/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  BarChart3,
  Calendar as CalendarIcon,
  History,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface NavigationGridProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  todayCount?: { total: number; completed: number };
}

export const NavigationGrid: React.FC<NavigationGridProps> = ({
  currentTab,
  onSelectTab,
  todayCount,
}) => {
  const isTodayActive = currentTab === 'today';
  const isStatisticsActive = currentTab === 'statistics';
  const isCalendarActive = currentTab === 'calendar';
  const isHistoryActive = currentTab === 'history';

  const todayCompleted = todayCount?.completed ?? 0;
  const todayTotal = todayCount?.total ?? 0;

  return (
    <nav
      aria-label="Workspace Navigation"
      className="w-full space-y-2.5 sm:space-y-3"
      id="workspace-2row-navigation"
    >
      {/* Row 1: Today and Statistics */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* Today Button */}
        <button
          type="button"
          onClick={() => onSelectTab('today')}
          id="nav-grid-btn-today"
          className={`group relative flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer backdrop-blur-md ${
            isTodayActive
              ? 'border-2 border-sky-400 bg-white/85 shadow-md shadow-sky-200/50 dark:border-purple-500 dark:bg-[#12163b]/85 dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'border border-sky-100/90 bg-white/70 hover:bg-white/85 hover:border-sky-300 dark:border-purple-500/20 dark:bg-[#0c0e29]/70 dark:hover:bg-[#12163b]/80 dark:hover:border-purple-400/40 shadow-xs'
          }`}
        >
          <div
            className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
              isTodayActive
                ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs dark:from-indigo-600 dark:to-purple-600'
                : 'bg-slate-100/90 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-600 dark:bg-purple-950/40 dark:text-purple-300 dark:group-hover:bg-purple-900/50'
            }`}
          >
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span
                className={`font-black text-xs sm:text-sm md:text-base tracking-tight truncate ${
                  isTodayActive
                    ? 'text-sky-950 dark:text-white'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                Today
              </span>
              {todayTotal > 0 && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums shrink-0 ${
                    todayCompleted === todayTotal
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-sky-100 text-sky-800 dark:bg-purple-950/80 dark:text-purple-300'
                  }`}
                >
                  {todayCompleted}/{todayTotal}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Daily tasks & progress
            </p>
          </div>
        </button>

        {/* Statistics Button */}
        <button
          type="button"
          onClick={() => onSelectTab('statistics')}
          id="nav-grid-btn-statistics"
          className={`group relative flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer backdrop-blur-md ${
            isStatisticsActive
              ? 'border-2 border-indigo-400 bg-white/85 shadow-md shadow-indigo-200/50 dark:border-indigo-500 dark:bg-[#12163b]/85 dark:shadow-[0_0_20px_rgba(99,102,241,0.3)]'
              : 'border border-sky-100/90 bg-white/70 hover:bg-white/85 hover:border-indigo-300 dark:border-purple-500/20 dark:bg-[#0c0e29]/70 dark:hover:bg-[#12163b]/80 dark:hover:border-indigo-400/40 shadow-xs'
          }`}
        >
          <div
            className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
              isStatisticsActive
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs'
                : 'bg-slate-100/90 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-purple-950/40 dark:text-purple-300 dark:group-hover:bg-indigo-950/60'
            }`}
          >
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span
                className={`font-black text-xs sm:text-sm md:text-base tracking-tight truncate ${
                  isStatisticsActive
                    ? 'text-indigo-950 dark:text-white'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                Statistics
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                Metrics
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Completion & analytics
            </p>
          </div>
        </button>
      </div>

      {/* Row 2: Calendar and Task History */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* Calendar Button */}
        <button
          type="button"
          onClick={() => onSelectTab('calendar')}
          id="nav-grid-btn-calendar"
          className={`group relative flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer backdrop-blur-md ${
            isCalendarActive
              ? 'border-2 border-cyan-400 bg-white/85 shadow-md shadow-cyan-200/50 dark:border-cyan-500 dark:bg-[#12163b]/85 dark:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              : 'border border-sky-100/90 bg-white/70 hover:bg-white/85 hover:border-cyan-300 dark:border-purple-500/20 dark:bg-[#0c0e29]/70 dark:hover:bg-[#12163b]/80 dark:hover:border-cyan-400/40 shadow-xs'
          }`}
        >
          <div
            className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
              isCalendarActive
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xs'
                : 'bg-slate-100/90 text-slate-600 group-hover:bg-cyan-50 group-hover:text-cyan-600 dark:bg-purple-950/40 dark:text-purple-300 dark:group-hover:bg-cyan-950/60'
            }`}
          >
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span
                className={`font-black text-xs sm:text-sm md:text-base tracking-tight truncate ${
                  isCalendarActive
                    ? 'text-cyan-950 dark:text-white'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                Calendar
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Monthly
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Scheduled & planning
            </p>
          </div>
        </button>

        {/* Task History Button */}
        <button
          type="button"
          onClick={() => onSelectTab('history')}
          id="nav-grid-btn-history"
          className={`group relative flex items-center gap-2.5 sm:gap-3.5 rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer backdrop-blur-md ${
            isHistoryActive
              ? 'border-2 border-purple-400 bg-white/85 shadow-md shadow-purple-200/50 dark:border-purple-400 dark:bg-[#12163b]/85 dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'border border-sky-100/90 bg-white/70 hover:bg-white/85 hover:border-purple-300 dark:border-purple-500/20 dark:bg-[#0c0e29]/70 dark:hover:bg-[#12163b]/80 dark:hover:border-purple-400/40 shadow-xs'
          }`}
        >
          <div
            className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
              isHistoryActive
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xs'
                : 'bg-slate-100/90 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 dark:group-hover:bg-purple-900/60'
            }`}
          >
            <History className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span
                className={`font-black text-xs sm:text-sm md:text-base tracking-tight truncate ${
                  isHistoryActive
                    ? 'text-purple-950 dark:text-white'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                Task History
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Archive
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Completed history & logs
            </p>
          </div>
        </button>
      </div>
    </nav>
  );
};
