import {
  ChildRecord,
  ColdBox,
  QueuedAction,
  SmsAlert,
  AdminRole,
  PendantRecord,
  FlatDoseRecord,
  IvrCallLog,
  AuditLogRecord,
  UserRecord,
} from '../types/prototype';
import { INITIAL_CHILDREN, INITIAL_COLD_BOXES } from '../data/prototypeSeed';

const DB_NAME = 'smartguard_demo';
const DB_VERSION = 1;

export const STORES = [
  'children',
  'pendants',
  'doses',
  'syncQueue',
  'alerts',
  'ivrCalls',
  'coldBoxes',
  'auditLog',
  'users',
] as const;

export type StoreName = (typeof STORES)[number];

// Event bus for cross-component and tab reactivity
type DatabaseSubscriber = (store: StoreName, action: string, data?: any) => void;
const subscribers = new Set<DatabaseSubscriber>();

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('smartguard_db_sync');
    broadcastChannel.onmessage = (event) => {
      const { store, action, data } = event.data || {};
      if (store && action) {
        subscribers.forEach((cb) => {
          try {
            cb(store, action, data);
          } catch (e) {
            console.error('Subscriber error:', e);
          }
        });
      }
    };
  } catch (e) {
    // Channel unsupported or blocked
  }
}

export function subscribeToDatabase(cb: DatabaseSubscriber): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function notifySubscribers(store: StoreName, action: string, data?: any) {
  subscribers.forEach((cb) => {
    try {
      cb(store, action, data);
    } catch (e) {
      console.error('Subscriber error:', e);
    }
  });

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ store, action, data });
    } catch (e) {
      // ignore
    }
  }
}

// Initial Demo Users
export const INITIAL_USERS: UserRecord[] = [
  {
    id: 'user-super',
    name: 'Dr. Nasreen Akhtar',
    email: 'nasreen.akhtar@dghs.gov.bd.demo',
    role: 'Super Admin',
    demoPin: '1234',
  },
  {
    id: 'user-district',
    name: 'Dr. A. Rahman',
    email: 'cs.sunamganj@dghs.gov.bd.demo',
    role: 'District Health Manager',
    district: 'Sunamganj',
    demoPin: '1234',
  },
  {
    id: 'user-clinic',
    name: 'Shahnaz Parveen',
    email: 'admin@greencrescent.org.demo',
    role: 'Private Clinic Admin',
    clinic: 'Green Crescent Mother & Child Clinic',
    demoPin: '1234',
  },
  {
    id: 'user-auditor',
    name: 'M. Kabir Hossain',
    email: 'auditor.dg@internal-audit.demo',
    role: 'Auditor',
    demoPin: '1234',
  },
];

// Open DB Promise Singleton
let dbPromise: Promise<IDBDatabase> | null = null;
let isSeeding = false;

export function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('children')) {
        const childStore = db.createObjectStore('children', { keyPath: 'id' });
        childStore.createIndex('brn', 'brn', { unique: true });
        childStore.createIndex('pendantTagId', 'pendantTagId', { unique: true });
      }

      if (!db.objectStoreNames.contains('pendants')) {
        const pendantStore = db.createObjectStore('pendants', { keyPath: 'tagId' });
        pendantStore.createIndex('childId', 'childId', { unique: false });
      }

      if (!db.objectStoreNames.contains('doses')) {
        const doseStore = db.createObjectStore('doses', { keyPath: 'id' });
        doseStore.createIndex('childId', 'childId', { unique: false });
        doseStore.createIndex('dateScheduled', 'dateScheduled', { unique: false });
      }

      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('alerts')) {
        const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
        alertStore.createIndex('childId', 'childId', { unique: false });
      }

      if (!db.objectStoreNames.contains('ivrCalls')) {
        const ivrStore = db.createObjectStore('ivrCalls', { keyPath: 'id' });
        ivrStore.createIndex('childId', 'childId', { unique: false });
      }

      if (!db.objectStoreNames.contains('coldBoxes')) {
        db.createObjectStore('coldBoxes', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('auditLog')) {
        const auditStore = db.createObjectStore('auditLog', { keyPath: 'id' });
        auditStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('role', 'role', { unique: false });
      }
    };

    request.onsuccess = async () => {
      const db = request.result;
      await ensureSeeded(db);
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open database'));
    };
  });

  return dbPromise;
}

