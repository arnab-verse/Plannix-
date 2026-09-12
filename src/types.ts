/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'pending' | 'completed_on_time' | 'missed' | 'completed_late';
export type NavigationTab = 'today' | 'calendar' | 'statistics' | 'history' | 'settings';

export interface TaskHistoryEvent {
  timestamp: string;
  action: string;
  details?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface DailyTask {
  id: string;
  userId?: string;
  title: string;
  assignedDate: string; // Format: YYYY-MM-DD in local timezone
  createdAt: string; // ISO string
  completedAt: string | null; // ISO string when completed, or null
  status: TaskStatus;
  originalStatus: 'pending' | 'missed'; // Status before completion
  isCompletedOnTime: boolean;
  isCompletedLate: boolean;
  lastModified: string; // ISO string
  notes?: string;
  historyLog?: TaskHistoryEvent[];
  priority?: TaskPriority;
  estimatedMinutes?: number; // Estimated duration in minutes
  scheduledTime?: string; // e.g. "05:00 PM - 05:45 PM"
}

export interface TaskScheduleItem {
  taskId: string;
  title: string;
  priority: TaskPriority;
  durationMinutes: number;
  startTime: string; // e.g., "5:00 PM"
  endTime: string;   // e.g., "5:45 PM"
  reasoning?: string;
  isBreak?: boolean;
}

export interface TaskTimelinePlan {
  summary: string;
  timeline: TaskScheduleItem[];
  finishTime: string;
  isFeasibleBeforeDeadline: boolean;
  timeBufferMinutes: number;
  recommendations: string[];
}

export type AppView = 'today' | 'calendar' | 'statistics' | 'history' | 'settings' | 'auth';

export type AppTheme = 'galaxy' | 'cherry_blossom' | 'volcano' | 'ocean';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  authProvider: 'google' | 'gmail' | 'email' | 'phone';
  createdAt: string;
}

export interface RegisteredAccount {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  authProvider: 'google' | 'gmail' | 'email' | 'phone';
  createdAt: string;
  avatarUrl?: string;
}

export type StatusFilter = 'all' | 'completed_on_time' | 'missed' | 'completed_late' | 'pending';

export interface DayActivitySummary {
  date: string;
  total: number;
  completedOnTime: number;
  missed: number;
  completedLate: number;
  pending: number;
  hasMixed: boolean;
}

export interface StatsOverview {
  totalTasks: number;
  completedOnTime: number;
  missed: number;
  completedLate: number;
  pending: number;
  onTimeRate: number; // percentage
  lateRate: number; // percentage
  missedRate: number; // percentage
  overallCompletionRate: number; // percentage
}
