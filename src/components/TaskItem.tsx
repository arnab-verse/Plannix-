/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Clock,
  Trash2,
  Edit3,
  X,
  CheckSquare,
  Calendar,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { DailyTask } from '../types';
import { formatTime, formatDateTime, formatShortDate, isDateToday } from '../utils/dateUtils';
import { playChimeSound, triggerOnTimeCelebration, triggerLateCelebration } from '../utils/feedback';

interface TaskItemProps {
  task: DailyTask;
  onToggleComplete: (task: DailyTask) => void;
  onEditTask: (id: string, newTitle: string, newNotes?: string) => void;
  onDeleteTask: (id: string) => void;
  showAssignedDate?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  showAssignedDate = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteModal) {
        setShowDeleteModal(false);
      }
    };
    if (showDeleteModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteModal]);

  const isCompleted = task.status === 'completed_on_time' || task.status === 'completed_late';
  const isMissed = task.status === 'missed';
  const isPending = task.status === 'pending';

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onEditTask(task.id, editTitle.trim(), editNotes.trim());
    setIsEditing(false);
  };

  const handleCheckboxClick = () => {
    // If completing the task
    if (!isCompleted) {
      if (isMissed) {
        // Missed -> Completed Late (Amber)
        playChimeSound('late');
        triggerLateCelebration();
      } else {
        // Pending -> Completed On Time (Green)
        playChimeSound('on_time');
        triggerOnTimeCelebration();
      }
    } else {
      playChimeSound('delete');
    }
    onToggleComplete(task);
  };

  const getStatusConfig = () => {
    switch (task.status) {
      case 'completed_on_time':
        return {
          pillBg:
            'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-700/80 font-semibold',
          dotBg: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          borderClass:
            'border-2 border-emerald-500/80 bg-emerald-50/75 dark:bg-emerald-950/25 dark:border-emerald-500/80 glow-green backdrop-blur-md',
          checkboxClass:
            'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] hover:scale-105',
          label: 'Completed On Time',
          titleClass: 'text-emerald-700 dark:text-emerald-300 font-bold',
          notesClass: 'text-emerald-800 dark:text-emerald-300/90 font-medium',
          metaClass: 'text-emerald-700 dark:text-emerald-400',
          actionBtnClass:
            'text-emerald-700 hover:bg-emerald-200/60 hover:text-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100',
        };
      case 'missed':
        return {
          pillBg:
            'bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300/80 dark:border-rose-800/80 font-semibold',
          dotBg: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
          borderClass:
            'border-2 border-rose-400/80 dark:border-rose-500/70 bg-rose-50/65 dark:bg-rose-950/20 glow-red backdrop-blur-md',
          checkboxClass:
            'border-2 border-rose-400/90 dark:border-rose-500/80 bg-rose-100/60 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 hover:bg-rose-200/60 hover:scale-105',
          label: 'Missed Deadline',
          titleClass: 'text-rose-700 dark:text-rose-300 font-bold',
          notesClass: 'text-rose-800 dark:text-rose-300/90',
          metaClass: 'text-rose-700 dark:text-rose-400',
          actionBtnClass:
            'text-slate-500 hover:bg-rose-200/60 hover:text-rose-800 dark:text-slate-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-200',
        };
      case 'completed_late':
        return {
          pillBg:
            'bg-amber-100/90 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300/80 dark:border-amber-700/80 font-semibold',
          dotBg: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
          borderClass:
            'border-2 border-amber-500/80 bg-amber-50/70 dark:bg-amber-950/25 dark:border-amber-500/80 glow-amber backdrop-blur-md',
          checkboxClass:
            'bg-amber-500 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)] hover:scale-105',
          label: 'Completed Late',
          titleClass: 'text-amber-700 dark:text-amber-300 font-bold',
          notesClass: 'text-amber-900 dark:text-amber-300/90 font-medium',
          metaClass: 'text-amber-700 dark:text-amber-400',
          actionBtnClass:
            'text-amber-700 hover:bg-amber-200/60 hover:text-amber-950 dark:text-amber-300 dark:hover:bg-amber-900/60 dark:hover:text-amber-100',
        };
      case 'pending':
      default:
        return {
          pillBg:
            'bg-sky-50/90 text-sky-800 dark:bg-purple-950/50 dark:text-purple-300 border-sky-200/80 dark:border-purple-800/60 font-medium',
          dotBg: 'bg-sky-400 dark:bg-purple-400',
          borderClass:
            'border border-sky-100/90 bg-white/75 dark:border-purple-500/25 dark:bg-[#0c0e25]/70 hover:border-sky-300 dark:hover:border-purple-400/50 shadow-[0_4px_20px_rgba(186,215,233,0.2)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_20px_rgba(147,51,234,0.18)] backdrop-blur-md',
          checkboxClass:
            'border-2 border-slate-300 bg-white/70 hover:border-sky-500 dark:border-purple-500/40 dark:bg-slate-900/60 dark:hover:border-purple-300 hover:scale-105 text-transparent',
          label: 'In Progress',
          titleClass: 'text-slate-900 dark:text-slate-100 font-semibold',
          notesClass: 'text-slate-600 dark:text-slate-300/80',
          metaClass: 'text-slate-500 dark:text-slate-400',
          actionBtnClass:
            'text-slate-500 hover:bg-sky-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-purple-900/40 dark:hover:text-purple-200',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      id={`task-card-${task.id}`}
      className={`group relative rounded-2xl p-3.5 sm:p-4.5 transition-all duration-300 ${statusConfig.borderClass}`}
    >
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-xl border border-sky-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-sky-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900/90 dark:text-slate-100 dark:focus:border-purple-400 shadow-xs"
            placeholder="Task title..."
            autoFocus
          />
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-sky-200 bg-white px-3.5 py-2 text-xs text-slate-700 focus:border-sky-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900/90 dark:text-slate-300 dark:focus:border-purple-400 shadow-xs"
            placeholder="Add optional notes or description..."
          />
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              id={`edit-delete-task-btn-${task.id}`}
              className="flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer transition-colors no-overlap-btn min-h-[36px]"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Delete Task</span>
            </button>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer no-overlap-btn min-h-[36px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 dark:bg-purple-600 dark:hover:bg-purple-700 shadow-xs cursor-pointer no-overlap-btn min-h-[36px]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-2.5 sm:gap-4">
          {/* Circular Checkbox with Spring Physics */}
          <button
            type="button"
            onClick={handleCheckboxClick}
            id={`task-checkbox-${task.id}`}
            aria-label={`Toggle task completion for ${task.title}`}
            className={`mt-0.5 flex h-6 w-6 sm:h-6.5 sm:w-6.5 shrink-0 items-center justify-center rounded-full transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-sky-400 dark:focus:ring-purple-400 cursor-pointer ${statusConfig.checkboxClass}`}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 22 }}
              >
                <Check className="h-3.5 w-3.5 stroke-[3.5]" />
              </motion.div>
            )}
            {!isCompleted && isMissed && (
              <span className="text-[11px] font-black leading-none" title="Click to complete late">
                !
              </span>
            )}
          </button>

          {/* Task Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className={`text-sm sm:text-base leading-snug break-words transition-colors duration-150 ${statusConfig.titleClass}`}
              >
                {task.title}
              </span>
              {/* Priority Badge */}
              {task.priority && (
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-tight shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : task.priority === 'medium'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                  }`}
                >
                  {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                </span>
              )}
              {/* Scheduled Timeline Badge */}
              {task.scheduledTime && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{task.scheduledTime}</span>
                  {task.estimatedMinutes && <span>({task.estimatedMinutes}m)</span>}
                </span>
              )}
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tracking-tight shrink-0 ${statusConfig.pillBg}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotBg}`} />
                {statusConfig.label}
              </span>
              {/* Assigned Date Badge */}
              {showAssignedDate && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-100/70 dark:bg-purple-950/50 px-2 py-0.5 text-xs text-sky-800 dark:text-purple-300 font-medium shrink-0">
                  <Calendar className="h-3 w-3" />
                  {formatShortDate(task.assignedDate)}
                  {isDateToday(task.assignedDate) && ' (Today)'}
                </span>
              )}
            </div>

            {task.notes && (
              <p className={`mt-1.5 text-xs break-words leading-relaxed transition-colors duration-150 ${statusConfig.notesClass}`}>
                {task.notes}
              </p>
            )}

            {/* Timestamps & Info Row */}
            <div className={`mt-2.5 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs ${statusConfig.metaClass}`}>
              <div className="flex items-center gap-1 opacity-80 shrink-0">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Created {formatTime(task.createdAt)}</span>
              </div>
              {task.completedAt && (
                <div className="flex items-center gap-1 font-semibold shrink-0">
                  <CheckSquare
                    className={`h-3 w-3 shrink-0 ${
                      task.status === 'completed_late'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  />
                  {task.status === 'completed_late' ? (
                    <span className="text-amber-700 dark:text-amber-300">
                      Completed Late: {formatDateTime(task.completedAt)}
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Completed: {formatTime(task.completedAt)}
                    </span>
                  )}
                </div>
              )}
              {isMissed && !isCompleted && (
                <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold shrink-0">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>Missed deadline · Click checkbox to mark completed late</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons (Edit & Delete) - Styled with clear spacing and zero overlap on mobile */}
          <div className="task-item-actions flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              id={`edit-task-btn-${task.id}`}
              className="flex items-center justify-center gap-1 rounded-xl border border-slate-200/80 bg-white/90 p-1.5 sm:px-2 sm:py-1 text-xs font-medium text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-purple-500/30 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-purple-400/50 dark:hover:bg-purple-950/40 dark:hover:text-purple-200 transition-all cursor-pointer shadow-2xs no-overlap-btn min-h-[32px]"
              title="Edit Task"
              aria-label={`Edit task ${task.title}`}
            >
              <Edit3 className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              id={`delete-task-btn-${task.id}`}
              className="flex items-center justify-center gap-1 rounded-xl border border-rose-200/80 bg-white/90 p-1.5 sm:px-2 sm:py-1 text-xs font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:bg-slate-900/80 dark:text-rose-400 dark:hover:border-rose-500/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-all cursor-pointer shadow-2xs no-overlap-btn min-h-[32px]"
              title="Delete Task"
              aria-label={`Delete task ${task.title}`}
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
            onClick={() => setShowDeleteModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-warning-title-${task.id}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-rose-800/60 dark:bg-[#0c0e29]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-xs">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    id={`delete-warning-title-${task.id}`}
                    className="text-base font-bold text-slate-900 dark:text-white"
                  >
                    Delete Task?
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                  <div className="mt-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-3 sm:p-3.5 dark:border-purple-500/25 dark:bg-[#12153a]/80">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                      "{task.title}"
                    </p>
                    {task.notes && (
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {task.notes}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Assigned: {formatShortDate(task.assignedDate)}</span>
                      {task.status !== 'pending' && (
                        <span className="ml-auto font-medium text-rose-600 dark:text-rose-400">
                          {statusConfig.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  id={`cancel-delete-modal-btn-${task.id}`}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-purple-500/30 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors no-overlap-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChimeSound('delete');
                    setShowDeleteModal(false);
                    onDeleteTask(task.id);
                  }}
                  id={`confirm-delete-modal-btn-${task.id}`}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 cursor-pointer transition-colors no-overlap-btn"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Yes, Delete Task</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