// Seed the database exactly once if empty
async function ensureSeeded(db: IDBDatabase): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const count = await new Promise<number>((resolve) => {
      const tx = db.transaction('children', 'readonly');
      const store = tx.objectStore('children');
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => resolve(0);
    });

    if (count > 0) {
      isSeeding = false;
      return;
    }

    // Populate Initial Data
    const tx = db.transaction(STORES, 'readwrite');

    // 1. Children, Pendants, Doses
    const childStore = tx.objectStore('children');
    const pendantStore = tx.objectStore('pendants');
    const doseStore = tx.objectStore('doses');

    // Clean duplicate BRNs from seed
    const seenBrn = new Set<string>();
    const seenTag = new Set<string>();

    for (const child of INITIAL_CHILDREN) {
      if (seenBrn.has(child.brn) || seenTag.has(child.pendantTagId)) continue;
      seenBrn.add(child.brn);
      seenTag.add(child.pendantTagId);

      // Tag child-1 as private clinic for RBAC demonstration
      const enhancedChild: ChildRecord = {
        ...child,
        clinicTagged: child.id === 'child-1',
        clinicName: child.id === 'child-1' ? 'Green Crescent Mother & Child Clinic' : 'Upazila Health Complex (Public)',
      };

      childStore.put(enhancedChild);

      // Pendant store entry
      const pendant: PendantRecord = {
        tagId: child.pendantTagId,
        childId: child.id,
        childName: child.name,
        status: 'active',
        assignedDate: child.dob,
        lastScanDate: child.lastDoseDate || child.dob,
        tokenHash: child.pendantToken,
      };
      pendantStore.put(pendant);

      // Doses store entries
      for (const dose of child.timeline) {
        const flatDose: FlatDoseRecord = {
          id: dose.id,
          childId: child.id,
          childName: child.name,
          vaccine: dose.vaccine,
          disease: dose.disease,
          targetAgeEn: dose.targetAgeEn,
          targetAgeBn: dose.targetAgeBn,
          status: dose.status,
          dateScheduled: dose.dateScheduled,
          dateAdministered: dose.dateAdministered,
          batchNumber: dose.batchNumber,
          administeredBy: dose.administeredBy,
        };
        doseStore.put(flatDose);
      }
    }

    // 2. Cold Boxes
    const boxStore = tx.objectStore('coldBoxes');
    for (const box of INITIAL_COLD_BOXES) {
      boxStore.put(box);
    }

    // 3. Users
    const userStore = tx.objectStore('users');
    for (const user of INITIAL_USERS) {
      userStore.put(user);
    }

    // 4. Initial Audit Log
    const auditStore = tx.objectStore('auditLog');
    const initialAudits: AuditLogRecord[] = [
      {
        id: 'audit-seed-1',
        timestamp: '2026-09-19 08:00:00',
        who: 'System Bootloader',
        role: 'Super Admin',
        action: 'RESET',
        target: 'smartguard_demo',
        details: 'Initial database schema and mock clinical demo records verified.',
      },
      {
        id: 'audit-seed-2',
        timestamp: '2026-09-19 08:30:00',
        who: 'Amena Khatun (CHW #402)',
        role: 'District Health Manager',
        action: 'RECORD_DOSE',
        target: 'Tanvir Hasan (child-1)',
        details: 'Penta-3 + PCV-3 administered during outreach session. Batch PV-9034 confirmed.',
      },
    ];
    for (const log of initialAudits) {
      auditStore.put(log);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error during database seeding:', err);
  } finally {
    isSeeding = false;
  }
}

