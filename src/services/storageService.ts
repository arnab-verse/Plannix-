/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DailyTask } from '../types';
import { evaluateTaskStatus, getTodayLocalStr, formatLocalDate } from '../utils/dateUtils';
import { getDeterministicUserId } from './authService';

const DB_NAME = 'daily_task_manager_user_db_v2';
const DB_VERSION = 1;
const STORE_NAME = 'user_tasks';
export const ARNAB_EMAIL = 'arnab.bhtt06@gmail.com';

/**
 * Utility to recursively sanitize objects for Firestore:
 * Firestore throws a runtime exception if any field has an `undefined` value.
 * This converts/strips undefined values cleanly so sync never crashes.
 */
export function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) =>
          item !== null && typeof item === 'object' ? cleanForFirestore(item) : item
        );
      } else {
        cleaned[key] = cleanForFirestore(value);
      }
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Clean legacy unpartitioned storage keys and purge any leaked historical tasks from other users' caches
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('dtm_tasks_backup_v1');
    localStorage.removeItem('arnab_historical_tasks_seeded_v1');
    localStorage.removeItem('arnab_historical_tasks_seeded_v2');
    localStorage.removeItem('arnab_historical_tasks_v4_742_13');

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dtm_tasks_user_') && key !== 'dtm_tasks_user_u_arnab_bhtt06_gmail_com') {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.some((t: DailyTask) => t?.id?.startsWith('arnab_hist_'))) {
              const cleaned = parsed.filter((t: DailyTask) => !t?.id?.startsWith('arnab_hist_'));
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch {}
      }
    }
  }
} catch {}

class StorageService {
  private idb: IDBDatabase | null = null;
  private idbPromise: Promise<IDBDatabase | null> | null = null;
  private memoryCache: Map<string, DailyTask> = new Map();
  private sortedTasksCache: DailyTask[] | null = null;
  private isInitialized = false;
  private persistTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentUserId: string | null = null;
  private currentUserEmail: string | null = null;
  private unsubscribeFirestore: (() => void) | null = null;
  private onSyncListeners: Set<(tasks: DailyTask[]) => void> = new Set();

  constructor() {
    this.initIDB();
  }

  public onTasksSync(listener: (tasks: DailyTask[]) => void): () => void {
    this.onSyncListeners.add(listener);
    return () => {
      this.onSyncListeners.delete(listener);
    };
  }

  private notifySyncListeners(tasks: DailyTask[]): void {
    this.onSyncListeners.forEach((listener) => {
      try {
        listener(tasks);
      } catch (err) {
        console.warn('Error in sync listener callback:', err);
      }
    });
  }

  private getUserStorageKey(userId: string): string {
    return `dtm_tasks_user_${userId}`;
  }

  private async initIDB(): Promise<void> {
    if (this.isInitialized) return;
    try {
      this.idb = await this.openDatabase();
    } catch (err) {
      console.warn('IndexedDB failed to open, using localStorage fallback', err);
      this.idb = null;
    }
    this.isInitialized = true;
  }

