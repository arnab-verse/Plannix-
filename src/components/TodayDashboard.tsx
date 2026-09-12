/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  CalendarClock,
  CalendarPlus,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import { DailyTask, NavigationTab } from '../types';
import { TaskItem } from './TaskItem';
import { NavigationGrid } from './NavigationGrid';
import {
  formatDisplayDate,
  formatShortDate,
  getTodayLocalStr,
  getTomorrowLocalStr,
  isDateInFuture,
} from '../utils/dateUtils';

interface TodayDashboardProps {
  tasks: DailyTask[];
  allTasks?: DailyTask[];
  onAddTask: (title: string, notes?: string, assignedDate?: string) => void;
  onToggleComplete: (task: DailyTask) => void;
  onEditTask: (id: string, newTitle: string, newNotes?: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenOrganizeTasks?: () => void;
  onNavigateToCalendar?: () => void;
  onSelectTab?: (tab: NavigationTab) => void;
  currentTab?: NavigationTab;
  activeMetricFilter?: 'all' | 'on_time' | 'late' | 'missed';
  onSelectMetricFilter?: (filter: 'all' | 'on_time' | 'late' | 'missed') => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  tasks,
  allTasks = [],
  onAddTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenOrganizeTasks,
  onNavigateToCalendar,
  onSelectTab,
  currentTab = 'today',
  activeMetricFilter = 'all',
  onSelectMetricFilter,
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [showNotesField, setShowNotesField] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');
  const [dashboardTab, setDashboardTab] = useState<'today' | 'upcoming'>('today');

  const todayStr = getTodayLocalStr();
  const tomorrowStr = getTomorrowLocalStr();
  const [targetDate, setTargetDate] = useState<string>(todayStr);
  const [scheduleToast, setScheduleToast] = useState<string | null>(null);

  const displayDateStr = formatDisplayDate(todayStr);

  // Future scheduled tasks (assignedDate in the future)
  const futureTasks = useMemo(() => {
    return allTasks
      .filter((t) => isDateInFuture(t.assignedDate))
      .sort((a, b) => {
        const cmp = a.assignedDate.localeCompare(b.assignedDate);
        if (cmp !== 0) return cmp;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [allTasks]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const chosenDate = targetDate || todayStr;
    onAddTask(taskInput.trim(), notesInput.trim() || undefined, chosenDate);

    if (isDateInFuture(chosenDate)) {
      setScheduleToast(`Scheduled for ${formatDisplayDate(chosenDate)}!`);
      setTimeout(() => setScheduleToast(null), 5000);
    }

    setTaskInput('');
    setNotesInput('');
    setShowNotesField(false);
  };

  // Metrics for today
  const totalCount = tasks.length;
  const completedOnTimeCount = tasks.filter((t) => t.status === 'completed_on_time').length;
  const completedLateCount = tasks.filter((t) => t.status === 'completed_late').length;
  const missedCount = tasks.filter((t) => t.status === 'missed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const totalCompleted = completedOnTimeCount + completedLateCount;
  const percentage = totalCount > 0 ? Math.round((totalCompleted / totalCount) * 100) : 0;

  // Filter tasks based on active pill and metric filter from top header
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Metric filter from top 4 buttons (Total / On Time / Late / Missed)
      if (activeMetricFilter === 'on_time') {
        if (task.status !== 'completed_on_time') return false;
      } else if (activeMetricFilter === 'late') {
        if (task.status !== 'completed_late') return false;
      } else if (activeMetricFilter === 'missed') {
        if (task.status !== 'missed') return false;
      }

      const isFinished = task.status === 'completed_on_time' || task.status === 'completed_late';
      if (filterMode === 'active') return !isFinished;
      if (filterMode === 'completed') return isFinished;
      return true;
    });
  }, [tasks, filterMode, activeMetricFilter]);

  const isTargetFuture = isDateInFuture(targetDate);

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      {/* Top Banner: Day of the Week & Current Date */}
      <div className="rounded-3xl border border-sky-100/90 bg-white/75 p-4.5 sm:p-6 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md transition-all duration-500 dark:border-purple-500/20 dark:bg-[#090c23]/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-purple-400">
              <Calendar className="h-4 w-4" />
              <span>Today's Workspace</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 transition-colors duration-500 dark:text-white">
              {displayDateStr}
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              Tasks finished before midnight qualify as on-time. Uncompleted tasks rollover to missed at midnight.
            </p>
          </div>

          {/* Quick status pill & Organize action */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto">
            {onOpenOrganizeTasks && (
              <button
                type="button"
                onClick={onOpenOrganizeTasks}
                id="header-organize-tasks-btn"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer no-overlap-btn"
              >
                <CalendarClock className="h-4 w-4 shrink-0" />
                <span>Organize Tasks</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-sky-200/80 bg-white/80 px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs backdrop-blur-md transition-all duration-500 dark:border-purple-500/30 dark:bg-[#0f1233]/80 dark:shadow-[0_0_16px_rgba(139,92,246,0.15)] shrink-0">
              <div className="text-right">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Today's Progress
                </div>
                <div className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                  {totalCompleted} / {totalCount}
                </div>
              </div>
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 font-black text-xs sm:text-sm text-white shadow-xs dark:from-indigo-600 dark:to-purple-600 dark:shadow-[0_0_14px_rgba(147,51,234,0.4)] shrink-0">
                {percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 sm:mt-6">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">
            <span>Progress Breakdown</span>
            <span>{percentage}% Complete</span>
          </div>
          <div className="h-3 sm:h-3.5 w-full overflow-hidden rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-sky-100/70 dark:border-purple-500/20 flex shadow-inner">
            {completedOnTimeCount > 0 && (
              <div
                style={{ width: `${(completedOnTimeCount / totalCount) * 100}%` }}
                className="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all duration-300"
                title={`${completedOnTimeCount} Completed On Time`}
              />
            )}
            {completedLateCount > 0 && (
              <div
                style={{ width: `${(completedLateCount / totalCount) * 100}%` }}
                className="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)] transition-all duration-300"
                title={`${completedLateCount} Completed Late`}
              />
            )}
            {missedCount > 0 && (
              <div
                style={{ width: `${(missedCount / totalCount) * 100}%` }}
                className="bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)] transition-all duration-300"
                title={`${missedCount} Missed Deadline`}
              />
            )}
          </div>
        </div>

        {/* 2-Row Workspace Navigation Grid (Replacing the 4 cards at the middle per user request):
            Row 1: Today and Statistics
            Row 2: Calendar and Task History */}
        <div className="mt-5 sm:mt-6">
          <NavigationGrid
            currentTab={currentTab}
            onSelectTab={onSelectTab || (() => {})}
            todayCount={{ total: totalCount, completed: totalCompleted }}
          />
        </div>

        {/* Status Legend */}
        <div className="mt-4 sm:mt-5 border-t border-sky-100/70 pt-3 sm:pt-4 dark:border-purple-500/20">
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">Color System:</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] shrink-0" />
              <span>Green = On Time</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0" />
              <span>Amber = Late</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] shrink-0" />
              <span>Red = Missed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Task Scheduling Feedback Toast */}
      {scheduleToast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-900 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{scheduleToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setDashboardTab('upcoming')}
            className="flex items-center gap-1 text-xs text-indigo-700 underline hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-white font-medium cursor-pointer"
          >
            <span>View Scheduled Tasks ({futureTasks.length})</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </motion.div>
      )}

      {/* Task Input Section with Responsive Layout */}
      <form
        onSubmit={handleAddSubmit}
        className="rounded-3xl border border-sky-100/90 bg-white/75 p-4 sm:p-5 shadow-[0_4px_24px_rgba(186,215,233,0.25)] backdrop-blur-md transition-all duration-300 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200/50 dark:border-purple-500/25 dark:bg-[#090c25]/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:focus-within:border-purple-500/70 dark:focus-within:ring-purple-500/20"
      >
        {/* Date Selection Row with Responsive Wrapping */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-sky-100/80 pb-3 dark:border-purple-500/20">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-purple-300 mr-1 shrink-0">
              Target Date:
            </span>
            <button
              type="button"
              onClick={() => setTargetDate(todayStr)}
              className={`rounded-xl px-2.5 sm:px-3 py-1.5 font-semibold transition-all duration-200 cursor-pointer no-overlap-btn ${
                targetDate === todayStr
                  ? 'bg-sky-600 text-white shadow-xs dark:bg-purple-600 dark:text-white dark:shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-purple-950/50'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTargetDate(tomorrowStr)}
              className={`rounded-xl px-2.5 sm:px-3 py-1.5 font-semibold transition-all duration-200 cursor-pointer no-overlap-btn ${
                targetDate === tomorrowStr
                  ? 'bg-sky-600 text-white shadow-xs dark:bg-purple-600 dark:text-white dark:shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-purple-950/50'
              }`}
            >
              Tomorrow
            </button>
            {/* Custom Date Picker */}
            <input
              type="date"
              id="target-task-date-picker"
              value={targetDate}
              min={todayStr}
              onChange={(e) => {
                if (e.target.value) setTargetDate(e.target.value);
              }}
              className={`rounded-xl border px-2.5 py-1 text-xs font-semibold cursor-pointer transition-all no-overlap-btn ${
                targetDate !== todayStr && targetDate !== tomorrowStr
                  ? 'border-sky-500 bg-sky-50/80 text-sky-900 dark:border-purple-500 dark:bg-purple-950/80 dark:text-purple-200 shadow-xs'
                  : 'border-sky-200/80 bg-slate-50/80 text-slate-700 hover:bg-slate-100 dark:border-purple-500/30 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-purple-950/50'
              }`}
              title="Choose custom date"
            />
          </div>

          {isTargetFuture && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-purple-400">
              <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
              <span>For {formatDisplayDate(targetDate)}</span>
              <button
                type="button"
                onClick={() => setTargetDate(todayStr)}
                className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer ml-1"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Title Input & Submit Row - Responsive stacking */}
        <div className="task-input-row flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <input
            type="text"
            id="new-task-title-input"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder={
              isTargetFuture
                ? `Schedule task for ${formatShortDate(targetDate)}...`
                : 'Add a task for today... (e.g. Finish project sprint)'
            }
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500 min-w-0"
          />

          <div className="task-input-actions flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNotesField(!showNotesField)}
              className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 dark:text-purple-300 dark:hover:text-purple-100 dark:hover:bg-purple-950/40 whitespace-nowrap cursor-pointer transition-colors no-overlap-btn"
            >
              {showNotesField ? 'Hide Notes' : '+ Note'}
            </button>
            <button
              type="submit"
              id="add-task-submit-btn"
              disabled={!taskInput.trim()}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer no-overlap-btn ${
                isTargetFuture
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-xs dark:from-purple-600 dark:to-indigo-600 dark:shadow-[0_0_14px_rgba(168,85,247,0.4)]'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xs dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 dark:hover:from-indigo-500 dark:hover:to-pink-500 dark:shadow-[0_0_16px_rgba(168,85,247,0.4)]'
              }`}
            >
              {isTargetFuture ? (
                <>
                  <CalendarPlus className="h-4 w-4 shrink-0" />
                  <span>Schedule Task</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Add Task</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showNotesField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3.5 pt-3.5 border-t border-sky-100/80 dark:border-purple-500/20"
          >
            <textarea
              id="new-task-notes-input"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              rows={2}
              placeholder="Optional additional notes, checklist details, or reminders..."
              className="w-full rounded-xl border border-sky-100/90 bg-white/50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none dark:border-purple-500/30 dark:bg-slate-950/50 dark:text-slate-200 dark:focus:border-purple-400 shadow-inner backdrop-blur-xs"
            />
          </motion.div>
        )}
      </form>

      {/* Primary Workspace Tabs: Today vs Upcoming & Scheduled */}
      <div className="workspace-tabs-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-sky-100/90 pb-3 dark:border-purple-500/20">
        <div className="workspace-tabs-group flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setDashboardTab('today')}
            id="tab-view-today"
            className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer no-overlap-btn backdrop-blur-md ${
              dashboardTab === 'today'
                ? 'bg-white/80 text-sky-950 shadow-xs border border-sky-200/80 dark:border-purple-500/40 dark:bg-purple-600/30 dark:text-purple-100 dark:shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'bg-transparent text-slate-600 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-purple-950/40'
            }`}
          >
            <span>Today's Tasks</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                dashboardTab === 'today'
                  ? 'bg-sky-100/90 text-sky-800 dark:bg-purple-900/80 dark:text-purple-200'
                  : 'bg-slate-200/70 text-slate-600 dark:bg-purple-950/50 dark:text-purple-300'
              }`}
            >
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('upcoming')}
            id="tab-view-upcoming"
            className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer no-overlap-btn backdrop-blur-md ${
              dashboardTab === 'upcoming'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs dark:from-indigo-600 dark:to-purple-600 dark:shadow-[0_0_14px_rgba(147,51,234,0.4)]'
                : 'bg-transparent text-slate-600 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-purple-950/40'
            }`}
          >
            <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
            <span>Upcoming</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                dashboardTab === 'upcoming'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/70 text-slate-600 dark:bg-purple-950/50 dark:text-purple-300'
              }`}
            >
              {futureTasks.length}
            </span>
          </button>

          {onOpenOrganizeTasks && (
            <button
              type="button"
              onClick={onOpenOrganizeTasks}
              id="tab-organize-tasks-btn"
              className="flex items-center gap-1.5 rounded-2xl border border-purple-300/80 bg-purple-50/75 px-3 sm:px-3.5 py-2 text-xs font-bold text-purple-900 shadow-2xs hover:bg-purple-100/90 dark:border-purple-500/40 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-900/50 backdrop-blur-md transition-all cursor-pointer no-overlap-btn"
            >
              <CalendarClock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Organize</span>
            </button>
          )}
        </div>

        {/* Filter controls (shown when in Today tab) */}
        {dashboardTab === 'today' && (
          <div className="flex items-center gap-1 rounded-2xl border border-sky-100/90 bg-slate-100/75 p-1 backdrop-blur-md dark:border-purple-500/20 dark:bg-[#0c0f28]/75 self-start sm:self-auto">
            {(['all', 'active', 'completed'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                id={`filter-today-${mode}-btn`}
                className={`rounded-xl px-2.5 sm:px-3 py-1 text-xs font-bold capitalize transition-all duration-150 cursor-pointer no-overlap-btn ${
                  filterMode === mode
                    ? 'bg-white/90 text-sky-950 shadow-xs border border-sky-200/70 dark:border-purple-500/40 dark:bg-purple-600/40 dark:text-purple-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {/* Calendar shortcut (shown when in Upcoming tab) */}
        {dashboardTab === 'upcoming' && onNavigateToCalendar && (
          <button
            type="button"
            onClick={onNavigateToCalendar}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 no-overlap-btn"
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>Open Calendar</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Active Metric Filter Badge (when user clicks Total, On Time, Late, Missed at top) */}
      {dashboardTab === 'today' && activeMetricFilter !== 'all' && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-200 bg-sky-50/90 px-4 py-2.5 text-xs font-semibold text-sky-900 dark:border-purple-500/40 dark:bg-purple-950/50 dark:text-purple-200">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                activeMetricFilter === 'on_time'
                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                  : activeMetricFilter === 'late'
                  ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
              }`}
            />
            <span>
              Filtered by:{' '}
              <strong className="capitalize">
                {activeMetricFilter === 'on_time'
                  ? 'Completed On Time'
                  : activeMetricFilter === 'late'
                  ? 'Completed Late'
                  : 'Missed Deadline'}
              </strong>{' '}
              ({filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectMetricFilter && onSelectMetricFilter('all')}
            className="text-xs font-bold text-sky-700 hover:text-sky-950 underline dark:text-purple-300 dark:hover:text-white cursor-pointer"
          >
            Show All Tasks
          </button>
        </div>
      )}

      {/* Tab Content 1: Today's Tasks */}
      {dashboardTab === 'today' && (
        <div className="space-y-3" id="today-tasks-container">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  showAssignedDate={false}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200/90 bg-white/60 py-12 text-center backdrop-blur-md dark:border-purple-500/20 dark:bg-[#090b22]/50 shadow-xs"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-xs dark:bg-purple-950/40 dark:text-purple-300">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {filterMode === 'all'
                    ? 'No tasks created for today yet'
                    : `No ${filterMode} tasks found for today`}
                </h4>
                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 px-4">
                  Add tasks above to organize your day, or schedule tasks ahead for upcoming days.
                </p>
                {totalCount === 0 && onOpenOrganizeTasks && (
                  <button
                    type="button"
                    onClick={onOpenOrganizeTasks}
                    id="organize-tasks-empty-btn"
                    className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:scale-[1.02] transition-all cursor-pointer no-overlap-btn"
                  >
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    <span>Organize Your Tasks</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tab Content 2: Upcoming & Scheduled Tasks */}
      {dashboardTab === 'upcoming' && (
        <div className="space-y-4" id="upcoming-tasks-container">
          <div className="rounded-2xl border border-sky-100/90 bg-white/70 p-4 text-xs text-slate-600 shadow-xs backdrop-blur-md dark:border-purple-500/25 dark:bg-[#0c0f2a]/70 dark:text-slate-300">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-purple-200">
              <CalendarPlus className="h-4 w-4 text-sky-600 dark:text-purple-400 shrink-0" />
              <span>Future Scheduled Tasks</span>
            </div>
            <p className="mt-1 leading-relaxed">
              These tasks are planned ahead for future dates. When that date arrives, the task will appear in your Today's workspace and automatically adhere to the 11:59:59 PM deadline.
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {futureTasks.length > 0 ? (
              futureTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  showAssignedDate={true}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200/90 bg-white/60 py-12 text-center backdrop-blur-md dark:border-purple-500/20 dark:bg-[#090b22]/50 shadow-xs"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-purple-950/40 dark:text-purple-300">
                  <CalendarPlus className="h-6 w-6" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                  No future tasks scheduled yet
                </h4>
                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 px-4">
                  Select a date in the Date picker above to schedule tasks ahead of time.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTargetDate(tomorrowStr);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 dark:from-indigo-600 dark:to-purple-600 dark:shadow-[0_0_14px_rgba(147,51,234,0.4)] cursor-pointer no-overlap-btn"
                >
                  <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                  <span>Schedule Task for Tomorrow</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