// ----------------------------------------------------------------------------
// AUDIT LOG HELPER
// ----------------------------------------------------------------------------
export async function logAudit(
  entry: Omit<AuditLogRecord, 'id' | 'timestamp'>
): Promise<AuditLogRecord> {
  const db = await getDatabase();
  const fullEntry: AuditLogRecord = {
    ...entry,
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('auditLog', 'readwrite');
    const store = tx.objectStore('auditLog');
    const req = store.put(fullEntry);
    req.onsuccess = () => {
      notifySubscribers('auditLog', 'CREATE', fullEntry);
      resolve(fullEntry);
    };
    req.onerror = () => reject(req.error);
  });
}

// ----------------------------------------------------------------------------
// CHILDREN CRUD & VALIDATION
// ----------------------------------------------------------------------------
export async function getAllChildren(): Promise<ChildRecord[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('children', 'readonly');
    const store = tx.objectStore('children');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getChildById(id: string): Promise<ChildRecord | null> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('children', 'readonly');
    const store = tx.objectStore('children');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveChild(
  child: ChildRecord,
  user?: { name: string; role: AdminRole }
): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  const cleanBrn = child.brn.trim().toUpperCase();

  // 1. Enforce unique BRN and unique Pendant Tag ID
  const all = await getAllChildren();
  const existingWithBrn = all.find(
    (c) => c.brn.trim().toUpperCase() === cleanBrn && c.id !== child.id
  );
  if (existingWithBrn) {
    return {
      success: false,
      error: 'Duplicate record: BRN already exists',
    };
  }

  const existingWithTag = all.find(
    (c) => c.pendantTagId.trim().toUpperCase() === child.pendantTagId.trim().toUpperCase() && c.id !== child.id
  );
  if (existingWithTag) {
    return {
      success: false,
      error: `Pendant Tag ID "${child.pendantTagId}" is already assigned to child "${existingWithTag.name}"`,
    };
  }

  const isNew = !all.some((c) => c.id === child.id);
  const oldRecord = isNew ? null : all.find((c) => c.id === child.id);

  const cleanChild: ChildRecord = {
    ...child,
    brn: cleanBrn,
  };

  return new Promise((resolve) => {
    const tx = db.transaction(['children', 'pendants', 'doses'], 'readwrite');
    const childStore = tx.objectStore('children');
    const pendantStore = tx.objectStore('pendants');
    const doseStore = tx.objectStore('doses');

    childStore.put(cleanChild);

    // Sync pendant store
    const pendant: PendantRecord = {
      tagId: cleanChild.pendantTagId,
      childId: cleanChild.id,
      childName: cleanChild.name,
      status: 'active',
      assignedDate: cleanChild.dob,
      lastScanDate: cleanChild.lastDoseDate || cleanChild.dob,
      tokenHash: cleanChild.pendantToken,
    };
    pendantStore.put(pendant);

    // Sync doses store
    for (const dose of cleanChild.timeline) {
      const flatDose: FlatDoseRecord = {
        id: dose.id,
        childId: cleanChild.id,
        childName: cleanChild.name,
        vaccine: dose.vaccine,
        disease: dose.disease,
        targetAgeEn: dose.targetAgeEn,
        targetAgeBn: dose.targetAgeBn,
        status: dose.status,
        dateScheduled: dose.dateScheduled,
        dateAdministered: dose.dateAdministered,
        batchNumber: dose.batchNumber,
        administeredBy: dose.administeredBy,
      };
      doseStore.put(flatDose);
    }

    tx.oncomplete = async () => {
      await logAudit({
        who: user?.name || 'System / Frontline Client',
        role: user?.role || 'Super Admin',
        action: isNew ? 'CREATE' : 'UPDATE',
        target: `${cleanChild.name} (${cleanChild.id})`,
        before: oldRecord,
        after: cleanChild,
        details: isNew
          ? `Registered new child record with BRN: ${cleanBrn}, Pendant: ${cleanChild.pendantTagId}`
          : `Updated details for ${cleanChild.name}`,
      });
      notifySubscribers('children', isNew ? 'CREATE' : 'UPDATE', cleanChild);
      resolve({ success: true });
    };

    tx.onerror = () => {
      resolve({ success: false, error: tx.error?.message || 'Database write error' });
    };
  });
}

