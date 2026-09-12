/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

interface IncomingTask {
  id: string;
  title: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  durationMinutes: number;
}

interface OrganizeRequest {
  tasks: IncomingTask[];
  currentLocalTime?: string;
  deadlineTime?: string;
  targetDate?: string;
}

// Deterministic fallback schedule generator in case Gemini is unavailable or not yet configured
function generateDeterministicSchedule(
  tasks: IncomingTask[],
  startDate: Date,
  deadlineDate: Date
) {
  // Sort tasks: high first, then medium, then low
  const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const sorted = [...tasks].sort(
    (a, b) => (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2)
  );

  const timeline: Array<{
    taskId: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    durationMinutes: number;
    startTime: string;
    endTime: string;
    reasoning?: string;
    isBreak?: boolean;
  }> = [];

  let curTime = new Date(startDate.getTime());
  // Round to nearest 5 minutes
  const remainderMinutes = curTime.getMinutes() % 5;
  if (remainderMinutes !== 0) {
    curTime = new Date(curTime.getTime() + (5 - remainderMinutes) * 60 * 1000);
  }

  const formatClock = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });

  for (let i = 0; i < sorted.length; i++) {
    const task = sorted[i];
    const duration = task.durationMinutes || 30;
    const taskStart = new Date(curTime.getTime());
    const taskEnd = new Date(taskStart.getTime() + duration * 60 * 1000);

    timeline.push({
      taskId: task.id,
      title: task.title,
      priority: task.priority,
      durationMinutes: duration,
      startTime: formatClock(taskStart),
      endTime: formatClock(taskEnd),
      reasoning:
        task.priority === 'high'
          ? 'High priority: tackle first during peak mental focus window'
          : task.priority === 'medium'
          ? 'Medium priority: steady momentum following core priorities'
          : 'Low priority: flexible wrap-up task',
      isBreak: false,
    });

    curTime = new Date(taskEnd.getTime());

    // Insert 5-10 min break if not last task and duration was >= 45m
    if (i < sorted.length - 1 && duration >= 45) {
      const breakDuration = 10;
      const breakStart = new Date(curTime.getTime());
      const breakEnd = new Date(breakStart.getTime() + breakDuration * 60 * 1000);
      timeline.push({
        taskId: `break-${i + 1}`,
        title: 'Cognitive Reset & Hydration Break',
        priority: 'low',
        durationMinutes: breakDuration,
        startTime: formatClock(breakStart),
        endTime: formatClock(breakEnd),
        reasoning: 'Brief interval to prevent fatigue and sustain velocity',
        isBreak: true,
      });
      curTime = new Date(breakEnd.getTime());
    } else if (i < sorted.length - 1) {
      // Small 5 min transition
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
    ? `Organized ${tasks.length} tasks totaling ${timeFormatted}. All tasks can be completed by ${finishTime}, leaving a safe ${Math.floor(timeBufferMinutes / 60)}h ${timeBufferMinutes % 60}m buffer before midnight.`
    : `Organized ${tasks.length} tasks (${timeFormatted}). Warning: Estimated finish time of ${finishTime} exceeds the 11:59:59 PM deadline by ${Math.abs(timeBufferMinutes)} minutes. High-priority tasks are scheduled first.`;

  const recommendations = [
    'Tackle high-impact tasks in the designated priority order without multitasking.',
    'Keep to the estimated durations to ensure you wrap up well before the midnight rollover.',
  ];

  if (!isFeasible) {
    recommendations.push(
      'Consider time-boxing the lowest priority tasks or scheduling them for tomorrow.'
    );
  }

  return {
    summary,
    timeline,
    finishTime,
    isFeasibleBeforeDeadline: isFeasible,
    timeBufferMinutes,
    recommendations,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Task Timeline Organization Endpoint
  app.post('/api/organize-tasks', async (req, res) => {
    try {
      const { tasks, currentLocalTime, deadlineTime } = req.body as OrganizeRequest;
      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: 'No tasks provided for scheduling.' });
      }

      const now = currentLocalTime ? new Date(currentLocalTime) : new Date();
      // Default deadline is end of current day (11:59:59 PM)
      const deadline = deadlineTime
        ? new Date(deadlineTime)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const ai = getAIClient();
      if (!ai) {
        // Fallback to deterministic scheduling if Gemini API key is not configured
        const schedule = generateDeterministicSchedule(tasks, now, deadline);
        return res.json(schedule);
      }

      const prompt = `You are an expert executive productivity coach and AI task scheduler. The user wants to organize their tasks for today and needs an optimal chronological timeline to finish every task before their midnight deadline (11:59:59 PM).
Context:
- Current Local Time: ${now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })} (${now.toISOString()})
- Target Daily Deadline: 11:59:59 PM
- Total Tasks to Schedule: ${tasks.length}

Tasks list:
${tasks
  .map(
    (t, idx) =>
      `${idx + 1}. [ID: ${t.id}] "${t.title}" | Priority: ${t.priority.toUpperCase()} | Estimated Duration: ${t.durationMinutes} minutes${
        t.notes ? ` | Notes: ${t.notes}` : ''
      }`
  )
  .join('\n')}

Rules:
1. Schedule tasks in sequence starting at approximately ${now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}. Round to friendly clock intervals (e.g. 5 or 10 min marks).
2. Schedule HIGH priority tasks during the earliest available slot. Then MEDIUM, then LOW.
3. Insert 5-10 minute rest/hydration breaks between tasks where appropriate (especially after tasks >= 45 minutes) to ensure sustained cognitive velocity. Mark these with isBreak: true.
4. Calculate precise startTime and endTime formatted like '05:00 PM', '05:45 PM'.
5. Check if all tasks complete before 11:59:59 PM.
   - If feasible: set isFeasibleBeforeDeadline to true and calculate timeBufferMinutes before midnight.
   - If not feasible (over deadline): set isFeasibleBeforeDeadline to false, flag the bottleneck, ensure the top priority tasks finish before midnight, and suggest time-boxing or deferring lower-priority items.
6. Return ONLY valid JSON matching this schema:
{
  "summary": "Concise 1-2 sentence executive summary of the schedule and strategy",
  "finishTime": "e.g. 08:30 PM",
  "isFeasibleBeforeDeadline": true,
  "timeBufferMinutes": 209,
  "recommendations": ["Strategy bullet 1", "Strategy bullet 2"],
  "timeline": [
    {
      "taskId": "task-id or break-id",
      "title": "Task title or Break name",
      "priority": "high",
      "durationMinutes": 45,
      "startTime": "05:00 PM",
      "endTime": "05:45 PM",
      "reasoning": "Brief rationale for this placement",
      "isBreak": false
    }
  ]
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local scheduler:', geminiErr);
        const fallbackSchedule = generateDeterministicSchedule(tasks, now, deadline);
        return res.json(fallbackSchedule);
      }
    } catch (err) {
      console.error('Error in /api/organize-tasks:', err);
      res.status(500).json({ error: 'Internal server error while organizing tasks.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