  private openDatabase(): Promise<IDBDatabase | null> {
    if (this.idbPromise) return this.idbPromise;
    this.idbPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const dbInstance = (event.target as IDBOpenDBRequest).result;
        if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
          const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('assignedDate', 'assignedDate', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (e) => {
        console.warn('IndexedDB open error:', e);
        resolve(null);
      };
    });
    return this.idbPromise;
  }

  /**
   * Switch the active user.
   * Loads or seeds tasks strictly for the logged-in user, merging local and cloud records
   * using a deterministic, email-anchored user ID so all devices share the exact same state.
   */
  public async switchUser(
    userId: string | null,
    email?: string | null,
    onSync?: (tasks: DailyTask[]) => void
  ): Promise<DailyTask[]> {
    if (!this.isInitialized) {
      await this.initIDB();
    }

    if (this.unsubscribeFirestore) {
      try {
        this.unsubscribeFirestore();
      } catch {}
      this.unsubscribeFirestore = null;
    }

    if (!userId && !email) {
      this.currentUserId = null;
      this.currentUserEmail = null;
      this.memoryCache.clear();
      this.sortedTasksCache = [];
      return [];
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const canonicalUserId = cleanEmail
      ? getDeterministicUserId(cleanEmail)
      : userId
      ? (userId.startsWith('u_') ? userId : 'u_' + userId.replace(/[^a-zA-Z0-9]/g, '_'))
      : 'anonymous_user';

    this.currentUserId = canonicalUserId;
    this.currentUserEmail = cleanEmail;
    this.memoryCache.clear();
    this.sortedTasksCache = null;

    if (onSync) {
      this.onSyncListeners.add(onSync);
    }

    const isArnab = this.currentUserEmail === ARNAB_EMAIL || canonicalUserId === 'u_arnab_bhtt06_gmail_com';

    // 1. Fetch remote tasks directly from Firestore (primary source of truth)
    let remoteTasks: DailyTask[] = [];
    const leakedCloudTaskIds: string[] = [];
    try {
      const snapshot = await getDocs(collection(db, 'users', canonicalUserId, 'tasks'));
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DailyTask;
          if (data && data.id) {
            if (!isArnab && data.id.startsWith('arnab_hist_')) {
              // Leaked historical task on a non-Arnab account; mark for deletion from this user's cloud database
              leakedCloudTaskIds.push(data.id);
            } else {
              remoteTasks.push(data);
            }
          }
        });
      }
    } catch (e) {
      console.warn('Firestore tasks query notice:', e);
    }

    // Clean up any historical tasks that were erroneously synced to non-Arnab cloud account
    if (leakedCloudTaskIds.length > 0) {
      this.deleteTasksFromFirestore(canonicalUserId, leakedCloudTaskIds).catch((err) => {
        console.warn('Could not clean leaked tasks from cloud:', err);
      });
    }

    // 2. Read local cache ONLY for this specific canonical user ID (never read foreign users' keys)
    let localTasks = await this.readUserTasksFromStorage(canonicalUserId);
    if (!isArnab) {
      localTasks = localTasks.filter((t) => !t.id.startsWith('arnab_hist_'));
    }

    // 3. Merge remote and local tasks for this user account
    const mergedMap = new Map<string, DailyTask>();
    const tasksToSyncCloud: DailyTask[] = [];

    // Prioritize remote tasks first
    for (const rt of remoteTasks) {
      if (!isArnab && rt.id.startsWith('arnab_hist_')) continue;
      mergedMap.set(rt.id, { ...rt, userId: canonicalUserId });
    }

    // Merge in any pending local tasks for this user (e.g. created offline)
    for (const lt of localTasks) {
      if (!isArnab && lt.id.startsWith('arnab_hist_')) continue;
      if (lt.userId && lt.userId !== canonicalUserId) continue; // Skip any task not belonging to this user
      const existing = mergedMap.get(lt.id);
      if (!existing) {
        const normalized = { ...lt, userId: canonicalUserId };
        mergedMap.set(lt.id, normalized);
        tasksToSyncCloud.push(normalized);
      } else {
        const localTime = new Date(lt.lastModified || lt.createdAt || 0).getTime();
        const remoteTime = new Date(existing.lastModified || existing.createdAt || 0).getTime();
        if (localTime > remoteTime) {
          const normalized = { ...lt, userId: canonicalUserId };
          mergedMap.set(lt.id, normalized);
          tasksToSyncCloud.push(normalized);
        }
      }
    }

    // 4. If completely empty AND strictly for Arnab (arnab.bhtt06@gmail.com), seed historical archive
    if (mergedMap.size === 0 && isArnab) {
      const { getArnabHistoricalTasks } = await import('../data/arnabHistoricalTasks');
      const historicalList = getArnabHistoricalTasks();
      for (const t of historicalList) {
        const seeded = { ...t, userId: canonicalUserId };
        mergedMap.set(seeded.id, seeded);
        tasksToSyncCloud.push(seeded);
      }
    }

    // 5. Populate memory cache
    for (const [id, t] of mergedMap) {
      this.memoryCache.set(id, t);
    }
    this.sortedTasksCache = null;

    // 6. Write merged tasks to local storage & IndexedDB as local cache
    const allMerged = Array.from(this.memoryCache.values());
    this.writeToLocalStorage(canonicalUserId, allMerged);

    // 7. Upload missing/new tasks to Firestore
    if (tasksToSyncCloud.length > 0) {
      await this.pushTasksToFirestore(canonicalUserId, tasksToSyncCloud);
    }

    // 8. Attach real-time onSnapshot listener for instant cross-device updates
    try {
      this.unsubscribeFirestore = onSnapshot(
        collection(db, 'users', canonicalUserId, 'tasks'),
        (snapshot) => {
          let hasChanges = false;
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as DailyTask;
            if (!data || !data.id) return;
            if (!isArnab && data.id.startsWith('arnab_hist_')) return;

            if (change.type === 'added' || change.type === 'modified') {
              const current = this.memoryCache.get(data.id);
              const remoteTime = new Date(data.lastModified || data.createdAt || 0).getTime();
              const currentTime = new Date(current?.lastModified || current?.createdAt || 0).getTime();
              if (!current || remoteTime >= currentTime) {
                this.memoryCache.set(data.id, { ...data, userId: canonicalUserId });
                hasChanges = true;
              }
            } else if (change.type === 'removed') {
              if (this.memoryCache.has(change.doc.id)) {
                this.memoryCache.delete(change.doc.id);
                hasChanges = true;
              }
            }
          });

          if (hasChanges) {
            this.sortedTasksCache = null;
            const updated = Array.from(this.memoryCache.values());
            this.writeToLocalStorage(canonicalUserId, updated);
            this.notifySyncListeners(this.getSortedTasks());
          }
        },
        (error) => {
          console.warn('Firestore real-time listener notice:', error);
        }
      );
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot listener:', e);
    }

    // Evaluate midnight rollover for the user's tasks
    await this.evaluateMidnightTransitions();

    return this.getAllTasks();
  }

  public async pushTasksToFirestore(userId: string, tasks: DailyTask[]): Promise<void> {
    if (tasks.length === 0) return;
    try {
      const CHUNK_SIZE = 300;
      for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
        const chunk = tasks.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const t of chunk) {
          const taskRef = doc(db, 'users', userId, 'tasks', t.id);
          const cleanData = cleanForFirestore({ ...t, userId });
          batch.set(taskRef, cleanData, { merge: true });
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Error pushing tasks to Firestore:', err);
    }
  }

  public async deleteTasksFromFirestore(userId: string, taskIds: string[]): Promise<void> {
    if (taskIds.length === 0) return;
    try {
      const CHUNK_SIZE = 300;
      for (let i = 0; i < taskIds.length; i += CHUNK_SIZE) {
        const chunk = taskIds.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const id of chunk) {
          batch.delete(doc(db, 'users', userId, 'tasks', id));
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Error batch deleting tasks from Firestore:', err);
    }
  }

  private async readUserTasksFromStorage(userId: string): Promise<DailyTask[]> {
    const fromLocalStorage = this.readFromLocalStorage(userId);
    if (fromLocalStorage.length > 0) {
      return fromLocalStorage;
    }

    if (this.idb) {
      try {
        const tx = this.idb.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('userId');
        const request = index.getAll(userId);

        return await new Promise((resolve) => {
          request.onsuccess = () => {
            resolve((request.result || []) as DailyTask[]);
          };
          request.onerror = () => {
            resolve([]);
          };
        });
      } catch {
        return [];
      }
    }

    return [];
  }

  private readFromLocalStorage(userId: string): DailyTask[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const key = this.getUserStorageKey(userId);
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as DailyTask[];
      }
    } catch (e) {
      console.error('LocalStorage read error', e);
    }
    return [];
  }

  private writeToLocalStorage(userId: string, tasks: DailyTask[]): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const key = this.getUserStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  private scheduleBackgroundFlush(): void {
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
    }
    this.persistTimeout = setTimeout(() => {
      this.flushPendingPersistence();
    }, 60);
  }

  private async flushPendingPersistence(): Promise<void> {
    if (!this.currentUserId) return;
    const userId = this.currentUserId;
    const allArray = Array.from(this.memoryCache.values());
    this.writeToLocalStorage(userId, allArray);

    if (this.idb) {
      try {
        const tx = this.idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const t of allArray) {
          store.put({ ...t, userId });
        }
      } catch (err) {
        console.warn('Error in IndexedDB flush', err);
      }
    }
  }

  private async evaluateMidnightTransitions(): Promise<void> {
    const now = Date.now();
    let anyStatusUpdated = false;

    for (const [id, task] of this.memoryCache) {
      const currentCalculatedStatus = evaluateTaskStatus(task.assignedDate, task.completedAt, now);
      if (task.status !== currentCalculatedStatus) {
        const updatedTask: DailyTask = {
          ...task,
          status: currentCalculatedStatus,
          originalStatus: task.completedAt
            ? task.originalStatus
            : currentCalculatedStatus === 'missed'
            ? 'missed'
            : task.originalStatus,
          isCompletedOnTime: currentCalculatedStatus === 'completed_on_time',
          isCompletedLate: currentCalculatedStatus === 'completed_late',
          lastModified: new Date().toISOString(),
        };
        this.memoryCache.set(id, updatedTask);
        anyStatusUpdated = true;
      }
    }

    if (anyStatusUpdated) {
      this.sortedTasksCache = null;
      this.scheduleBackgroundFlush();
    }
  }

  /**
   * Get all sorted tasks synchronously from memory cache.
   */
  public getSortedTasks(): DailyTask[] {
    if (this.sortedTasksCache) {
      return this.sortedTasksCache;
    }
    this.sortedTasksCache = Array.from(this.memoryCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return this.sortedTasksCache;
  }

  /**
   * Get all tasks for the current active user.
   */
  public async getAllTasks(): Promise<DailyTask[]> {
    if (!this.currentUserId) {
      return [];
    }
    return this.getSortedTasks();
  }

  /**
   * Get tasks for a specific date (YYYY-MM-DD).
   */
  public async getTasksByDate(dateStr: string): Promise<DailyTask[]> {
    const all = await this.getAllTasks();
    return all.filter((task) => task.assignedDate === dateStr);
  }

  /**
   * Save or update a single task for the current active user.
   */
  public async saveTask(task: DailyTask): Promise<DailyTask> {
    if (!this.currentUserId) {
      return task;
    }

    const userId = this.currentUserId;
    const now = Date.now();
    const finalStatus = evaluateTaskStatus(task.assignedDate, task.completedAt, now);
    const existing = this.memoryCache.get(task.id);

    const historyLog = [...(task.historyLog || existing?.historyLog || [])];
    if (historyLog.length === 0) {
      historyLog.push({
        timestamp: task.createdAt || new Date().toISOString(),
        action: 'Task Created',
        details: `Assigned for ${task.assignedDate}`,
      });
    }

    if (existing && existing.status !== finalStatus) {
      let actionLabel = 'Status Updated';
      let detailsLabel = `Changed from ${existing.status} to ${finalStatus}`;
      if (finalStatus === 'completed_on_time') {
        actionLabel = 'Completed On Time';
        detailsLabel = 'Finished and checked off before midnight deadline';
      } else if (finalStatus === 'completed_late') {
        actionLabel = 'Completed Late';
        detailsLabel = 'Finished and checked off after midnight deadline';
      } else if (finalStatus === 'pending') {
        actionLabel = 'Reopened';
        detailsLabel = 'Marked incomplete / in progress';
      } else if (finalStatus === 'missed') {
        actionLabel = 'Deadline Missed';
        detailsLabel = 'Midnight rollover marked task as missed';
      }
      historyLog.push({
        timestamp: new Date().toISOString(),
        action: actionLabel,
        details: detailsLabel,
      });
    } else if (existing && (existing.title !== task.title || existing.notes !== task.notes)) {
      historyLog.push({
        timestamp: new Date().toISOString(),
        action: 'Task Details Edited',
        details: `Updated title to "${task.title}"`,
      });
    }

    const sanitizedTask: DailyTask = {
      ...task,
      userId,
      status: finalStatus,
      isCompletedOnTime: finalStatus === 'completed_on_time',
      isCompletedLate: finalStatus === 'completed_late',
      lastModified: new Date().toISOString(),
      historyLog,
    };

    this.memoryCache.set(sanitizedTask.id, sanitizedTask);
    this.sortedTasksCache = null;
    this.scheduleBackgroundFlush();

    // Persist and sync to Firestore
    try {
      const cleanData = cleanForFirestore(sanitizedTask);
      await setDoc(doc(db, 'users', userId, 'tasks', sanitizedTask.id), cleanData, { merge: true });
    } catch (err) {
      console.warn('Firestore task sync error:', err);
    }

    return sanitizedTask;
  }

  /**
   * Delete a task for the current active user.
   */
  public async deleteTask(id: string): Promise<boolean> {
    if (!this.currentUserId) return false;
    const userId = this.currentUserId;
    const exists = this.memoryCache.has(id);
    if (!exists) return false;

    this.memoryCache.delete(id);
    this.sortedTasksCache = null;
    this.scheduleBackgroundFlush();

    // Delete from IndexedDB
    if (this.idb) {
      try {
        const tx = this.idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
      } catch (err) {
        console.warn('IndexedDB delete error:', err);
      }
    }

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'users', userId, 'tasks', id));
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }

    return true;
  }

  /**
   * Clear all tasks for current active user.
   */
  public async clearAllTasks(): Promise<void> {
    if (!this.currentUserId) return;
    const userId = this.currentUserId;
    const oldKeys = Array.from(this.memoryCache.keys());
    this.memoryCache.clear();
    this.sortedTasksCache = [];
    this.writeToLocalStorage(userId, []);

    if (this.idb) {
      try {
        const tx = this.idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const k of oldKeys) {
          store.delete(k);
        }
      } catch (err) {
        console.warn('IndexedDB clear error', err);
      }
    }

    // Clear from Firestore
    try {
      const CHUNK_SIZE = 300;
      for (let i = 0; i < oldKeys.length; i += CHUNK_SIZE) {
        const chunk = oldKeys.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const k of chunk) {
          batch.delete(doc(db, 'users', userId, 'tasks', k));
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore clear error:', err);
    }
  }

  /**
   * Re-evaluate rollover transitions.
   */
  public async evaluateMidnightRollover(): Promise<{ updatedCount: number; affectedDate: string }> {
    if (!this.currentUserId) {
      return { updatedCount: 0, affectedDate: getTodayLocalStr() };
    }
    const prevCount = this.memoryCache.size;
    await this.evaluateMidnightTransitions();
    return {
      updatedCount: prevCount,
      affectedDate: getTodayLocalStr(),
    };
  }

  /**
   * Export user's tasks to JSON.
   */
  public async exportData(): Promise<string> {
    const tasks = await this.getAllTasks();
    const payload = {
      version: 2,
      exportDate: new Date().toISOString(),
      user: this.currentUserEmail || this.currentUserId,
      totalCount: tasks.length,
      tasks,
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Import tasks for the current user.
   */
  public async importData(jsonString: string): Promise<number> {
    if (!this.currentUserId) return 0;
    try {
      const data = JSON.parse(jsonString);
      const tasksToImport: DailyTask[] = Array.isArray(data) ? data : data.tasks || [];
      if (!Array.isArray(tasksToImport)) {
        throw new Error('Invalid JSON format: tasks array not found');
      }

      for (const t of tasksToImport) {
        await this.saveTask({
          ...t,
          userId: this.currentUserId,
        });
      }

      return tasksToImport.length;
    } catch (e) {
      console.error('Failed to import tasks:', e);
      throw e;
    }
  }

  /**
   * Manually re-sync Arnab's historical tasks archive (only for Arnab).
   */
  public async seedArnabHistoricalData(): Promise<DailyTask[]> {
    if (!this.currentUserId || this.currentUserEmail !== ARNAB_EMAIL) {
      return [];
    }
    const userId = this.currentUserId;
    const { getArnabHistoricalTasks } = await import('../data/arnabHistoricalTasks');
    const tasks = getArnabHistoricalTasks();

    const seededList: DailyTask[] = tasks.map((t) => ({
      ...t,
      userId,
    }));

    for (const t of seededList) {
      this.memoryCache.set(t.id, t);
    }
    this.sortedTasksCache = null;
    this.writeToLocalStorage(userId, seededList);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`arnab_755_seeded_uid_${userId}`, 'true');
    }

    await this.pushTasksToFirestore(userId, seededList);

    return seededList;
  }
}