export async function deleteChild(
  childId: string,
  user?: { name: string; role: AdminRole }
): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  const child = await getChildById(childId);
  if (!child) return { success: false, error: 'Child record not found' };

  return new Promise((resolve) => {
    const tx = db.transaction(['children', 'pendants', 'doses'], 'readwrite');
    const childStore = tx.objectStore('children');
    const pendantStore = tx.objectStore('pendants');
    const doseStore = tx.objectStore('doses');

    childStore.delete(childId);

    // Cascade delete pendant
    pendantStore.delete(child.pendantTagId);

    // Cascade delete doses
    for (const d of child.timeline) {
      doseStore.delete(d.id);
    }

    tx.oncomplete = async () => {
      await logAudit({
        who: user?.name || 'System Administrator',
        role: user?.role || 'Super Admin',
        action: 'DELETE',
        target: `${child.name} (${child.id})`,
        before: child,
        details: `Deleted patient record ${child.name} (BRN: ${child.brn}). Associated pendant and doses removed.`,
      });
      notifySubscribers('children', 'DELETE', { id: childId });
      resolve({ success: true });
    };

    tx.onerror = () => {
      resolve({ success: false, error: tx.error?.message || 'Delete operation failed' });
    };
  });
}

// ----------------------------------------------------------------------------
// PENDANTS CRUD
// ----------------------------------------------------------------------------
export async function getAllPendants(): Promise<PendantRecord[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendants', 'readonly');
    const store = tx.objectStore('pendants');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function savePendant(
  pendant: PendantRecord,
  user?: { name: string; role: AdminRole }
): Promise<boolean> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction(['pendants', 'children'], 'readwrite');
    const pendantStore = tx.objectStore('pendants');
    const childStore = tx.objectStore('children');

    pendantStore.put(pendant);

    // Update child tag ID link if child exists
    const childReq = childStore.get(pendant.childId);
    childReq.onsuccess = () => {
      const child = childReq.result as ChildRecord;
      if (child) {
        child.pendantTagId = pendant.tagId;
        child.pendantToken = pendant.tokenHash;
        childStore.put(child);
      }
    };

    tx.oncomplete = async () => {
      await logAudit({
        who: user?.name || 'Health Worker / Admin',
        role: user?.role || 'Super Admin',
        action: 'REWRITE_TAG',
        target: `Pendant Tag ${pendant.tagId}`,
        details: `Assigned pendant ${pendant.tagId} to ${pendant.childName} (Status: ${pendant.status})`,
      });
      notifySubscribers('pendants', 'UPDATE', pendant);
      notifySubscribers('children', 'UPDATE');
      resolve(true);
    };

    tx.onerror = () => resolve(false);
  });
}

// ----------------------------------------------------------------------------
// DOSES CRUD
// ----------------------------------------------------------------------------
export async function getAllDoses(): Promise<FlatDoseRecord[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('doses', 'readonly');
    const store = tx.objectStore('doses');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDoseRecord(
  dose: FlatDoseRecord,
  user?: { name: string; role: AdminRole }
): Promise<boolean> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction(['doses', 'children'], 'readwrite');
    const doseStore = tx.objectStore('doses');
    const childStore = tx.objectStore('children');

    doseStore.put(dose);

    // Also update timeline in child
    const childReq = childStore.get(dose.childId);
    childReq.onsuccess = () => {
      const child = childReq.result as ChildRecord;
      if (child) {
        child.timeline = child.timeline.map((d) => {
          if (d.id === dose.id) {
            return {
              ...d,
              status: dose.status,
              batchNumber: dose.batchNumber,
              dateAdministered: dose.dateAdministered,
              administeredBy: dose.administeredBy,
            };
          }
          return d;
        });
        if (dose.status === 'done' && dose.dateAdministered) {
          child.lastDoseDate = dose.dateAdministered;
        }
        childStore.put(child);
      }
    };

    tx.oncomplete = async () => {
      await logAudit({
        who: user?.name || dose.administeredBy || 'Health Assistant',
        role: user?.role || 'Super Admin',
        action: 'RECORD_DOSE',
        target: `${dose.vaccine} - ${dose.childName}`,
        details: `Dose status updated to "${dose.status}" (Batch: ${dose.batchNumber || 'N/A'})`,
      });
      notifySubscribers('doses', 'UPDATE', dose);
      notifySubscribers('children', 'UPDATE');
      resolve(true);
    };

    tx.onerror = () => resolve(false);
  });
}

