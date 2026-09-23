/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, Trash2, X } from 'lucide-react';
import { DailyTask, NavigationTab, AppTheme, UserProfile } from './types';
import {
  switchStorageUser,
  onStorageTasksSync,
  loadAllTasks,
  saveTask,
  deleteTaskFromDb,
  runMidnightRolloverCheck,
  getSavedTheme,
  saveTheme,
  exportTasksJson,
  importTasksJson,
  clearAllTasksFromDb,
  seedArnabHistoricalTasks,
} from './services/storageService';
import { getCurrentUser, signOutMock, authService } from './services/authService';
import { getTodayLocalStr, getMsUntilMidnight } from './utils/dateUtils';
import { playChimeSound } from './utils/feedback';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { Header } from './components/Header';
import { TodayDashboard } from './components/TodayDashboard';
import { CalendarView } from './components/CalendarView';
import { StatisticsView } from './components/StatisticsView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { OrganizeTasksModal } from './components/OrganizeTasksModal';
import { NavigationGrid } from './components/NavigationGrid';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('today');
  const [activeMetricFilter, setActiveMetricFilter] = useState<'all' | 'on_time' | 'late' | 'missed'>('all');
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [theme, setTheme] = useState<AppTheme>('volcano');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticatedThisVisit, setIsAuthenticatedThisVisit] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Undo state for deleted tasks (5 seconds duration)
  const [deletedTaskUndo, setDeletedTaskUndo] = useState<{
    task: DailyTask;
    id: string;
  } | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch user and load user-scoped tasks
  const handleUserChange = useCallback(async (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      setIsAuthenticatedThisVisit(true);
      const userTasks = await switchStorageUser(user.id, user.email, (syncedTasks) => {
        setTasks(syncedTasks);
      });
      setTasks(userTasks);
    } else {
      setIsAuthenticatedThisVisit(false);
      await switchStorageUser(null);
      setTasks([]);
    }
    setIsLoaded(true);
  }, []);

  // Listen to cross-device and cloud task synchronization events in real time
  useEffect(() => {
    const unsub = onStorageTasksSync((syncedTasks) => {
      setTasks(syncedTasks);
    });
    return () => {
      unsub();
    };
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      await runMidnightRolloverCheck();
      const all = await loadAllTasks();
      setTasks(all);
    } catch (e) {
      console.error('Failed to load tasks from DB:', e);
    }
  }, []);

  useEffect(() => {
    async function init() {
      // Clear legacy storage keys to guarantee clean auth gating on site load
      try {
        localStorage.removeItem('plannix_current_user_v1');
        localStorage.removeItem('dtm_auth_current_user_v3');
        localStorage.removeItem('dtm_registered_accounts_v3');
      } catch {}

      const saved = getSavedTheme();
      setTheme(saved);
    }
    init();

    // Subscribe to real-time Firebase Auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      handleUserChange(user);
    });

    return () => {
      unsubscribe();
    };
  }, [handleUserChange]);

  // Set up midnight rollover check
  useEffect(() => {
    const msUntilMidnight = getMsUntilMidnight();
    const timer = setTimeout(async () => {
      await runMidnightRolloverCheck();
      const updated = await loadAllTasks();
      setTasks(updated);
    }, msUntilMidnight + 1000); // 1 sec after midnight

    // Also run a heartbeat check every 60 seconds
    const interval = setInterval(async () => {
      const res = await runMidnightRolloverCheck();
      if (res.updatedCount > 0) {
        const updated = await loadAllTasks();
        setTasks(updated);
      }
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Dynamically update document.title and canonical URL based on the active view
  useEffect(() => {
    let title = 'Plannix - Daily Task & Productivity Manager';
    let path = '/';
    
    if (!currentUser && !isAuthenticatedThisVisit) {
      title = 'Sign In | Plannix (Your Task Manager)';
      path = '/login';
    } else {
      switch (currentTab) {
        case 'today':
          title = 'Daily Tasks & Deadlines | Plannix';
          path = '/';
          break;
        case 'calendar':
          title = 'Calendar & History Roadmap | Plannix';
          path = '/calendar';
          break;
        case 'projects':
          title = 'Projects Workspace | Plannix';
          path = '/projects';
          break;
        case 'analytics':
          title = 'Productivity Analytics & Velocity | Plannix';
          path = '/analytics';
          break;
        case 'settings':
          title = 'Settings & Configuration | Plannix';
          path = '/settings';
          break;
      }
    }
    
    document.title = title;
    
    // Update canonical link
    const canonicalLink = document.getElementById('canonical-url') as HTMLLinkElement | null;
    if (canonicalLink) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://plannix.app';
      canonicalLink.href = `${baseUrl}${path}`;
    }
  }, [currentTab, currentUser, isAuthenticatedThisVisit]);

  // Dynamic theme attribute sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'cherry_blossom') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'cherry_blossom') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Add a new task (either for today or a chosen date)
  const handleAddTask = useCallback(async (title: string, notes?: string, assignedDate?: string) => {
    const targetDate = assignedDate || getTodayLocalStr();
    const newTask: DailyTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title,
      notes: notes || undefined,
      assignedDate: targetDate,
      status: 'pending',
      originalStatus: 'pending',
      completedAt: null,
      isCompletedOnTime: false,
      isCompletedLate: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      historyLog: [
        {
          timestamp: new Date().toISOString(),
          action: 'Task Created',
          details: `Target deadline: 11:59:59 PM on ${targetDate}`,
        },
      ],
    };

    setTasks((prev) => [...prev, newTask]);
    await saveTask(newTask);
    playChimeSound('create');
  }, []);

  // Toggle complete (pending -> completed_on_time, or missed -> completed_late, or undo)
  const handleToggleComplete = useCallback(async (task: DailyTask) => {
    const nowIso = new Date().toISOString();
    let updated: DailyTask;

    if (task.status === 'completed_on_time' || task.status === 'completed_late') {
      // Undo to pending (or missed if it belongs to past date)
      const isPast = task.assignedDate < getTodayLocalStr();
      updated = {
        ...task,
        status: isPast ? 'missed' : 'pending',
        completedAt: undefined,
        lastModified: nowIso,
        historyLog: [
          ...(task.historyLog || []),
          {
            timestamp: nowIso,
            action: 'Completion Reverted',
            details: 'Task status returned to active',
          },
        ],
      };
    } else if (task.status === 'missed') {
      // Missed -> Completed Late
      updated = {
        ...task,
        status: 'completed_late',
        completedAt: nowIso,
        lastModified: nowIso,
        historyLog: [
          ...(task.historyLog || []),
          {
            timestamp: nowIso,
            action: 'Completed Late',
            details: 'Completed past deadline after midnight rollover',
          },
        ],
      };
    } else {
      // Pending -> Completed On Time
      updated = {
        ...task,
        status: 'completed_on_time',
        completedAt: nowIso,
        lastModified: nowIso,
        historyLog: [
          ...(task.historyLog || []),
          {
            timestamp: nowIso,
            action: 'Completed On Time',
            details: 'Completed before 11:59:59 PM deadline',
          },
        ],
      };
    }

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await saveTask(updated);
  }, []);

  // Edit task title and notes
  const handleEditTask = useCallback(async (id: string, newTitle: string, newNotes?: string) => {
    const nowIso = new Date().toISOString();
    let updatedTask: DailyTask | undefined;

    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;

      updatedTask = {
        ...task,
        title: newTitle,
        notes: newNotes,
        lastModified: nowIso,
        historyLog: [
          ...(task.historyLog || []),
          {
            timestamp: nowIso,
            action: 'Task Edited',
            details: `Updated title to "${newTitle}"`,
          },
        ],
      };
      return prev.map((t) => (t.id === id ? updatedTask! : t));
    });

    if (updatedTask) {
      await saveTask(updatedTask);
    }
  }, []);

  // Delete task with 5-second Undo capability
  const handleDeleteTask = useCallback(async (id: string) => {
    let taskToDelete: DailyTask | undefined;
    setTasks((prev) => {
      taskToDelete = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });
    await deleteTaskFromDb(id);

    if (taskToDelete) {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      setDeletedTaskUndo({
        task: taskToDelete,
        id: `${(taskToDelete as DailyTask).id}-${Date.now()}`,
      });

      undoTimerRef.current = setTimeout(() => {
        setDeletedTaskUndo(null);
        undoTimerRef.current = null;
      }, 5000);
    }
  }, []);

  // Restore deleted task from Undo
  const handleUndoDelete = async () => {
    if (!deletedTaskUndo) return;
    const taskToRestore = deletedTaskUndo.task;

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setDeletedTaskUndo(null);

    setTasks((prev) => {
      if (prev.some((t) => t.id === taskToRestore.id)) return prev;
      return [...prev, taskToRestore];
    });
    await saveTask(taskToRestore);
    playChimeSound('on_time');
  };

  // Manually dismiss the undo notification
  const handleDismissUndo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setDeletedTaskUndo(null);
  };

  // Apply organized timeline schedule
  const handleApplySchedule = async (scheduled: DailyTask[]) => {
    setTasks(scheduled);
    for (const t of scheduled) {
      await saveTask(t);
    }
    playChimeSound('on_time');
  };

  // Export JSON
  const handleExportData = async (): Promise<string> => {
    return await exportTasksJson();
  };

  // Import JSON
  const handleImportData = async (jsonStr: string): Promise<number> => {
    const count = await importTasksJson(jsonStr);
    await refreshTasks();
    return count;
  };

  // Clear all data
  const handleClearAllTasks = async () => {
    await clearAllTasksFromDb();
    setTasks([]);
  };

  // Manual rollover trigger
  const handleRunRolloverCheck = async () => {
    const res = await runMidnightRolloverCheck();
    const updated = await loadAllTasks();
    setTasks(updated);
    return res;
  };

  // Seed / Sync Historical Archive for Arnab
  const handleSeedHistoricalArchive = async (): Promise<number> => {
    const seeded = await seedArnabHistoricalTasks();
    await refreshTasks();
    return seeded.length;
  };

  // Filter tasks for today
  const todayStr = getTodayLocalStr();
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.assignedDate === todayStr);
  }, [tasks, todayStr]);

  const todayCount = useMemo(() => {
    const total = todayTasks.length;
    const completed = todayTasks.filter(
      (t) => t.status === 'completed_on_time' || t.status === 'completed_late'
    ).length;
    return { total, completed };
  }, [todayTasks]);

  const todayMetrics = useMemo(() => {
    const total = todayTasks.length;
    const completedOnTime = todayTasks.filter((t) => t.status === 'completed_on_time').length;
    const completedLate = todayTasks.filter((t) => t.status === 'completed_late').length;
    const missed = todayTasks.filter((t) => t.status === 'missed').length;
    return {
      total,
      completedOnTime,
      completedLate,
      missed,
    };
  }, [todayTasks]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          <span>Loading Plannix...</span>
        </div>
      </div>
    );
  }

  // After opening the site every time, require login/signup first before proceeding to dashboard
  if (!isAuthenticatedThisVisit || !currentUser) {
    return (
      <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white flex flex-col justify-center px-3.5 sm:px-6 py-8 sm:py-12">
        <AtmosphericBackground theme="volcano" />
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Plannix <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400">(Your Task Manager)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in or create an account to access your daily tasks
            </p>
          </div>
          <AuthView
            isMandatory={true}
            onSuccess={(user) => {
              setCurrentUser(user);
              setIsAuthenticatedThisVisit(true);
              setIsAuthOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white pb-16">
      {/* Dynamic Background Canvas Theme */}
      <AtmosphericBackground theme={theme} />

      {/* Persistent Navigation Header with Settings in top-right corner */}
      <Header
        activeTab={currentTab}
        currentView={currentTab}
        onSelectTab={setCurrentTab}
        onSelectView={(view) => {
          if (view === 'auth') {
            setIsAuthOpen(true);
          } else {
            setIsAuthOpen(false);
            setCurrentTab(view as NavigationTab);
          }
        }}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={async () => {
          await signOutMock();
          setCurrentUser(null);
          setIsAuthenticatedThisVisit(false);
        }}
        todayCount={todayCount}
        todayTaskCount={todayTasks.length}
        todayMetrics={todayMetrics}
        activeMetricFilter={activeMetricFilter}
        onSelectMetricFilter={setActiveMetricFilter}
        totalTasksCount={tasks.length}
        completedTasksCount={tasks.filter((t) => t.status === 'completed_on_time' || t.status === 'completed_late').length}
      />

      {/* Main Responsive Container */}
      <main className="relative z-10 mx-auto max-w-6xl px-3.5 sm:px-6 pt-5 sm:pt-6">
        {isAuthOpen ? (
          <div>
            <AuthView
              onSuccess={(user) => {
                setCurrentUser(user);
                setIsAuthOpen(false);
              }}
              onCancel={() => setIsAuthOpen(false)}
            />
          </div>
        ) : (
          <>
            {/* 2-Row Workspace Navigation shown across non-today views for effortless navigation */}
            {currentTab !== 'today' && currentTab !== 'settings' && (
              <div className="mx-auto max-w-4xl mb-5 sm:mb-6">
                <NavigationGrid
                  currentTab={currentTab}
                  onSelectTab={setCurrentTab}
                  todayCount={todayCount}
                />
              </div>
            )}

            {currentTab === 'today' && (
              <TodayDashboard
                tasks={todayTasks}
                allTasks={tasks}
                onAddTask={handleAddTask}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onOpenOrganizeTasks={() => setIsOrganizeModalOpen(true)}
                onNavigateToCalendar={() => setCurrentTab('calendar')}
                onSelectTab={setCurrentTab}
                currentTab={currentTab}
                activeMetricFilter={activeMetricFilter}
                onSelectMetricFilter={setActiveMetricFilter}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddTaskForDate={handleAddTask}
              />
            )}

            {currentTab === 'statistics' && (
              <StatisticsView
                tasks={tasks}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
              />
            )}

            {currentTab === 'history' && (
              <HistoryView
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                currentTheme={theme}
                onSelectTheme={handleSelectTheme}
                taskCount={tasks.length}
                onOpenOrganizeTasks={() => setIsOrganizeModalOpen(true)}
                onExportData={handleExportData}
                onImportData={handleImportData}
                onClearAllTasks={handleClearAllTasks}
                onRunRolloverCheck={handleRunRolloverCheck}
                onSeedHistoricalArchive={handleSeedHistoricalArchive}
                currentUser={currentUser}
                onNavigateToAuth={() => setIsAuthOpen(true)}
                onLogout={async () => {
                  await signOutMock();
      setCurrentUser(null);
                }}
              />
            )}

            {/* Dashboard Bottom: 𝑪𝒓𝒂𝒇𝒕𝒆𝒅 𝑩𝒚 𝑨𝒓𝒏𝒂𝒃𝑽𝒆𝒓𝒔𝒆 */}
            <footer className="mt-14 mb-4 flex justify-center text-center">
              <div className="fancy-arnab-badge shadow-md" title="Crafted by ArnabVerse">
                <span className="fancy-arnab-text text-xs sm:text-sm tracking-wide select-none">
                  𝑪𝒓𝒂𝒇𝒕𝒆𝒅 𝑩𝒚 𝑨𝒓𝒏𝒂𝒃𝑽𝒆𝒓𝒔𝒆
                </span>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* Organize Tasks Timeline Modal */}
      {isOrganizeModalOpen && (
        <OrganizeTasksModal
          tasks={todayTasks}
          onApplySchedule={handleApplySchedule}
          onClose={() => setIsOrganizeModalOpen(false)}
        />
      )}

      {/* 5-Second Floating Undo Banner */}
      <AnimatePresence>
        {deletedTaskUndo && (
          <motion.div
            key={deletedTaskUndo.id}
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto min-w-[320px] max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 p-3.5 sm:p-4 text-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-md dark:border-purple-500/40 dark:bg-[#0f1228]/95 select-none"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    Task deleted
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    "{deletedTaskUndo.task.title}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleUndoDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/25 hover:from-sky-400 hover:to-indigo-500 hover:scale-105 active:scale-95 cursor-pointer transition-all"
                  title="Undo deletion (5s)"
                >
                  <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Undo</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismissUndo}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition-colors"
                  title="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 5-Second Progress Countdown Line */}
            <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-800/80">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
                  }
