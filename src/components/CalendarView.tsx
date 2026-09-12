/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
} from 'lucide-react';
import { DailyTask } from '../types';
import { TaskItem } from './TaskItem';
import {
  formatLocalDate,
  parseLocalDate,
  formatDisplayDate,
  getTodayLocalStr,
  isDateToday,
  isDateInPast,
} from '../utils/dateUtils';

interface CalendarViewProps {
  tasks: DailyTask[];
  onToggleComplete: (task: DailyTask) => void;
  onEditTask: (id: string, newTitle: string, newNotes?: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTaskForDate: (dateStr: string, title: string, notes?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTaskForDate,
}) => {
  const todayStr = getTodayLocalStr();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Current visible calendar month & year
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [jumpDateInput, setJumpDateInput] = useState<string>(todayStr);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Map tasks by date for fast indicator lookup
  const tasksByDateMap = useMemo(() => {
    const map = new Map<string, DailyTask[]>();
    for (const task of tasks) {
      const list = map.get(task.assignedDate) || [];
      list.push(task);
      map.set(task.assignedDate, list);
    }
    return map;
  }, [tasks]);

  // Generate calendar grid for currentMonthDate
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      tasks: DailyTask[];
    }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = formatLocalDate(prevDate);
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        tasks: tasksByDateMap.get(dateStr) || [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, month, day);
      const dateStr = formatLocalDate(curDate);
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        tasks: tasksByDateMap.get(dateStr) || [],
      });
    }

    // Next month padding to fill complete weeks
    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateStr = formatLocalDate(nextDate);
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        tasks: tasksByDateMap.get(dateStr) || [],
      });
    }

    return days;
  }, [currentMonthDate, tasksByDateMap]);

  // Tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    return (tasksByDateMap.get(selectedDateStr) || []).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [tasksByDateMap, selectedDateStr]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  const handleJumpDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumpDateInput) return;
    const parsed = parseLocalDate(jumpDateInput);
    setCurrentMonthDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    setSelectedDateStr(jumpDateInput);
  };

  const handleAddTaskForDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTaskForDate(selectedDateStr, newTaskTitle.trim(), newTaskNotes.trim() || undefined);
    setNewTaskTitle('');
    setNewTaskNotes('');
    setShowAddForm(false);
  };

  const monthYearLabel = currentMonthDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      {/* Calendar Header Card */}
      <div className="rounded-3xl border border-sky-100/90 bg-white/75 p-4 sm:p-6 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md transition-all duration-500 dark:border-purple-500/20 dark:bg-[#090c23]/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-purple-400">
              <CalendarIcon className="h-4 w-4" />
              <span>Historical Archive & Navigation</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 transition-colors duration-500 dark:text-white">
              Permanent Task Calendar
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Click any day to view its complete historical record or schedule ahead.
            </p>
          </div>

          {/* Quick Jump & Today controls with responsive wrapping */}
          <div className="calendar-jump-controls flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleJumpToToday}
              id="calendar-today-jump-btn"
              className="rounded-xl border border-sky-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-sky-900 shadow-xs hover:bg-sky-50 dark:border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-900/50 backdrop-blur-md cursor-pointer no-overlap-btn"
            >
              Jump to Today
            </button>
            <form onSubmit={handleJumpDateSubmit} className="flex items-center gap-1.5">
              <input
                type="date"
                value={jumpDateInput}
                onChange={(e) => setJumpDateInput(e.target.value)}
                className="rounded-xl border border-sky-200/80 bg-white/70 px-2.5 py-1.5 text-xs text-slate-800 focus:border-sky-400 focus:outline-none dark:border-purple-500/30 dark:bg-slate-900/70 dark:text-slate-200 backdrop-blur-xs"
              />
              <button
                type="submit"
                id="direct-jump-submit-btn"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:from-sky-600 hover:to-blue-700 dark:from-indigo-600 dark:to-purple-600 dark:shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-pointer no-overlap-btn"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Legend for Calendar Indicators */}
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 border-t border-sky-100/70 pt-3 text-xs text-slate-600 dark:border-purple-500/20 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">Day Indicators:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] shrink-0" />
            <span>All On Time</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] shrink-0" />
            <span>1+ Missed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0" />
            <span>1+ Completed Late</span>
          </span>
        </div>
      </div>

      {/* Main Calendar Grid & Date Details Layout */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
        {/* Left / Calendar Matrix */}
        <div className="rounded-3xl border border-sky-100/90 bg-white/75 p-3.5 sm:p-5 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md lg:col-span-7 dark:border-purple-500/20 dark:bg-[#090c23]/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Month Navigation */}
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {monthYearLabel}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                id="calendar-prev-month-btn"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-200/80 hover:bg-sky-50 dark:border-purple-500/30 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                id="calendar-next-month-btn"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-200/80 hover:bg-sky-50 dark:border-purple-500/30 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-slate-500 dark:text-purple-300 mb-1.5 sm:mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((dayItem) => {
              const isSelected = dayItem.dateStr === selectedDateStr;
              const isToday = dayItem.dateStr === todayStr;
              const dayTasks = dayItem.tasks;
              const hasTasks = dayTasks.length > 0;
              const onTimeCount = dayTasks.filter((t) => t.status === 'completed_on_time').length;
              const missedCount = dayTasks.filter((t) => t.status === 'missed').length;
              const lateCount = dayTasks.filter((t) => t.status === 'completed_late').length;
              const isAllOnTime = hasTasks && onTimeCount === dayTasks.length;
              const hasMissed = missedCount > 0;
              const hasLate = lateCount > 0;

              return (
                <button
                  key={dayItem.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dayItem.dateStr)}
                  id={`calendar-day-${dayItem.dateStr}`}
                  className={`group relative flex min-h-[48px] sm:min-h-[58px] md:min-h-[64px] flex-col items-center justify-between rounded-xl sm:rounded-2xl p-1 sm:p-1.5 text-xs transition-all duration-200 cursor-pointer backdrop-blur-xs ${
                    isSelected
                      ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs dark:from-purple-600/50 dark:to-indigo-600/50 dark:text-purple-100 dark:border dark:border-purple-400/50 dark:shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                      : isToday
                      ? 'bg-sky-50/90 text-sky-950 font-bold border border-sky-300/80 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-500/40'
                      : dayItem.isCurrentMonth
                      ? 'bg-white/60 hover:bg-white text-slate-800 dark:bg-[#0e1131]/60 dark:hover:bg-[#151945]/70 dark:text-slate-200'
                      : 'bg-transparent text-slate-400 hover:bg-slate-100/50 dark:text-slate-600 dark:hover:bg-purple-950/20'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-semibold">
                      {dayItem.dayNumber}
                    </span>
                    {hasTasks && (
                      <span
                        className={`text-[8px] sm:text-[9px] px-1 rounded-sm font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/70 text-slate-700 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator Dots */}
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-auto pb-0.5">
                    {hasTasks && isAllOnTime && (
                      <span
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                        title="All tasks completed on time"
                      />
                    )}
                    {hasTasks && !isAllOnTime && (
                      <>
                        {onTimeCount > 0 && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]"
                            title={`${onTimeCount} on time`}
                          />
                        )}
                        {hasMissed && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]"
                            title={`${missedCount} missed`}
                          />
                        )}
                        {hasLate && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)]"
                            title={`${lateCount} late`}
                          />
                        )}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right / Selected Date Task History Panel */}
        <div className="flex flex-col rounded-3xl border border-sky-100/90 bg-white/75 p-4 sm:p-5 shadow-[0_4px_24px_rgba(186,215,233,0.3)] backdrop-blur-md lg:col-span-5 dark:border-purple-500/20 dark:bg-[#090c23]/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <span>Selected Date Record</span>
                {isDateToday(selectedDateStr) && (
                  <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    TODAY
                  </span>
                )}
                {isDateInPast(selectedDateStr) && (
                  <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    Past
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {formatDisplayDate(selectedDateStr)}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              id="add-task-to-selected-date-btn"
              className="flex items-center gap-1 rounded-xl bg-neutral-100/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700 cursor-pointer no-overlap-btn backdrop-blur-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Quick Add Form for this specific date */}
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTaskForDate}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-700 dark:bg-neutral-800/70 backdrop-blur-xs"
            >
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-2">
                Add task for {formatDisplayDate(selectedDateStr)}:
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full rounded-lg border border-neutral-300 bg-white/90 px-3 py-1.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
                autoFocus
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="rounded-lg bg-neutral-900 px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </motion.form>
          )}

          {/* Tasks for the selected day */}
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
            <AnimatePresence mode="popLayout">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => (
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
                <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400 dark:text-neutral-500">
                  <Clock className="h-8 w-8 stroke-1" />
                  <p className="mt-2 text-xs font-medium">No tasks recorded for this date.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                  >
                    + Add a task to this date
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