// ----------------------------------------------------------------------------
// SYNC QUEUE
// ----------------------------------------------------------------------------
export async function getAllSyncQueue(): Promise<QueuedAction[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSyncQueue(items: QueuedAction[]): Promise<boolean> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    store.clear();
    for (const item of items) {
      store.put(item);
    }
    tx.oncomplete = () => {
      notifySubscribers('syncQueue', 'UPDATE', items);
      resolve(true);
    };
    tx.onerror = () => resolve(false);
  });
}

export async function clearSyncQueue(user?: { name: string; role: AdminRole }): Promise<boolean> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    store.clear();
    tx.oncomplete = async () => {
      await logAudit({
        who: user?.name || 'Sync Engine',
        role: user?.role || 'Super Admin',
        action: 'SYNC',
        target: 'syncQueue',
        details: 'Offline queue flushed and synchronized with central server.',
      });
      notifySubscribers('syncQueue', 'DELETE');
      resolve(true);
    };
    tx.onerror = () => resolve(false);
  });
}

// ----------------------------------------------------------------------------
// ALERTS & IVR CALLS
// ----------------------------------------------------------------------------
export async function getAllAlerts(): Promise<SmsAlert[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('alerts', 'readonly');
    const store = tx.objectStore('alerts');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAlert(alert: SmsAlert): Promise<boolean> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    store.put(alert);
    tx.oncomplete = () => {
      notifySubscribers('alerts', 'CREATE', alert);
      resolve(true);
    };
    tx.onerror = () => resolve(false);
  });
}

export async function getAllIvrCalls(): Promise<IvrCallLog[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('ivrCalls', 'readonly');
    const store = tx.objectStore('ivrCalls');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveIvrCall(call: IvrCallLog): Promise<boolean> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('ivrCalls', 'readwrite');
    const store = tx.objectStore('ivrCalls');
    store.put(call);
    tx.oncomplete = () => {
      notifySubscribers('ivrCalls', 'CREATE', call);
      resolve(true);
    };
    tx.onerror = () => resolve(false);
  });
}

// ----------------------------------------------------------------------------
// COLD BOXES
// ----------------------------------------------------------------------------
export async function getAllColdBoxes(): Promise<ColdBox[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('coldBoxes', 'readonly');
    const store = tx.objectStore('coldBoxes');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveColdBoxes(
  boxes: ColdBox[],
  user?: { name: string; role: AdminRole }
): Promise<boolean> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('coldBoxes', 'readwrite');
    const store = tx.objectStore('coldBoxes');
    for (const box of boxes) {
      store.put(box);
    }
    tx.oncomplete = async () => {
      notifySubscribers('coldBoxes', 'UPDATE', boxes);
      resolve(true);
    };
    tx.onerror = () => resolve(false);
  });
}

// ----------------------------------------------------------------------------
// AUDIT LOGS & USERS
// ----------------------------------------------------------------------------
export async function getAllAuditLogs(): Promise<AuditLogRecord[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('auditLog', 'readonly');
    const store = tx.objectStore('auditLog');
    const req = store.getAll();
    req.onsuccess = () => {
      const logs = (req.result || []) as AuditLogRecord[];
      // Sort newest first
      logs.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
      resolve(logs);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || INITIAL_USERS);
    req.onerror = () => reject(req.error);
  });
}

