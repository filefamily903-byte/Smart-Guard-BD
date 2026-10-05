import { QueuedAction } from '../types/prototype';

const DB_NAME = 'SmartGuardPrototypeDB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_queue';
const FALLBACK_KEY = 'smartguard_offline_queue_fallback';

// In-memory cache as ultimate fallback
let memoryQueue: QueuedAction[] = [];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    } catch (e) {
      reject(e);
    }
  });
}

export async function saveQueueToStorage(queue: QueuedAction[]): Promise<boolean> {
  memoryQueue = [...queue];

  // Try saving to localStorage first as immediate cache
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(queue));
  } catch {
    // Ignore localStorage errors (e.g. quota or sandbox)
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Clear existing and re-populate
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        for (const item of queue) {
          store.put(item);
        }
      };

      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };

      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch (err) {
    // Fallback succeeded via localStorage or memory
    return true;
  }
}

export async function loadQueueFromStorage(): Promise<QueuedAction[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        db.close();
        const items = req.result as QueuedAction[];
        if (items && items.length > 0) {
          memoryQueue = items;
          resolve(items);
        } else {
          // Check localStorage fallback
          resolve(loadFromLocalStorage());
        }
      };

      req.onerror = () => {
        db.close();
        resolve(loadFromLocalStorage());
      };
    });
  } catch {
    return loadFromLocalStorage();
  }
}

function loadFromLocalStorage(): QueuedAction[] {
  try {
    const stored = localStorage.getItem(FALLBACK_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        memoryQueue = parsed;
        return parsed;
      }
    }
  } catch {
    // Return memoryQueue
  }
  return memoryQueue;
}

export async function clearQueueStorage(): Promise<void> {
  memoryQueue = [];
  try {
    localStorage.removeItem(FALLBACK_KEY);
  } catch {
    // Ignore
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  } catch {
    // Ignore
  }
}