export const storageService = new StorageService();

export const switchStorageUser = (userId: string | null, email?: string | null, onSync?: (tasks: DailyTask[]) => void) =>
  storageService.switchUser(userId, email, onSync);
export const onStorageTasksSync = (cb: (tasks: DailyTask[]) => void) => storageService.onTasksSync(cb);
export const loadAllTasks = () => storageService.getAllTasks();
export const saveTask = (task: DailyTask) => storageService.saveTask(task);
export const deleteTaskFromDb = (id: string) => storageService.deleteTask(id);
export const runMidnightRolloverCheck = () => storageService.evaluateMidnightRollover();
export const clearAllTasksFromDb = () => storageService.clearAllTasks();
export const exportTasksJson = () => storageService.exportData();
export const importTasksJson = (json: string) => storageService.importData(json);
export const seedArnabHistoricalTasks = () => storageService.seedArnabHistoricalData();

export function getSavedTheme(): import('../types').AppTheme {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('dtm_theme');
      if (saved === 'galaxy' || saved === 'cherry_blossom' || saved === 'volcano' || saved === 'ocean') {
        return saved;
      }
      if (saved === 'lily' || saved === 'snowfall') {
        return 'cherry_blossom';
      }
    }
  } catch {}
  return 'volcano';
}

export function saveTheme(theme: import('../types').AppTheme): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dtm_theme', theme);
    }
  } catch {}
}