// ----------------------------------------------------------------------------
// RESET DEMO DATABASE
// ----------------------------------------------------------------------------
export async function resetDatabaseToSeed(
  user?: { name: string; role: AdminRole }
): Promise<boolean> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, 'readwrite');

    for (const storeName of STORES) {
      tx.objectStore(storeName).clear();
    }

    // Re-seed children, pendants, doses
    const childStore = tx.objectStore('children');
    const pendantStore = tx.objectStore('pendants');
    const doseStore = tx.objectStore('doses');

    const seenBrn = new Set<string>();
    const seenTag = new Set<string>();

    for (const child of INITIAL_CHILDREN) {
      if (seenBrn.has(child.brn) || seenTag.has(child.pendantTagId)) continue;
      seenBrn.add(child.brn);
      seenTag.add(child.pendantTagId);

      const enhancedChild: ChildRecord = {
        ...child,
        clinicTagged: child.id === 'child-1',
        clinicName: child.id === 'child-1' ? 'Green Crescent Mother & Child Clinic' : 'Upazila Health Complex (Public)',
      };
      childStore.put(enhancedChild);

      pendantStore.put({
        tagId: child.pendantTagId,
        childId: child.id,
        childName: child.name,
        status: 'active',
        assignedDate: child.dob,
        lastScanDate: child.lastDoseDate || child.dob,
        tokenHash: child.pendantToken,
      });

      for (const dose of child.timeline) {
        doseStore.put({
          id: dose.id,
          childId: child.id,
          childName: child.name,
          vaccine: dose.vaccine,
          disease: dose.disease,
          targetAgeEn: dose.targetAgeEn,
          targetAgeBn: dose.targetAgeBn,
          status: dose.status,
          dateScheduled: dose.dateScheduled,
          dateAdministered: dose.dateAdministered,
          batchNumber: dose.batchNumber,
          administeredBy: dose.administeredBy,
        });
      }
    }

    const boxStore = tx.objectStore('coldBoxes');
    for (const box of INITIAL_COLD_BOXES) {
      boxStore.put(box);
    }

    const userStore = tx.objectStore('users');
    for (const u of INITIAL_USERS) {
      userStore.put(u);
    }

    const auditStore = tx.objectStore('auditLog');
    auditStore.put({
      id: 'audit-reset-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      who: user?.name || 'Super Admin',
      role: user?.role || 'Super Admin',
      action: 'RESET',
      target: 'smartguard_demo',
      details: 'Demo database reset to initial 4 children and default seed stores.',
    });

    tx.oncomplete = () => {
      for (const s of STORES) {
        notifySubscribers(s, 'RESET');
      }
      resolve(true);
    };

    tx.onerror = () => reject(tx.error);
  });
}

// ----------------------------------------------------------------------------
// DATA TOOLS: EXPORT / IMPORT / CSV
// ----------------------------------------------------------------------------
export async function exportAllDataJSON(): Promise<string> {
  const children = await getAllChildren();
  const pendants = await getAllPendants();
  const doses = await getAllDoses();
  const syncQueue = await getAllSyncQueue();
  const alerts = await getAllAlerts();
  const ivrCalls = await getAllIvrCalls();
  const coldBoxes = await getAllColdBoxes();
  const auditLog = await getAllAuditLogs();
  const users = await getAllUsers();

  const exportObj = {
    _meta: {
      appName: 'SmartGuard BD Prototype Admin Console',
      exportedAt: new Date().toISOString(),
      database: DB_NAME,
      version: DB_VERSION,
      disclaimer: 'Sample data. Not connected to real health systems.',
    },
    children,
    pendants,
    doses,
    syncQueue,
    alerts,
    ivrCalls,
    coldBoxes,
    auditLog,
    users,
  };

  return JSON.stringify(exportObj, null, 2);
}

export async function exportStoreCSV(storeName: StoreName): Promise<string> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => {
      const records = req.result || [];
      if (records.length === 0) {
        resolve('No records in store');
        return;
      }
      const headers = Object.keys(records[0]).filter((k) => typeof records[0][k] !== 'object');
      const rows = records.map((rec) =>
        headers.map((h) => JSON.stringify(rec[h] ?? '')).join(',')
      );
      resolve([headers.join(','), ...rows].join('\n'));
    };
    req.onerror = () => resolve('Error exporting CSV');
  });
}

