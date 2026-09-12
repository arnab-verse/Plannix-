/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Check,
  RotateCcw,
  Trash2,
  Search,
} from 'lucide-react';
import { DailyTask } from '../types';
import {
  formatShortDate,
  formatDisplayDate,
  formatDateTime,
  formatLateDuration,
  formatMissedDuration,
} from '../utils/dateUtils';

interface StatisticsViewProps {
  tasks: DailyTask[];
  onToggleComplete?: (task: DailyTask) => void;
  onEditTask?: (id: string, newTitle: string, newNotes?: string) => void;
  onDeleteTask?: (id: string) => void;
}

type StatFilterType = 'total' | 'on_time' | 'late' | 'missed';

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<StatFilterType | null>('late');
  const [scope, setScope] = useState<'all' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskPendingDelete, setTaskPendingDelete] = useState<DailyTask | null>(null);
  const [visibleListLimit, setVisibleListLimit] = useState<number>(35);

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    const now = new Date();
    const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(curMonthKey);
    for (const t of tasks) {
      if (t.assignedDate) {
        monthSet.add(t.assignedDate.substring(0, 7));
      }
    }
    return Array.from(monthSet).sort().reverse();
  }, [tasks]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    availableMonths[0] || ''
  );

  const monthTasks = useMemo(() => {
    return tasks.filter((t) => t.assignedDate.startsWith(selectedMonthKey));
  }, [tasks, selectedMonthKey]);

  // The pool of tasks based on selected scope
  const activeTaskPool = useMemo(() => {
    return scope === 'month' ? monthTasks : tasks;
  }, [scope, monthTasks, tasks]);

  const stats = useMemo(() => {
    const total = activeTaskPool.length;
    const onTime = activeTaskPool.filter((t) => t.status === 'completed_on_time').length;
    const missed = activeTaskPool.filter((t) => t.status === 'missed').length;
    const late = activeTaskPool.filter((t) => t.status === 'completed_late').length;
    const pending = activeTaskPool.filter((t) => t.status === 'pending').length;
    const incompleteTotal = missed + pending;
    const completed = onTime + late;
    const overallRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onTimeRate = total > 0 ? Math.round((onTime / total) * 100) : 0;
    const lateRate = total > 0 ? Math.round((late / total) * 100) : 0;
    const missedRate = total > 0 ? Math.round((incompleteTotal / total) * 100) : 0;
    return {
      total,
      onTime,
      missed,
      late,
      pending,
      incompleteTotal,
      completed,
      overallRate,
      onTimeRate,
      lateRate,
      missedRate,
    };
  }, [activeTaskPool]);

  // Tasks filtered by the selected button
  const filteredTasks = useMemo(() => {
    if (!selectedFilter) return [];

    return activeTaskPool.filter((t) => {
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchNotes) return false;
      }

      if (selectedFilter === 'total') return true;
      if (selectedFilter === 'on_time') return t.status === 'completed_on_time';
      if (selectedFilter === 'late') return t.status === 'completed_late';
      if (selectedFilter === 'missed') return t.status === 'missed' || t.status === 'pending';
      return true;
    }).sort((a, b) => {
      // Sort newest assigned date first
      return b.assignedDate.localeCompare(a.assignedDate);
    });
  }, [activeTaskPool, selectedFilter, searchTerm]);

  const dailyBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; onTime: number; missed: number; late: number }>();
    for (const t of monthTasks) {
      const entry = map.get(t.assignedDate) || { total: 0, onTime: 0, missed: 0, late: 0 };
      entry.total++;
      if (t.status === 'completed_on_time') entry.onTime++;
      else if (t.status === 'missed' || t.status === 'pending') entry.missed++;
      else if (t.status === 'completed_late') entry.late++;
      map.set(t.assignedDate, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, data]) => ({
        dateStr,
        displayDate: formatShortDate(dateStr),
        ...data,
        rate: data.total > 0 ? Math.round(((data.onTime + data.late) / data.total) * 100) : 0,
      }));
  }, [monthTasks]);

  const formattedSelectedMonth = useMemo(() => {
    if (!selectedMonthKey) return '';
    const [y, m] = selectedMonthKey.split('-');
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [selectedMonthKey]);

  const handleCardClick = (type: StatFilterType) => {
    if (selectedFilter === type) {
      // If already active, keep it or toggle off
      setSelectedFilter(null);
    } else {
      setSelectedFilter(type);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      {/* Header card */}
      <div className="rounded-3xl border border-sky-100/90 bg-white/75 p-4 sm:p-6 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md transition-all duration-500 dark:border-purple-500/20 dark:bg-[#090c23]/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-purple-400">
              <BarChart3 className="h-4 w-4" />
              <span>Performance Analytics</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 transition-colors duration-500 dark:text-white">
              Statistics & Insights
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Click any metric button below to inspect tasks and review submission delays or missed durations.
            </p>
          </div>

          {/* Scope and Month selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-sky-200/80 bg-white/80 p-1 dark:border-purple-500/30 dark:bg-slate-900/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  scope === 'all'
                    ? 'bg-sky-500 text-white shadow-xs dark:bg-purple-600'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setScope('month')}
                className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  scope === 'month'
                    ? 'bg-sky-500 text-white shadow-xs dark:bg-purple-600'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                By Month
              </button>
            </div>

            {scope === 'month' && (
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                id="statistics-month-select"
                className="rounded-xl border border-sky-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-sky-400 focus:outline-none dark:border-purple-500/30 dark:bg-slate-900/80 dark:text-slate-200 cursor-pointer"
              >
                {availableMonths.map((m) => {
                  const [y, mm] = m.split('-');
                  const d = new Date(parseInt(y, 10), parseInt(mm, 10) - 1, 1);
                  const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
                  return (
                    <option key={m} value={m}>
                      {label}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* 4 Interactive Clickable Stat Buttons / Cards */}
        <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-4">
          {/* 1. Total Tasks Button */}
          <button
            type="button"
            onClick={() => handleCardClick('total')}
            className={`group flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-300 cursor-pointer ${
              selectedFilter === 'total'
                ? 'border-sky-500 bg-sky-50/90 shadow-[0_0_16px_rgba(14,165,233,0.3)] dark:border-purple-400 dark:bg-purple-950/60 ring-2 ring-sky-400 dark:ring-purple-400'
                : 'border-sky-100/90 bg-white/70 hover:border-sky-300 dark:border-purple-500/20 dark:bg-[#0c0e29]/70 dark:hover:border-purple-500/50'
            }`}
          >
            <div className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Total Tasks</span>
              <Clock className="h-3.5 w-3.5 text-sky-500 dark:text-purple-400 shrink-0" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{stats.completed} completed</span>
              <span className="text-[10px] text-sky-600 dark:text-purple-400 group-hover:underline">
                {selectedFilter === 'total' ? 'Active' : 'Click to view'}
              </span>
            </div>
          </button>

          {/* 2. Completed On Time Button */}
          <button
            type="button"
            onClick={() => handleCardClick('on_time')}
            className={`group flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-300 cursor-pointer ${
              selectedFilter === 'on_time'
                ? 'border-emerald-500 bg-emerald-100/80 shadow-[0_0_16px_rgba(16,185,129,0.35)] dark:border-emerald-400 dark:bg-emerald-950/70 ring-2 ring-emerald-400'
                : 'border-emerald-200/80 bg-emerald-50/70 hover:border-emerald-400 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:hover:border-emerald-400/70'
            }`}
          >
            <div className="flex items-center justify-between w-full text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="truncate">Completed On Time</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100">
              {stats.onTime}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <span>{stats.onTimeRate}% of total</span>
              <span className="text-[10px] underline">
                {selectedFilter === 'on_time' ? 'Active' : 'Click to view'}
              </span>
            </div>
          </button>

          {/* 3. Late Button */}
          <button
            type="button"
            onClick={() => handleCardClick('late')}
            className={`group flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-300 cursor-pointer ${
              selectedFilter === 'late'
                ? 'border-amber-500 bg-amber-100/80 shadow-[0_0_16px_rgba(245,158,11,0.35)] dark:border-amber-400 dark:bg-amber-950/70 ring-2 ring-amber-400'
                : 'border-amber-200/80 bg-amber-50/70 hover:border-amber-400 dark:border-amber-500/40 dark:bg-amber-950/30 dark:hover:border-amber-400/70'
            }`}
          >
            <div className="flex items-center justify-between w-full text-xs font-bold text-amber-800 dark:text-amber-300">
              <span className="truncate">Late</span>
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-100">
              {stats.late}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-between">
              <span>{stats.lateRate}% submitted late</span>
              <span className="text-[10px] underline">
                {selectedFilter === 'late' ? 'Active' : 'Click to view'}
              </span>
            </div>
          </button>

          {/* 4. Missed / Incomplete Button */}
          <button
            type="button"
            onClick={() => handleCardClick('missed')}
            className={`group flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-300 cursor-pointer ${
              selectedFilter === 'missed'
                ? 'border-rose-500 bg-rose-100/80 shadow-[0_0_16px_rgba(244,63,94,0.35)] dark:border-rose-400 dark:bg-rose-950/70 ring-2 ring-rose-400'
                : 'border-rose-200/80 bg-rose-50/70 hover:border-rose-400 dark:border-rose-500/40 dark:bg-rose-950/30 dark:hover:border-rose-400/70'
            }`}
          >
            <div className="flex items-center justify-between w-full text-xs font-bold text-rose-800 dark:text-rose-300">
              <span className="truncate">Missed / Incomplete</span>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-900 dark:text-rose-100">
              {stats.incompleteTotal}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <span>{stats.missedRate}% of total</span>
              <span className="text-[10px] underline">
                {selectedFilter === 'missed' ? 'Active' : 'Click to view'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Task List Section Triggered by Clicking the Buttons */}
      {selectedFilter && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-sky-100/90 bg-white/85 p-4 sm:p-6 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md dark:border-purple-500/20 dark:bg-[#090c23]/85"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 dark:border-purple-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full shrink-0 ${
                    selectedFilter === 'on_time'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : selectedFilter === 'late'
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                      : selectedFilter === 'missed'
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                      : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]'
                  }`}
                />
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {selectedFilter === 'total' && `All Tasks (${filteredTasks.length})`}
                  {selectedFilter === 'on_time' && `Completed On Time Tasks (${filteredTasks.length})`}
                  {selectedFilter === 'late' && `Late Completed Tasks (${filteredTasks.length})`}
                  {selectedFilter === 'missed' && `Missed & Incomplete Tasks (${filteredTasks.length})`}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {selectedFilter === 'late' &&
                  'Review exactly how late each task was submitted after its midnight deadline.'}
                {selectedFilter === 'missed' &&
                  'Review how many minutes, hours, or days have passed since each task was missed.'}
                {selectedFilter === 'on_time' &&
                  'Tasks finished prior to their midnight deadline.'}
                {selectedFilter === 'total' &&
                  'Complete list of tasks logged for the selected scope.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter list..."
                  className="rounded-xl border border-sky-200/80 bg-white/90 pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none dark:border-purple-500/30 dark:bg-slate-900/90 dark:text-white w-36 sm:w-48"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedFilter(null)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Task cards list */}
          <div className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.slice(0, visibleListLimit).map((task) => {
                  const isOnTime = task.status === 'completed_on_time';
                  const isLate = task.status === 'completed_late';
                  const isMissed = task.status === 'missed' || task.status === 'pending';

                  // Exact timing text required by user
                  const lateText = isLate && task.completedAt
                    ? formatLateDuration(task.assignedDate, task.completedAt)
                    : null;
                  const missedText = isMissed
                    ? formatMissedDuration(task.assignedDate)
                    : null;

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 ${
                        isOnTime
                          ? 'border-emerald-300/80 bg-emerald-50/40 dark:border-emerald-500/40 dark:bg-[#0c1a18]/60'
                          : isLate
                          ? 'border-amber-300/80 bg-amber-50/40 dark:border-amber-500/40 dark:bg-[#1a1609]/60'
                          : 'border-rose-300/80 bg-rose-50/40 dark:border-rose-500/40 dark:bg-[#1a0a10]/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {onToggleComplete && (
                            <button
                              type="button"
                              onClick={() => onToggleComplete(task)}
                              title={
                                !isOnTime && !isLate
                                  ? 'Mark as completed'
                                  : 'Click to undo completion'
                              }
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                                isOnTime
                                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                                  : isLate
                                  ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                                  : 'border-slate-300 bg-white hover:border-sky-400 dark:border-slate-600 dark:bg-slate-800'
                              }`}
                            >
                              {isOnTime ? (
                                <Check className="h-4 w-4 stroke-[3]" />
                              ) : isLate ? (
                                <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                              ) : null}
                            </button>
                          )}

                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm sm:text-base font-bold tracking-tight ${
                                isOnTime
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : isLate
                                  ? 'text-amber-700 dark:text-amber-300'
                                  : 'text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.notes && (
                              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Badges & Timing Indicator */}
                        <div className="flex flex-col sm:items-end gap-1.5 self-start shrink-0">
                          {/* How Late / How Long Missed Timing Badge */}
                          {isLate && lateText && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/90 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 shadow-xs dark:border-amber-500/50 dark:bg-amber-950/80 dark:text-amber-200">
                              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                              <span>{lateText}</span>
                            </span>
                          )}

                          {isMissed && missedText && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/90 bg-rose-100 px-3 py-1 text-xs font-black text-rose-900 shadow-xs dark:border-rose-500/50 dark:bg-rose-950/80 dark:text-rose-200">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                              <span>{missedText}</span>
                            </span>
                          )}

                          {isOnTime && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/90 bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 shadow-xs dark:border-emerald-500/50 dark:bg-emerald-950/80 dark:text-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Completed On Time</span>
                            </span>
                          )}

                          {onDeleteTask && (
                            <button
                              type="button"
                              onClick={() => setTaskPendingDelete(task)}
                              title="Delete task"
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer self-end p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Timestamps row: Target Date, Time Entered, Time Completed */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-slate-200/60 pt-2.5 dark:border-purple-500/20 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-sky-500 dark:text-purple-400 shrink-0" />
                          <span>
                            Target Date: <strong className="text-slate-900 dark:text-white">{formatDisplayDate(task.assignedDate)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-sky-500 dark:text-purple-400 shrink-0" />
                          <span>
                            Entered: <strong className="text-slate-900 dark:text-white">{formatDateTime(task.createdAt)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {task.completedAt ? (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isLate ? 'text-amber-500' : 'text-emerald-500'}`} />
                              <span>
                                Completed:{' '}
                                <strong className={`font-bold ${isLate ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                                  {formatDateTime(task.completedAt)}
                                </strong>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-bold">Not completed yet</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No tasks match this filter.
                </div>
              )}
            </AnimatePresence>

            {filteredTasks.length > visibleListLimit && (
              <div className="flex items-center justify-center pt-3">
                <button
                  type="button"
                  onClick={() => setVisibleListLimit((prev) => Math.min(prev + 40, filteredTasks.length))}
                  className="rounded-2xl border border-sky-300 bg-white/90 px-6 py-2 text-xs font-bold text-sky-800 hover:bg-sky-50 dark:border-purple-500/40 dark:bg-[#0c0e29] dark:text-purple-300 dark:hover:bg-purple-950/50 shadow-xs cursor-pointer transition-all"
                >
                  Show More Tasks ({visibleListLimit} of {filteredTasks.length} shown)
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Daily Activity Chart for Selected Month */}
      <div className="rounded-3xl border border-sky-100/90 bg-white/80 p-4 sm:p-6 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md transition-all duration-500 dark:border-purple-500/20 dark:bg-[#090c23]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
          Daily Completion Activity · {formattedSelectedMonth}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Visual comparison of tasks finished on time, finished late, and missed per day.
        </p>

        {dailyBreakdown.length > 0 ? (
          <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
            {dailyBreakdown.map((day) => (
              <div
                key={day.dateStr}
                className="rounded-2xl border border-sky-100/80 bg-white/60 p-3 sm:p-3.5 backdrop-blur-md dark:border-purple-500/20 dark:bg-[#0c0e29]/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-3.5 w-3.5 text-sky-500 dark:text-purple-400 shrink-0" />
                    <span>{day.displayDate}</span>
                    <span className="text-slate-400 font-medium">({day.total} {day.total === 1 ? 'task' : 'tasks'})</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-emerald-700 dark:text-emerald-300">
                      {day.onTime} on time
                    </span>
                    <span className="text-amber-700 dark:text-amber-300">
                      {day.late} late
                    </span>
                    <span className="text-rose-700 dark:text-rose-300">
                      {day.missed} missed
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white min-w-[32px] text-right">
                      {day.rate}%
                    </span>
                  </div>
                </div>

                {/* Progress bar per day */}
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900 border border-sky-100/50 dark:border-purple-500/20 flex shadow-inner">
                  {day.onTime > 0 && (
                    <div
                      style={{ width: `${(day.onTime / day.total) * 100}%` }}
                      className="bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                    />
                  )}
                  {day.late > 0 && (
                    <div
                      style={{ width: `${(day.late / day.total) * 100}%` }}
                      className="bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]"
                    />
                  )}
                  {day.missed > 0 && (
                    <div
                      style={{ width: `${(day.missed / day.total) * 100}%` }}
                      className="bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            No task records found for this month yet.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal for StatisticsView */}
      <AnimatePresence>
        {taskPendingDelete && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setTaskPendingDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-rose-800/60 dark:bg-[#0c0e29]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-xs">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Delete Task?
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to delete this task?
                  </p>
                  <div className="mt-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-3 sm:p-3.5 dark:border-purple-500/25 dark:bg-[#12153a]/80">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                      "{taskPendingDelete.title}"
                    </p>
                    {taskPendingDelete.notes && (
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {taskPendingDelete.notes}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Assigned: {formatDisplayDate(taskPendingDelete.assignedDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskPendingDelete(null)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-purple-500/30 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = taskPendingDelete.id;
                    setTaskPendingDelete(null);
                    if (onDeleteTask) onDeleteTask(id);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Yes, Delete Task</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

