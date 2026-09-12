/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarClock,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Play,
  ArrowRight,
} from 'lucide-react';
import { DailyTask } from '../types';
import { generateSmartSchedule } from '../services/aiOrganizerService';

interface OrganizeTasksModalProps {
  tasks: DailyTask[];
  onApplySchedule: (scheduledTasks: DailyTask[]) => void;
  onClose: () => void;
}

export const OrganizeTasksModal: React.FC<OrganizeTasksModalProps> = ({
  tasks,
  onApplySchedule,
  onClose,
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [userPrompt, setUserPrompt] = useState(
    'Prioritize high-impact deep work in the morning, save admin and follow-ups for the afternoon.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSchedule, setPreviewSchedule] = useState<DailyTask[] | null>(null);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  const handleGenerate = async () => {
    if (pendingTasks.length === 0) {
      setError('You need at least one pending task to generate an optimized timeline.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const organized = await generateSmartSchedule(pendingTasks, startTime, userPrompt);
      // Map back onto full tasks list
      const scheduledMap = new Map(organized.map((t) => [t.id, t]));
      const merged = tasks.map((t) => scheduledMap.get(t.id) || t);
      setPreviewSchedule(merged);
    } catch {
      setError('Schedule organization encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!previewSchedule) return;
    onApplySchedule(previewSchedule);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="organize-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-3xl border border-purple-200/80 bg-white/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md dark:border-purple-500/30 dark:bg-[#0c0e29]/90 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-purple-100 pb-3 dark:border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h3 id="organize-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Smart Task Timeline Organizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically allocate optimal time slots and realistic durations before the midnight deadline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-purple-950/40 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-purple-300">
                Workday Start Time
              </label>
              <div className="relative mt-1">
                <Clock className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-sky-200/80 bg-white pl-8 pr-2 py-1.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-purple-300">
                Schedule Strategy / Preferences
              </label>
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. Schedule intense tasks before noon..."
                className="mt-1 w-full rounded-xl border border-sky-200/80 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none dark:border-purple-500/40 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pending Tasks Count notice */}
          <div className="flex items-center justify-between rounded-xl bg-purple-50/70 p-3 dark:bg-purple-950/30 text-xs border border-purple-100 dark:border-purple-500/20">
            <span className="font-semibold text-purple-900 dark:text-purple-200">
              {pendingTasks.length} pending tasks eligible for timeline allocation
            </span>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || pendingTasks.length === 0}
              id="generate-timeline-btn"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:scale-102 transition-transform disabled:opacity-50 cursor-pointer no-overlap-btn"
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <span>{isLoading ? 'Optimizing...' : 'Generate Timeline'}</span>
            </button>
          </div>

          {/* Timeline preview */}
          {previewSchedule ? (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-purple-300">
                Optimized Day Timeline Preview
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 p-2 dark:border-purple-500/30">
                {previewSchedule
                  .filter((t) => t.status === 'pending')
                  .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-purple-500/20 dark:bg-purple-950/20 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs shrink-0">
                          {task.scheduledTime || 'TBD'}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.estimatedMinutes && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {task.estimatedMinutes}m duration
                          </span>
                        )}
                        {task.priority && (
                          <span className="rounded-sm bg-purple-200/80 px-1 py-0.2 text-[9px] font-bold uppercase dark:bg-purple-900 dark:text-purple-200">
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              Click <strong>Generate Timeline</strong> to build an optimized schedule based on your preferences.
            </div>
          )}
        </div>

        {/* Modal Actions Footer with Responsive Flex */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-purple-100 pt-3 dark:border-purple-500/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer no-overlap-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!previewSchedule}
            id="apply-timeline-btn"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:scale-102 transition-transform cursor-pointer no-overlap-btn"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Apply Optimized Schedule</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