export async function importDataJSON(
  jsonString: string,
  user?: { name: string; role: AdminRole }
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON structure' };
    }

    const importedChildren = parsed.children || [];
    if (!Array.isArray(importedChildren)) {
      return { success: false, message: 'JSON does not contain a valid children array' };
    }

    // Validate BRNs and Tag IDs for duplicates
    const seenBrn = new Set<string>();
    const seenTag = new Set<string>();

    for (const c of importedChildren) {
      if (!c.brn || !c.name || !c.pendantTagId) {
        return { success: false, message: `Child missing required fields (name, brn, or pendantTagId)` };
      }
      if (seenBrn.has(c.brn.trim().toUpperCase())) {
        return { success: false, message: `Duplicate BRN in import payload: ${c.brn}` };
      }
      if (seenTag.has(c.pendantTagId.trim().toUpperCase())) {
        return { success: false, message: `Duplicate Tag ID in import payload: ${c.pendantTagId}` };
      }
      seenBrn.add(c.brn.trim().toUpperCase());
      seenTag.add(c.pendantTagId.trim().toUpperCase());
    }

    const db = await getDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES, 'readwrite');

      // Clear existing children, pendants, doses
      tx.objectStore('children').clear();
      tx.objectStore('pendants').clear();
      tx.objectStore('doses').clear();

      const childStore = tx.objectStore('children');
      const pendantStore = tx.objectStore('pendants');
      const doseStore = tx.objectStore('doses');

      for (const child of importedChildren) {
        childStore.put(child);

        pendantStore.put({
          tagId: child.pendantTagId,
          childId: child.id,
          childName: child.name,
          status: 'active',
          assignedDate: child.dob,
          lastScanDate: child.lastDoseDate || child.dob,
          tokenHash: child.pendantToken || `SHA256: mock${Date.now()}`,
        });

        if (Array.isArray(child.timeline)) {
          for (const dose of child.timeline) {
            doseStore.put({
              id: dose.id,
              childId: child.id,
              childName: child.name,
              vaccine: dose.vaccine,
              disease: dose.disease,
              targetAgeEn: dose.targetAgeEn || '',
              targetAgeBn: dose.targetAgeBn || '',
              status: dose.status,
              dateScheduled: dose.dateScheduled,
              dateAdministered: dose.dateAdministered,
              batchNumber: dose.batchNumber,
              administeredBy: dose.administeredBy,
            });
          }
        }
      }

      tx.oncomplete = async () => {
        await logAudit({
          who: user?.name || 'Admin Console User',
          role: user?.role || 'Super Admin',
          action: 'IMPORT',
          target: 'smartguard_demo',
          details: `Imported ${importedChildren.length} child records from JSON payload.`,
        });

        for (const s of STORES) {
          notifySubscribers(s, 'IMPORT');
        }

        resolve({
          success: true,
          message: `Successfully imported ${importedChildren.length} child records with validated unique BRNs and Tag IDs.`,
          count: importedChildren.length,
        });
      };

      tx.onerror = () => {
        resolve({ success: false, message: tx.error?.message || 'Database import error' });
      };
    });
  } catch (err: any) {
    return { success: false, message: `Parse error: ${err?.message || 'Unknown'}` };
  }
}

