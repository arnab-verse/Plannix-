/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskPriority, TaskTimelinePlan } from '../types';

export interface TaskToOrganize {
  id: string;
  title: string;
  notes?: string;
  priority: TaskPriority;
  durationMinutes: number;
}

export async function requestAIOrganizedTimeline(
  tasks: TaskToOrganize[],
  targetDate?: string
): Promise<TaskTimelinePlan> {
  const now = new Date();
  const currentLocalTime = now.toISOString();
  // Midnight deadline for today
  const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const deadlineTime = deadline.toISOString();

  try {
    const res = await fetch('/api/organize-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks,
        currentLocalTime,
        deadlineTime,
        targetDate,
      }),
    });

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const data: TaskTimelinePlan = await res.json();
    return data;
  } catch (err) {
    console.warn('API call failed, generating local fallback timeline:', err);
    return generateClientSideTimeline(tasks, now, deadline);
  }
}

function generateClientSideTimeline(
  tasks: TaskToOrganize[],
  startDate: Date,
  deadlineDate: Date
): TaskTimelinePlan {
  const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const sorted = [...tasks].sort(
    (a, b) => (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2)
  );

  const formatClock = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });

  let curTime = new Date(startDate.getTime());
  const remMin = curTime.getMinutes() % 5;
  if (remMin !== 0) {
    curTime = new Date(curTime.getTime() + (5 - remMin) * 60 * 1000);
  }

  const timeline = [];
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const duration = t.durationMinutes || 30;
    const taskStart = new Date(curTime.getTime());
    const taskEnd = new Date(taskStart.getTime() + duration * 60 * 1000);

    timeline.push({
      taskId: t.id,
      title: t.title,
      priority: t.priority,
      durationMinutes: duration,
      startTime: formatClock(taskStart),
      endTime: formatClock(taskEnd),
      reasoning:
        t.priority === 'high'
          ? 'High priority: tackle with fresh peak energy'
          : t.priority === 'medium'
          ? 'Medium priority: steady workflow progression'
          : 'Low priority: flexible completion',
      isBreak: false,
    });

    curTime = new Date(taskEnd.getTime());

    // Add small rest break after longer tasks
    if (i < sorted.length - 1 && duration >= 45) {
      const breakDuration = 10;
      const breakStart = new Date(curTime.getTime());
      const breakEnd = new Date(breakStart.getTime() + breakDuration * 60 * 1000);
      timeline.push({
        taskId: `break-${i + 1}`,
        title: 'Cognitive Reset & Hydration Break',
        priority: 'low' as TaskPriority,
        durationMinutes: breakDuration,
        startTime: formatClock(breakStart),
        endTime: formatClock(breakEnd),
        reasoning: 'Buffer interval to recharge focus and sustain productivity',
        isBreak: true,
      });
      curTime = new Date(breakEnd.getTime());
    } else if (i < sorted.length - 1) {
      curTime = new Date(curTime.getTime() + 5 * 60 * 1000);
    }
  }

  const finishTime = formatClock(curTime);
  const remainingMillis = deadlineDate.getTime() - curTime.getTime();
  const timeBufferMinutes = Math.round(remainingMillis / (60 * 1000));
  const isFeasible = timeBufferMinutes >= 0;

  const totalTaskMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes || 30), 0);
  const hours = Math.floor(totalTaskMinutes / 60);
  const mins = totalTaskMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const summary = isFeasible
    ? `Organized ${tasks.length} tasks (${timeFormatted}). Projected finish at ${finishTime}, leaving ${Math.floor(timeBufferMinutes / 60)}h ${timeBufferMinutes % 60}m buffer before midnight deadline.`
    : `Organized ${tasks.length} tasks (${timeFormatted}). Projected finish at ${finishTime} exceeds the 11:59:59 PM deadline by ${Math.abs(timeBufferMinutes)}m. Critical tasks have been prioritized first.`;

  return {
    summary,
    timeline,
    finishTime,
    isFeasibleBeforeDeadline: isFeasible,
    timeBufferMinutes,
    recommendations: [
      'Focus strictly on the scheduled sequence to avoid task-switching friction.',
      'Take 5-minute deep breaths during designated breaks to prevent late-day fatigue.',
      ...(isFeasible
        ? ['You are on track to wrap up comfortably before midnight!']
        : ['Consider delegating or rescheduling low-priority items for tomorrow.']),
    ],
  };
}

export async function generateSmartSchedule(
  tasks: import('../types').DailyTask[],
  startTime: string,
  userPrompt: string
): Promise<import('../types').DailyTask[]> {
  const tasksToOrganize: TaskToOrganize[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    priority: t.priority || 'medium',
    durationMinutes: t.estimatedMinutes || 30,
  }));

  const plan = await requestAIOrganizedTimeline(tasksToOrganize);
  const scheduleMap = new Map(plan.timeline.map((item) => [item.taskId, item]));

  return tasks.map((t) => {
    const matched = scheduleMap.get(t.id);
    if (matched) {
      return {
        ...t,
        priority: matched.priority,
        estimatedMinutes: matched.durationMinutes,
        scheduledTime: `${matched.startTime} - ${matched.endTime}`,
      };
    }
    return t;
  });
}

