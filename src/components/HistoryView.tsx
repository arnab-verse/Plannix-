/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  Calendar,
  History,
  X,
  Clock,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Check,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { DailyTask } from '../types';
import { formatDisplayDate, formatDateTime } from '../utils/dateUtils';

interface HistoryViewProps {
  tasks: DailyTask[];
  onToggleComplete: (task: DailyTask) => void;
  onEditTask: (id: string, newTitle: string, newNotes?: string) => void;
  onDeleteTask: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_time' | 'late' | 'incomplete'>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM-DD or empty
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [taskPendingDelete, setTaskPendingDelete] = useState<DailyTask | null>(null);
  const [visibleDaysCount, setVisibleDaysCount] = useState<number>(35);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchNotes = task.notes ? task.notes.toLowerCase().includes(query) : false;
          if (!matchTitle && !matchNotes) return false;
        }

        if (statusFilter === 'on_time') {
          if (task.status !== 'completed_on_time') return false;
        } else if (statusFilter === 'late') {
          if (task.status !== 'completed_late') return false;
        } else if (statusFilter === 'incomplete') {
          if (task.status === 'completed_on_time' || task.status === 'completed_late') return false;
        }

        if (dateFilter) {
          if (task.assignedDate !== dateFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [tasks, searchTerm, statusFilter, dateFilter, sortOrder]);

  const groupedByDate = useMemo(() => {
    const groups: { dateStr: string; tasks: DailyTask[] }[] = [];
    const map = new Map<string, DailyTask[]>();
    for (const task of filteredTasks) {
      const list = map.get(task.assignedDate) || [];
      list.push(task);
      map.set(task.assignedDate, list);
    }
    const sortedDates = Array.from(map.keys()).sort((a, b) => {
      return sortOrder === 'newest' ? b.localeCompare(a) : a.localeCompare(b);
    });
    for (const d of sortedDates) {
      groups.push({ dateStr: d, tasks: map.get(d)! });
    }
    return groups;
  }, [filteredTasks, sortOrder]);

  const visibleGroups = useMemo(() => {
    return groupedByDate.slice(0, visibleDaysCount);
  }, [groupedByDate, visibleDaysCount]);

  const handleExportJson = () => {
    const dataStr = JSON.stringify(filteredTasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      {/* Header & Controls without Total / On Time / Late / Missed counts */}
      <div className="rounded-3xl border border-sky-100/90 bg-white/75 p-4 sm:p-6 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md transition-all duration-500 dark:border-purple-500/20 dark:bg-[#090c23]/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-purple-400">
              <History className="h-4 w-4" />
              <span>User Task History</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 transition-colors duration-500 dark:text-white">
              Task History
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Numbered tasks per day with entered and completion times, colored by status (Green, Amber, Red).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              id="export-history-btn"
              className="flex items-center gap-1.5 rounded-2xl border border-sky-200/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-sky-50 dark:border-purple-500/30 dark:bg-[#0c0e29] dark:text-slate-200 dark:hover:bg-purple-950/40 cursor-pointer no-overlap-btn"
            >
              <Download className="h-3.5 w-3.5 text-sky-600 dark:text-purple-400 shrink-0" />
              <span>Export History</span>
            </button>
          </div>
        </div>

        {/* Search, Status and Date Filters Bar */}
        <div className="mt-4 sm:mt-5 grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-12">
          {/* Keyword Search */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title or notes..."
              id="history-search-input"
              className="w-full rounded-2xl border border-sky-200/80 bg-white/90 pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none dark:border-purple-500/30 dark:bg-slate-900/90 dark:text-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              id="history-status-filter"
              className="w-full rounded-2xl border border-sky-200/80 bg-white/90 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-400 focus:outline-none dark:border-purple-500/30 dark:bg-slate-900/90 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Tasks</option>
              <option value="on_time">Completed On Time (Green)</option>
              <option value="late">Completed After Deadline (Amber)</option>
              <option value="incomplete">Still Not Completed (Red)</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              id="history-date-filter"
              className="w-full rounded-2xl border border-sky-200/80 bg-white/90 px-3 py-2.5 text-xs text-slate-800 focus:border-sky-400 focus:outline-none dark:border-purple-500/30 dark:bg-slate-900/90 dark:text-slate-200"
            />
          </div>

          {/* Sort Order Toggle */}
          <div className="sm:col-span-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              id="history-sort-btn"
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-sky-200/80 bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-sky-50 dark:border-purple-500/30 dark:bg-[#0c0e29] dark:text-slate-200 dark:hover:bg-purple-950/40 cursor-pointer no-overlap-btn"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-sky-500 dark:text-purple-400 shrink-0" />
              <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                title="Clear date filter"
                className="rounded-2xl border border-sky-200/80 bg-white/90 p-2.5 text-slate-500 hover:bg-sky-50 dark:border-purple-500/30 dark:bg-[#0c0e29] dark:text-slate-400 cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grouped Historical Task List */}
      <div className="space-y-5 sm:space-y-6">
        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <div key={group.dateStr} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center justify-between px-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-600 dark:text-purple-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatDisplayDate(group.dateStr)}
                  </h3>
                  <span className="rounded-full border border-sky-200/60 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:border-purple-500/30 dark:bg-[#0c0e29] dark:text-slate-300 shrink-0">
                    {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Target Date: {group.dateStr}
                </span>
              </div>

              {/* Tasks for this date with explicit Green, Amber, Red Color Schemes and Numbering */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {group.tasks.map((task, taskIndex) => {
                    const isCompletedOnTime = task.status === 'completed_on_time';
                    const isCompletedLate = task.status === 'completed_late';
                    const isStillNotCompleted = !isCompletedOnTime && !isCompletedLate;

                    // Color scheme definitions:
                    // Green: Completed on time
                    // Amber: Completed after deadline
                    // Red: Still not completed (pending or missed)
                    const statusConfig = isCompletedOnTime
                      ? {
                          border: 'border-emerald-300/90 dark:border-emerald-500/40',
                          bg: 'bg-emerald-50/40 dark:bg-[#0c1a18]/70',
                          indicatorBg: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
                          accentColor: 'text-emerald-600 dark:text-emerald-400',
                          titleColor: 'text-emerald-950 dark:text-emerald-100',
                        }
                      : isCompletedLate
                      ? {
                          border: 'border-amber-300/90 dark:border-amber-500/40',
                          bg: 'bg-amber-50/40 dark:bg-[#1a1609]/70',
                          indicatorBg: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
                          accentColor: 'text-amber-600 dark:text-amber-400',
                          titleColor: 'text-amber-950 dark:text-amber-100',
                        }
                      : {
                          border: 'border-rose-300/90 dark:border-rose-500/40',
                          bg: 'bg-rose-50/40 dark:bg-[#1a0a10]/70',
                          indicatorBg: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
                          accentColor: 'text-rose-600 dark:text-rose-400',
                          titleColor: 'text-rose-950 dark:text-rose-100',
                        };

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`rounded-2xl border ${statusConfig.border} ${statusConfig.bg} p-3.5 sm:p-4 shadow-xs backdrop-blur-md transition-all duration-300`}
                      >
                        {/* Top line: Task numbering, title + status color indicator */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Sequential Day Numbering Badge */}
                            <span
                              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white/90 text-xs font-black text-slate-700 shadow-2xs dark:border-purple-500/30 dark:bg-slate-900/90 dark:text-slate-200"
                              title={`Task #${taskIndex + 1} for this day`}
                            >
                              {taskIndex + 1}
                            </span>

                            {/* Checkbox toggle button */}
                            <button
                              type="button"
                              onClick={() => onToggleComplete(task)}
                              title={
                                isStillNotCompleted
                                  ? 'Click to mark complete'
                                  : 'Click to undo completion'
                              }
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                                isCompletedOnTime
                                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                                  : isCompletedLate
                                  ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                                  : 'border-slate-300 bg-white hover:border-sky-400 dark:border-slate-600 dark:bg-slate-800'
                              }`}
                            >
                              {isCompletedOnTime ? (
                                <Check className="h-4 w-4 stroke-[3]" />
                              ) : isCompletedLate ? (
                                <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                              ) : null}
                            </button>

                            <div className="min-w-0 flex-1">
                              <h4
                                className={`text-sm sm:text-base font-bold tracking-tight ${statusConfig.titleColor}`}
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

                          {/* Color Scheme Status Indicator (Green / Amber / Red dot, no text label) */}
                          <div className="flex items-center gap-2 self-start shrink-0">
                            <span
                              className={`h-3 w-3 rounded-full shrink-0 ${statusConfig.indicatorBg}`}
                              title={
                                isCompletedOnTime
                                  ? 'Completed on time (Green)'
                                  : isCompletedLate
                                  ? 'Completed after deadline (Amber)'
                                  : 'Not yet completed (Red)'
                              }
                            />

                            {/* Delete task button */}
                            <button
                              type="button"
                              onClick={() => setTaskPendingDelete(task)}
                              title="Delete task record"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Timestamp Row: Only Entered and Completed (Blank if not completed) */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 border-t border-slate-200/60 pt-2.5 dark:border-purple-500/20 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {/* Entered Time */}
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-sky-500 dark:text-purple-400 shrink-0" />
                            <span>
                              Entered :{' '}
                              <strong className="text-slate-900 dark:text-white font-bold">
                                {formatDateTime(task.createdAt)}
                              </strong>
                            </span>
                          </div>

                          {/* Completed Time (Left blank if not yet completed) */}
                          <div className="flex items-center gap-1.5">
                            {task.completedAt && (
                              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${statusConfig.accentColor}`} />
                            )}
                            <span>
                              Completed :{' '}
                              {task.completedAt ? (
                                <strong className={`font-bold ${statusConfig.accentColor}`}>
                                  {formatDateTime(task.completedAt)}
                                </strong>
                              ) : (
                                ''
                              )}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200/80 bg-white/60 py-16 text-center backdrop-blur-md dark:border-purple-500/20 dark:bg-[#090b22]/50 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-purple-950/40 dark:text-purple-400">
              <Clock className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching task history found
            </h4>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 px-4">
              Try adjusting your search query, status filters, or clearing the date filter.
            </p>
          </div>
        )}

        {/* Load More Days pagination */}
        {groupedByDate.length > visibleDaysCount && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setVisibleDaysCount((prev) => Math.min(prev + 40, groupedByDate.length))}
              className="rounded-2xl border border-sky-300 bg-white/90 px-6 py-2.5 text-xs font-bold text-sky-800 hover:bg-sky-50 dark:border-purple-500/40 dark:bg-[#0c0e29] dark:text-purple-300 dark:hover:bg-purple-950/50 shadow-xs cursor-pointer transition-all"
            >
              Load More Days ({visibleDaysCount} of {groupedByDate.length} shown)
            </button>
            <button
              type="button"
              onClick={() => setVisibleDaysCount(groupedByDate.length)}
              className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-purple-500/20 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer transition-all"
            >
              Show All {groupedByDate.length} Days
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal for HistoryView */}
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
                    Delete Task from History?
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to delete this historical task record?
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
                    onDeleteTask(id);
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