// ----------------------------------------------------------------------------
// DATA INTEGRITY CHECK & REPAIR TOOLS
// ----------------------------------------------------------------------------
export async function checkIntegrity(): Promise<{
  valid: boolean;
  issues: string[];
  counts: Record<string, number>;
}> {
  const children = await getAllChildren();
  const pendants = await getAllPendants();
  const doses = await getAllDoses();

  const issues: string[] = [];

  // Check unique BRN
  const brnMap = new Map<string, string>();
  for (const c of children) {
    const b = c.brn.trim().toUpperCase();
    if (brnMap.has(b)) {
      issues.push(`Duplicate BRN detected: ${b} shared between "${c.name}" and "${brnMap.get(b)}"`);
    } else {
      brnMap.set(b, c.name);
    }
  }

  // Check unique Pendant Tag ID
  const tagMap = new Map<string, string>();
  for (const p of pendants) {
    const t = p.tagId.trim().toUpperCase();
    if (tagMap.has(t)) {
      issues.push(`Duplicate Pendant Tag ID detected: ${t} (Child: ${p.childName})`);
    } else {
      tagMap.set(t, p.childName);
    }
  }

  // Check orphan doses
  const childIdSet = new Set(children.map((c) => c.id));
  for (const d of doses) {
    if (!childIdSet.has(d.childId)) {
      issues.push(`Orphan dose found: ${d.vaccine} (#${d.id}) references missing child "${d.childId}"`);
    }
  }

  // Check orphan pendants
  for (const p of pendants) {
    if (!childIdSet.has(p.childId)) {
      issues.push(`Orphan pendant found: Tag ${p.tagId} references missing child "${p.childId}"`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    counts: {
      children: children.length,
      pendants: pendants.length,
      doses: doses.length,
    },
  };
}

export async function simulateCorruption(): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction(['doses', 'pendants'], 'readwrite');
    const doseStore = tx.objectStore('doses');
    const pendantStore = tx.objectStore('pendants');

    // Insert an orphan dose referencing non-existent child
    doseStore.put({
      id: 'dose-orphan-' + Date.now(),
      childId: 'child-ghost-999',
      childName: 'Ghost Patient',
      vaccine: 'PCV-3',
      disease: 'Pneumococcal',
      targetAgeEn: '14 Weeks',
      targetAgeBn: '১৪ সপ্তাহ',
      status: 'due',
      dateScheduled: '2026-09-20',
    });

    // Insert an orphan pendant
    pendantStore.put({
      tagId: 'SG-NFC-GHOST',
      childId: 'child-ghost-888',
      childName: 'Ghost Patient 2',
      status: 'active',
      assignedDate: '2026-01-01',
      lastScanDate: '2026-01-01',
      tokenHash: 'SHA256: corrupted_test',
    });

    tx.oncomplete = () => {
      notifySubscribers('doses', 'UPDATE');
      notifySubscribers('pendants', 'UPDATE');
      resolve();
    };
  });
}

export async function repairIntegrity(): Promise<{ fixedCount: number; message: string }> {
  const db = await getDatabase();
  const children = await getAllChildren();
  const childIdSet = new Set(children.map((c) => c.id));

  return new Promise((resolve) => {
    const tx = db.transaction(['doses', 'pendants'], 'readwrite');
    const doseStore = tx.objectStore('doses');
    const pendantStore = tx.objectStore('pendants');

    let fixedCount = 0;

    const doseReq = doseStore.getAll();
    doseReq.onsuccess = () => {
      const doses = (doseReq.result || []) as FlatDoseRecord[];
      for (const d of doses) {
        if (!childIdSet.has(d.childId)) {
          doseStore.delete(d.id);
          fixedCount++;
        }
      }
    };

    const pendantReq = pendantStore.getAll();
    pendantReq.onsuccess = () => {
      const pendants = (pendantReq.result || []) as PendantRecord[];
      for (const p of pendants) {
        if (!childIdSet.has(p.childId)) {
          pendantStore.delete(p.tagId);
          fixedCount++;
        }
      }
    };

    tx.oncomplete = async () => {
      await logAudit({
        who: 'Database Integrity Repair Tool',
        role: 'Super Admin',
        action: 'UPDATE',
        target: 'smartguard_demo',
        details: `Integrity check completed: pruned ${fixedCount} orphaned/corrupted foreign keys.`,
      });
      notifySubscribers('doses', 'UPDATE');
      notifySubscribers('pendants', 'UPDATE');
      resolve({
        fixedCount,
        message: `Database repaired successfully: pruned ${fixedCount} orphaned records. Foreign key integrity verified.`,
      });
    };

    tx.onerror = () => {
      resolve({ fixedCount: 0, message: 'Repair transaction failed' });
    };
  });
}
