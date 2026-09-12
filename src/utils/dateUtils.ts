/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskStatus } from '../types';

/**
 * Formats a Date object to YYYY-MM-DD string according to the user's local timezone.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date string in YYYY-MM-DD format (user local timezone).
 */
export function getTodayLocalStr(): string {
  return formatLocalDate(new Date());
}

/**
 * Safely parses a YYYY-MM-DD string into a local Date object at 00:00:00.000.
 */
export function parseLocalDate(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Gets the epoch millisecond timestamp representing 23:59:59.999 PM of the assigned date
 * in the user's local timezone.
 */
export function getEndOfAssignedDate(dateStr: string): number {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
  return endOfDay.getTime();
}

/**
 * Evaluates the status of a task based on its assigned date, completion timestamp,
 * and current reference time (defaulting to Date.now()).
 * Rules:
 * - Deadline is 11:59:59.999 PM on assignedDate.
 * - At 12:00:00 AM of following date, any incomplete task becomes 'missed' (RED).
 * - Completed before or at deadline -> 'completed_on_time' (GREEN).
 * - Completed after deadline -> 'completed_late' (AMBER).
 * - Not yet completed and deadline has not passed -> 'pending'.
 */
export function evaluateTaskStatus(
  assignedDate: string,
  completedAt: string | null,
  nowTimestamp: number = Date.now()
): TaskStatus {
  const deadline = getEndOfAssignedDate(assignedDate);

  if (completedAt) {
    const completedTime = new Date(completedAt).getTime();
    if (completedTime <= deadline) {
      return 'completed_on_time';
    } else {
      return 'completed_late';
    }
  }

  // Not completed
  if (nowTimestamp <= deadline) {
    return 'pending';
  } else {
    return 'missed';
  }
}

/**
 * Formats a YYYY-MM-DD string into a full readable date, e.g.:
 * "Thursday, September 10, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a YYYY-MM-DD string into a short date, e.g. "Sep 10, 2026"
 */
export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats an ISO string to a human-readable 12-hour time format, e.g. "10:30 AM"
 */
export function formatTime(isoStr: string | null): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats an ISO string to a date + time format, e.g. "Sep 11 at 9:20 AM"
 */
export function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const datePart = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
}

/**
 * Calculates milliseconds remaining until the upcoming midnight (12:00:00 AM)
 * in user's local timezone.
 */
export function getMillisUntilNextMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    100 // 100ms past midnight to avoid clock edge jitter
  );
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
}

export const getMsUntilMidnight = getMillisUntilNextMidnight;


/**
 * Formats remaining duration until midnight, e.g. "3h 19m left today"
 */
export function formatTimeUntilMidnight(): string {
  const millis = getMillisUntilNextMidnight();
  const totalMinutes = Math.floor(millis / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m left until midnight`;
  }
  return `${minutes}m left until midnight`;
}

/**
 * Gets tomorrow's date string in YYYY-MM-DD format based on local time.
 */
export function getTomorrowLocalStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
}

/**
 * Checks whether the given date string is today.
 */
export function isDateToday(dateStr: string): boolean {
  return dateStr === getTodayLocalStr();
}

/**
 * Checks whether the given date string is in the past (before today).
 */
export function isDateInPast(dateStr: string): boolean {
  return dateStr < getTodayLocalStr();
}

/**
 * Checks whether the given date string is in the future (after today).
 */
export function isDateInFuture(dateStr: string): boolean {
  return dateStr > getTodayLocalStr();
}

/**
 * Formats a duration in milliseconds into a friendly readable string:
 * e.g. "2 days 4 hrs", "1 hr 35 mins", or "42 mins".
 */
export function formatDurationBreakdown(ms: number): string {
  const totalMinutes = Math.max(1, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  return parts.join(' ');
}

/**
 * Calculates how late a task was submitted compared to the 11:59:59 PM deadline of assignedDate.
 */
export function formatLateDuration(assignedDate: string, completedAt: string): string {
  const deadline = getEndOfAssignedDate(assignedDate);
  const completedTime = new Date(completedAt).getTime();
  if (completedTime <= deadline) {
    return 'Submitted on time';
  }
  const diff = completedTime - deadline;
  return `Submitted ${formatDurationBreakdown(diff)} late`;
}

/**
 * Calculates how much time has passed since a task missed its deadline,
 * or how much time is left if it is still within its target date.
 */
export function formatMissedDuration(assignedDate: string, nowTimestamp: number = Date.now()): string {
  const deadline = getEndOfAssignedDate(assignedDate);
  if (nowTimestamp > deadline) {
    const diff = nowTimestamp - deadline;
    return `Missed ${formatDurationBreakdown(diff)} ago`;
  }
  const diff = Math.max(0, deadline - nowTimestamp);
  return `Incomplete · Due in ${formatDurationBreakdown(diff)}`;
}

/**
 * Gets user's local timezone name (e.g., "America/Los_Angeles").
 */
export function getLocalTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Local Timezone';
  }
}
