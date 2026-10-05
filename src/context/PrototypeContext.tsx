import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ChildRecord, ColdBox, QueuedAction, SyncLogEntry, SmsAlert, VaccineDoseRecord } from '../types/prototype';
import { INITIAL_CHILDREN, INITIAL_COLD_BOXES, INITIAL_LOGS } from '../data/prototypeSeed';
import { saveQueueToStorage, loadQueueFromStorage, clearQueueStorage } from '../utils/indexedDB';
import {
  getAllChildren,
  saveChild,
  getAllColdBoxes,
  saveColdBoxes,
  getAllSyncQueue,
  saveSyncQueue,
  clearSyncQueue,
  resetDatabaseToSeed,
  subscribeToDatabase,
} from '../utils/demoDatabase';

interface RegisterChildResult {
  success: boolean;
  childId?: string;
  error?: string;
}

interface PrototypeContextType {
  // Global simulation state
  currentDate: string;
  daysAdvanced: number;
  isOnline: boolean;
  pendingActions: QueuedAction[];
  isSyncing: boolean;
  syncProgress: number;

  // Domain State
  children: ChildRecord[];
  selectedChildId: string;
  selectedChild: ChildRecord;
  coldBoxes: ColdBox[];
  isColdChainBreached: boolean;
  isColdChainFrozen: boolean;
  syncLogs: SyncLogEntry[];
  smsAlerts: SmsAlert[];
  dueListCount: number;

  // Admin Database Console & Privacy State
  isAdminConsoleOpen: boolean;
  setIsAdminConsoleOpen: (open: boolean) => void;
  openAdminConsole: () => void;
  closeAdminConsole: () => void;
  toggleAdminConsole: () => void;
  isPiiMasked: boolean;
  togglePiiMask: () => void;
  reloadFromDatabase: () => Promise<void>;

  // Active UI Navigation inside Prototype
  activeTab: 'field-app' | 'offline-sync' | 'dropout' | 'manager' | 'all';
  setActiveTab: (tab: 'field-app' | 'offline-sync' | 'dropout' | 'manager' | 'all') => void;
  guidedTourStep: number | null; // 1 to 5, or null
  activeSubViewPhone: 'scan' | 'register' | 'lost-tag' | 'due-list';
  setActiveSubViewPhone: (view: 'scan' | 'register' | 'lost-tag' | 'due-list') => void;

  // Methods
  selectChild: (id: string) => void;
  toggleOnline: (status?: boolean) => void;
  advanceTime: (days: number) => void;
  resetTime: () => void;
  reconnectAndSync: () => Promise<void>;
  registerChild: (data: {
    name: string;
    motherName: string;
    brn: string;
    dob: string;
    phone: string;
    phoneActive: boolean;
    healthId: string;
    pendantToken: string;
  }) => Promise<RegisterChildResult>;
  recordDose: (childId: string, doseId: string, batchNumber: string) => Promise<boolean>;
  rewritePendantTag: (childId: string) => Promise<{ success: boolean; newTagId: string; token: string; elapsedSec: number }>;
  triggerColdChainBreach: () => void;
  triggerColdChainFreeze: () => void;
  restoreColdChain: () => void;
  triggerIVRCall: (childId: string) => void;
  resetDemo: () => void;
  startGuidedTour: () => void;
  setGuidedTourStep: (step: number | null) => void;
  nextGuidedTourStep: () => void;
  prevGuidedTourStep: () => void;
  closeGuidedTour: () => void;

  // Computed metrics for Manager Dashboard
  metrics: {
    totalChildren: number;
    fullyVaccinatedCount: number;
    fullyVaccinatedPct: number;
    dropoutCount: number;
    dropoutRatePct: number;
    criticalRiskCount: number;
    coldChainIntegrityPct: number;
  };
}

const PrototypeContext = createContext<PrototypeContextType | undefined>(undefined);

const BASE_SIMULATED_DATE = new Date('2026-09-19T09:00:00');

export const PrototypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [daysAdvanced, setDaysAdvanced] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingActions, setPendingActions] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // Initialize with unique list guaranteed
  const [childrenList, setChildrenList] = useState<ChildRecord[]>(() => {
    // Deduplicate by BRN
    const seen = new Set<string>();
    return INITIAL_CHILDREN.filter((c) => {
      if (seen.has(c.brn)) return false;
      seen.add(c.brn);
      return true;
    });
  });

  const [selectedChildId, setSelectedChildId] = useState<string>('child-1');
  const [coldBoxes, setColdBoxes] = useState<ColdBox[]>(INITIAL_COLD_BOXES);
  const [isColdChainBreached, setIsColdChainBreached] = useState<boolean>(false);
  const [isColdChainFrozen, setIsColdChainFrozen] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(INITIAL_LOGS);
  const [smsAlerts, setSmsAlerts] = useState<SmsAlert[]>([]);
  const [firedAlertKeys, setFiredAlertKeys] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<'field-app' | 'offline-sync' | 'dropout' | 'manager' | 'all'>('field-app');
  const [activeSubViewPhone, setActiveSubViewPhone] = useState<'scan' | 'register' | 'lost-tag' | 'due-list'>('scan');
  const [guidedTourStep, setGuidedTourStep] = useState<number | null>(null);

  // Admin Database Console & Privacy State
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState<boolean>(false);
  const [isPiiMasked, setIsPiiMasked] = useState<boolean>(true);

  const openAdminConsole = useCallback(() => setIsAdminConsoleOpen(true), []);
  const closeAdminConsole = useCallback(() => setIsAdminConsoleOpen(false), []);
  const toggleAdminConsole = useCallback(() => setIsAdminConsoleOpen((p) => !p), []);
  const togglePiiMask = useCallback(() => setIsPiiMasked((p) => !p), []);

  const reloadFromDatabase = useCallback(async () => {
    try {
      const dbChildren = await getAllChildren();
      if (dbChildren && dbChildren.length > 0) {
        setChildrenList(dbChildren);
      }
      const dbBoxes = await getAllColdBoxes();
      if (dbBoxes && dbBoxes.length > 0) {
        setColdBoxes(dbBoxes);
      }
      const dbQueue = await getAllSyncQueue();
      if (dbQueue && dbQueue.length > 0) {
        setPendingActions(dbQueue);
      }
    } catch (e) {
      console.error('Error reloading from database:', e);
    }
  }, []);

  // Keyboard shortcut: Ctrl+L / Ctrl+Shift+L / Meta+L to toggle Admin DB Console, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setIsAdminConsoleOpen((p) => !p);
      } else if (e.key === 'Escape' && isAdminConsoleOpen) {
        setIsAdminConsoleOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminConsoleOpen]);

  // Initialize from smartguard_demo IndexedDB and subscribe to changes
  useEffect(() => {
    reloadFromDatabase();

    const unsubscribe = subscribeToDatabase(async (store) => {
      if (store === 'children') {
        const updated = await getAllChildren();
        if (updated && updated.length > 0) {
          setChildrenList(updated);
        }
      } else if (store === 'coldBoxes') {
        const updated = await getAllColdBoxes();
        if (updated && updated.length > 0) {
          setColdBoxes(updated);
        }
      } else if (store === 'syncQueue') {
        const updated = await getAllSyncQueue();
        setPendingActions(updated);
      }
    });

    return () => unsubscribe();
  }, [reloadFromDatabase]);

  // Format the current simulated date
  const currentDate = useMemo(() => {
    const d = new Date(BASE_SIMULATED_DATE.getTime() + daysAdvanced * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  }, [daysAdvanced]);

  // Live fluctuating cold box temperatures (safe oscillations within 2°C - 8°C)
  useEffect(() => {
    if (isColdChainBreached || isColdChainFrozen) return;

    const interval = setInterval(() => {
      setColdBoxes((prev) =>
        prev.map((box) => {
          const delta = (Math.random() - 0.5) * 0.2;
          const newTemp = Math.round(Math.min(7.6, Math.max(2.4, box.temp + delta)) * 10) / 10;
          return {
            ...box,
            temp: newTemp,
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [isColdChainBreached, isColdChainFrozen]);

  // Dynamic recalculation of child risk scores and vaccine timelines from simulated date
  const recalculatedChildren = useMemo(() => {
    const currTime = new Date(currentDate + 'T00:00:00').getTime();

    return childrenList.map((child) => {
      // 1. Recalculate timeline status for each dose
      const updatedTimeline: VaccineDoseRecord[] = child.timeline.map((dose) => {
        if (dose.dateAdministered) {
          return { ...dose, status: 'done' as const };
        }

        const scheduledTime = new Date(dose.dateScheduled + 'T00:00:00').getTime();
        const diffDays = Math.floor((currTime - scheduledTime) / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          return { ...dose, status: 'overdue' as const };
        } else if (diffDays >= -14) {
          // Scheduled today or within 14 days
          return { ...dose, status: 'due' as const };
        } else {
          // Future dose
          return { ...dose, status: 'not-yet-due' as const };
        }
      });

      // 2. Determine done count and next due dose
      const doneDoses = updatedTimeline.filter((d) => d.status === 'done');
      const nextPendingDose = updatedTimeline.find((d) => d.status !== 'done');
      const hasZeroDoses = doneDoses.length === 0;

      let daysOverdue = 0;
      if (nextPendingDose) {
        const scheduledTime = new Date(nextPendingDose.dateScheduled + 'T00:00:00').getTime();
        const diffDays = Math.floor((currTime - scheduledTime) / (1000 * 60 * 60 * 24));
        daysOverdue = Math.max(0, diffDays);
      }

      // 3. Exact Risk Score Calculation (Requirement 3)
      // 0-13 days overdue = 10, 14-27 = 30, 28-55 = 50, 56+ = 70
      let overduePts = 10;
      if (daysOverdue >= 56) {
        overduePts = 70;
      } else if (daysOverdue >= 28) {
        overduePts = 50;
      } else if (daysOverdue >= 14) {
        overduePts = 30;
      } else {
        overduePts = 10;
      }

      // Plus: +10 per missed session
      const missedPts = (child.missedSessions || 0) * 10;

      // Plus: +15 if phone unreachable
      const phonePts = child.phoneActive ? 0 : 15;

      // Capped at 100
      const totalRaw = Math.min(100, overduePts + missedPts + phonePts);

      // Labels: 0-34 Low, 35-69 Moderate, 70-100 Critical.
      // RULE: Any child past 56 days must be Critical.
      let level: 'low' | 'moderate' | 'critical' = 'low';
      if (daysOverdue >= 56 || totalRaw >= 70) {
        level = 'critical';
      } else if (totalRaw >= 35) {
        level = 'moderate';
      }

      const nextDueDoseName = nextPendingDose ? nextPendingDose.vaccine.split(' ')[0] : 'Fully Completed';

      const scoreBreakdown = {
        daysOverdue,
        overduePts,
        missedSessions: child.missedSessions || 0,
        missedPts,
        phoneActive: child.phoneActive,
        phonePts,
        total: totalRaw,
        level: level.toUpperCase(),
        explanation: `${daysOverdue} days overdue (+${overduePts}), ${child.missedSessions || 0} missed sessions (+${missedPts}), phone ${child.phoneActive ? 'reachable (+0)' : 'unreachable (+15)'} = ${totalRaw}/100 [${level.toUpperCase()}]`,
      };

      // Add to Due List if critical or past 56 days or explicitly added
      const isInDueList = child.isInDueList || level === 'critical' || daysOverdue >= 56;

      return {
        ...child,
        timeline: updatedTimeline,
        daysOverdue,
        daysSinceLastDose: daysOverdue,
        lastDoseDate: hasZeroDoses ? null : child.lastDoseDate,
        nextDueDoseName: hasZeroDoses ? 'BCG (at birth)' : nextDueDoseName,
        riskScore: totalRaw,
        riskLevel: level,
        isInDueList,
        scoreBreakdown,
      };
    });
  }, [childrenList, currentDate]);

  const selectedChild = useMemo(() => {
    return recalculatedChildren.find((c) => c.id === selectedChildId) || recalculatedChildren[0];
  }, [recalculatedChildren, selectedChildId]);

  const dueListCount = useMemo(() => {
    return recalculatedChildren.filter((c) => c.isInDueList).length;
  }, [recalculatedChildren]);

  // Helper to append SMS without duplicates
  const logSms = useCallback((recipient: string, message: string, type: 'breach' | 'ivr' | 'sync' | 'reminder') => {
    const newSms: SmsAlert = {
      id: 'sms-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      recipient,
      message,
      type,
    };
    setSmsAlerts((prev) => {
      // De-duplicate if exact message for same recipient already logged
      const exists = prev.some((s) => s.recipient === recipient && s.message === message);
      if (exists) return prev;
      return [newSms, ...prev.slice(0, 19)];
    });
  }, []);

  // Helper to append audit/sync log without duplicates
  const addAuditLog = useCallback((log: Omit<SyncLogEntry, 'id'>) => {
    const entry: SyncLogEntry = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setSyncLogs((prev) => {
      const exists = prev.some((l) => l.message === log.message && l.timestamp === log.timestamp);
      if (exists) return prev;
      return [entry, ...prev];
    });
  }, []);

  // Time manipulation with de-duplicated alerts (Requirement 4: at most one alert per child per threshold)
  const advanceTime = useCallback((days: number) => {
    setDaysAdvanced((prev) => {
      const nextDays = prev + days;

      // Check thresholds for each child
      recalculatedChildren.forEach((child) => {
        // Threshold 1: 1 week before (7 days before scheduled dose)
        const key7d = `alert-${child.id}-7d`;
        if (nextDays >= 7 && !firedAlertKeys.has(key7d)) {
          firedAlertKeys.add(key7d);
          logSms(
            `${child.phone} (${child.motherName})`,
            `(simulated) VaxEPI Gentle Reminder: 1 week remaining until scheduled immunization outreach session.`,
            'reminder'
          );
          addAuditLog({
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type: 'info',
            message: `(simulated) 1-Week Pre-Session Reminder dispatched for ${child.name}.`,
          });
        }

        // Threshold 2: Day 56 critical dropout boundary
        const key56d = `alert-${child.id}-56d`;
        if ((child.daysOverdue >= 56 || nextDays >= 56) && !firedAlertKeys.has(key56d)) {
          firedAlertKeys.add(key56d);
          logSms(
            `${child.phone} (${child.motherName})`,
            `(simulated) VaxEPI Overdue Alert: 56 days passed since scheduled dose. Critical dropout risk. Please visit health clinic.`,
            'ivr'
          );
          addAuditLog({
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type: 'alert',
            message: `(simulated) 56-Day Dropout Threshold reached for ${child.name}. Added to frontline Due List.`,
          });
        }
      });

      return nextDays;
    });
  }, [recalculatedChildren, firedAlertKeys, logSms, addAuditLog]);

  const resetTime = useCallback(() => {
    setDaysAdvanced(0);
    setFiredAlertKeys(new Set());
  }, []);

  // Online / Offline toggle
  const toggleOnline = useCallback((status?: boolean) => {
    setIsOnline((prev) => {
      const next = status !== undefined ? status : !prev;
      addAuditLog({
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: next ? 'info' : 'alert',
        message: next
          ? '(simulated) Network connection RESTORED. Edge node ready to synchronize.'
          : '(simulated) Network connection DROPPED. Field App operating in OFFLINE mode [IndexedDB (simulated) active].',
      });
      return next;
    });
  }, [addAuditLog]);

  // Reconnect and Sync with Conflict Resolution (using child timeline dates)
  const reconnectAndSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncProgress(15);

    addAuditLog({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'info',
      message: '(simulated) Connecting to DGHS Central VaxEPI Sync Gateway via 2G/EDGE...',
    });

    await new Promise((r) => setTimeout(r, 600));
    setSyncProgress(45);

    // Dynamic conflict timestamps matching child-1 (Tanvir Hasan) timeline (dose 3 on 2026-04-24 vs dose 4 recorded)
    const serverTime = '2026-04-23 16:30:00 GMT+6 (Stale Server Cache - Dose #3)';
    const pendantTime = '2026-04-24 10:14:22 GMT+6 (Physical Tag - Dose #4 Recorded)';

    await new Promise((r) => setTimeout(r, 700));
    setSyncProgress(80);

    addAuditLog({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'conflict',
      message: '(simulated) Conflict Detected: Central server record has older timestamp than wearable pendant token.',
      details: `Pendant vs Server timestamp: Server [${serverTime}] vs Physical Pendant [${pendantTime}]`,
      serverTimestamp: serverTime,
      pendantTimestamp: pendantTime,
    });

    await new Promise((r) => setTimeout(r, 500));
    setSyncProgress(100);

    addAuditLog({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'success',
      message: '(simulated) Resolution Applied: Cryptographic timestamp check -> PENDANT WINS. Central database updated from physical tag.',
    });

    // Clear queue in IndexedDB
    await clearQueueStorage();
    setPendingActions([]);
    setIsOnline(true);
    setIsSyncing(false);
    setSyncProgress(0);
  }, [addAuditLog]);

  // Field App: Register Newborn with UNIQUE BRN check & UNIQUE Pendant Tag ID
  const registerChild = useCallback(
    async (data: {
      name: string;
      motherName: string;
      brn: string;
      dob: string;
      phone: string;
      phoneActive: boolean;
      healthId: string;
      pendantToken: string;
    }): Promise<RegisterChildResult> => {
      const cleanBrn = data.brn.trim().toUpperCase();

      // Check unique BRN key (Requirement 1)
      const existing = childrenList.find((c) => c.brn.trim().toUpperCase() === cleanBrn);
      if (existing) {
        return {
          success: false,
          error: 'Duplicate record: BRN already exists',
        };
      }

      // Generate unique tag ID
      const existingTagIds = new Set(childrenList.map((c) => c.pendantTagId));
      let newTagNum = 120;
      while (existingTagIds.has(`SG-NFC-0${newTagNum}`)) {
        newTagNum++;
      }
      const newTagId = `SG-NFC-0${newTagNum}`;

      const newId = 'child-' + Date.now();
      const newRecord: ChildRecord = {
        id: newId,
        name: data.name,
        motherName: data.motherName,
        brn: cleanBrn,
        dob: data.dob || '2026-09-18',
        phone: '+880 1XXX-XXXXXX', // fictional masked format (Requirement 10)
        phoneActive: data.phoneActive,
        healthId: data.healthId,
        pendantToken: data.pendantToken,
        pendantTagId: newTagId,
        daysOverdue: 0,
        missedSessions: 0,
        lastDoseDate: null, // Newborn with 0 doses (Requirement 2)
        nextDueDoseName: 'BCG (at birth)',
        riskScore: 10,
        riskLevel: 'low',
        ivrTriggered: false,
        ivrTriggerDate: null,
        isInDueList: false,
        notes: 'Newly registered via Field App mobile client.',
        timeline: [
          {
            id: 'dose-reg-bcg',
            vaccine: 'BCG + bOPV-0',
            disease: 'Tuberculosis & Polio',
            targetAgeEn: 'At Birth',
            targetAgeBn: 'জন্মের সাথে সাথে',
            status: 'due',
            dateScheduled: '2026-09-19',
          },
          {
            id: 'dose-reg-p1',
            vaccine: 'Penta-1 + PCV-1 + bOPV-1',
            disease: 'DPT, HepB, Hib, Pneumo, Polio',
            targetAgeEn: '6 Weeks',
            targetAgeBn: '৬ সপ্তাহ',
            status: 'not-yet-due',
            dateScheduled: '2026-10-31',
          },
        ],
      };

      // If offline, queue in IndexedDB
      if (!isOnline) {
        const queuedItem: QueuedAction = {
          id: 'action-' + Date.now(),
          actionType: 'REGISTER_CHILD',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          childName: data.name,
          details: `Registered newborn ${data.name} (BRN: ${cleanBrn}) with Tag ${newTagId}`,
          payload: newRecord,
          status: 'pending',
        };
        const updatedQueue = [queuedItem, ...pendingActions];
        setPendingActions(updatedQueue);
        await saveQueueToStorage(updatedQueue);

        addAuditLog({
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'info',
          message: `(simulated) [OFFLINE QUEUE] Registered ${data.name}. Saved to IndexedDB (simulated).`,
        });
      } else {
        addAuditLog({
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'success',
          message: `(simulated) [ONLINE] Registered newborn ${data.name} (BRN: ${cleanBrn}). Synced to DGHS gateway.`,
        });
      }

      setChildrenList((prev) => [newRecord, ...prev]);
      setSelectedChildId(newId);
      await saveChild(newRecord);
      return { success: true, childId: newId };
    },
    [childrenList, isOnline, pendingActions, addAuditLog]
  );

  // Field App: Record a Dose
  const recordDose = useCallback(
    async (childId: string, doseId: string, batchNumber: string): Promise<boolean> => {
      const child = childrenList.find((c) => c.id === childId);
      if (!child) return false;

      const dose = child.timeline.find((d) => d.id === doseId);
      const doseName = dose ? dose.vaccine : 'Vaccine Dose';

      const updatedChildren = childrenList.map((c) => {
        if (c.id !== childId) return c;
        const updatedTimeline = c.timeline.map((d) => {
          if (d.id !== doseId) return d;
          return {
            ...d,
            status: 'done' as const,
            batchNumber,
            dateAdministered: currentDate,
            administeredBy: 'CHW Amena Khatun (Field Session)',
          };
        });
        return {
          ...c,
          daysOverdue: 0,
          lastDoseDate: currentDate,
          timeline: updatedTimeline,
        };
      });

      setChildrenList(updatedChildren);
      const updatedChild = updatedChildren.find((c) => c.id === childId);
      if (updatedChild) {
        saveChild(updatedChild);
      }

      // Offline handling
      if (!isOnline) {
        const queuedItem: QueuedAction = {
          id: 'action-' + Date.now(),
          actionType: 'RECORD_DOSE',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          childName: child.name,
          details: `Administered ${doseName} (Batch: ${batchNumber}) to ${child.name}. Cryptographic signature stored.`,
          payload: { childId, doseId, batchNumber, date: currentDate },
          status: 'pending',
        };
        const updatedQueue = [queuedItem, ...pendingActions];
        setPendingActions(updatedQueue);
        await saveQueueToStorage(updatedQueue);

        addAuditLog({
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'info',
          message: `(simulated) [OFFLINE QUEUE] Dose recorded for ${child.name} (${batchNumber}). Queued in IndexedDB (simulated).`,
        });
      } else {
        addAuditLog({
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          type: 'success',
          message: `(simulated) [ONLINE] Administered ${doseName} to ${child.name} (Batch: ${batchNumber}). Verified by VaxEPI.`,
        });
      }

      return true;
    },
    [childrenList, currentDate, isOnline, pendingActions, addAuditLog]
  );

  // Field App: Rewrite lost/damaged pendant tag (<60s target)
  const rewritePendantTag = useCallback(
    async (childId: string): Promise<{ success: boolean; newTagId: string; token: string; elapsedSec: number }> => {
      const child = childrenList.find((c) => c.id === childId);
      if (!child) return { success: false, newTagId: '', token: '', elapsedSec: 0 };

      // Simulated rewrite takes ~1.2 seconds
      await new Promise((r) => setTimeout(r, 1200));

      const newTagId = `SG-NFC-${Math.floor(1000 + Math.random() * 9000)}`;
      const newToken = `SHA256: ${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}9a01`;
      const elapsedSec = 14.4; // Well under 60 seconds

      setChildrenList((prev) =>
        prev.map((c) => {
          if (c.id !== childId) return c;
          return {
            ...c,
            pendantTagId: newTagId,
            pendantToken: newToken,
          };
        })
      );

      saveChild({ ...child, pendantTagId: newTagId, pendantToken: newToken });

      if (!isOnline) {
        const queuedItem: QueuedAction = {
          id: 'action-' + Date.now(),
          actionType: 'REWRITE_TAG',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          childName: child.name,
          details: `Re-minted replacement pendant tag ${newTagId} for ${child.name} in ${elapsedSec}s.`,
          payload: { childId, newTagId, newToken },
          status: 'pending',
        };
        const updatedQueue = [queuedItem, ...pendingActions];
        setPendingActions(updatedQueue);
        await saveQueueToStorage(updatedQueue);
      }

      addAuditLog({
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'success',
        message: `(simulated) Replacement pendant ${newTagId} bound to ${child.name} in ${elapsedSec} seconds (benchmark <60s).`,
      });

      return { success: true, newTagId, token: newToken, elapsedSec };
    },
    [childrenList, isOnline, pendingActions, addAuditLog]
  );

  // Manager: Simulate cold chain breach (11.4°C)
  const triggerColdChainBreach = useCallback(() => {
    setIsColdChainBreached(true);
    setIsColdChainFrozen(false);
    setColdBoxes((prev) =>
      prev.map((b) => (b.id === 'box-1' ? { ...b, temp: 11.4, status: 'breach' as const } : b))
    );

    logSms(
      'Dr. A. Rahman (Sunamganj Civil Surgeon) & Field Tech',
      '(simulated) CRITICAL COLD-CHAIN BREACH: Sunamganj Haor Carrier #04 reached 11.4°C (Safe limit: 2°C–8°C). Immediate ice pack replacement required.',
      'breach'
    );

    addAuditLog({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'alert',
      message: '(simulated) CRITICAL ALERT: Sunamganj Haor Carrier #04 breached safe temperature threshold (11.4°C). SMS dispatched automatically.',
    });
  }, [addAuditLog, logSms]);

  // Manager: Simulate cold chain freeze (0.5°C) (Requirement 9)
  const triggerColdChainFreeze = useCallback(() => {
    setIsColdChainFrozen(true);
    setIsColdChainBreached(false);
    setColdBoxes((prev) =>
      prev.map((b) => (b.id === 'box-1' ? { ...b, temp: 0.5, status: 'freeze' as const } : b))
    );

    logSms(
      'Dr. A. Rahman (Sunamganj Civil Surgeon) & Cold-Chain Tech',
      '(simulated) FREEZE WARNING: Sunamganj Haor Carrier #04 reached 0.5°C (Freezing danger: vaccines degrade below 2.0°C). Check conditioning.',
      'breach'
    );

    addAuditLog({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'alert',
      message: '(simulated) FREEZE ALERT: Sunamganj Haor Carrier #04 dropped to 0.5°C (Risk of vaccine freeze destruction).',
    });
  }, [addAuditLog, logSms]);

  const restoreColdChain = useCallback(() => {
    setIsColdChainBreached(false);
    setIsColdChainFrozen(false);
    setColdBoxes((prev) =>
      prev.map((b) => (b.id === 'box-1' ? { ...b, temp: 4.2, status: 'normal' as const } : b))
    );

    addAuditLog({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'info',
      message: '(simulated) Sunamganj Haor Carrier #04 restored to safe corridor: 4.2°C.',
    });
  }, [addAuditLog]);

  // IVR Voice Call Trigger (Requirement 5: "IVR Sent" appears only after Dispatch IVR is pressed)
  const triggerIVRCall = useCallback(
    (childId: string) => {
      const child = childrenList.find((c) => c.id === childId);
      if (!child) return;

      logSms(
        `${child.phone} (${child.motherName})`,
        `(simulated) IVR Call Dispatched: Automated maternal audio notice sent in Bangla regarding ${child.name}'s scheduled dose.`,
        'ivr'
      );

      setChildrenList((prev) =>
        prev.map((c) => {
          if (c.id !== childId) return c;
          return {
            ...c,
            ivrTriggered: true, // Only set here!
            ivrTriggerDate: currentDate,
            isInDueList: true,
          };
        })
      );

      addAuditLog({
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'alert',
        message: `(simulated) IVR Voice Notification dispatched for ${child.name}. Added to frontline Due List.`,
      });
    },
    [childrenList, currentDate, addAuditLog, logSms]
  );

  // Reset Demo to initial state (Requirement 1: clear duplicates on Reset Demo, start date offset at 0)
  const resetDemo = useCallback(async () => {
    clearQueueStorage();
    await resetDatabaseToSeed();
    setDaysAdvanced(0);
    setIsOnline(true);
    setPendingActions([]);
    setIsSyncing(false);
    setSyncProgress(0);
    const reloaded = await getAllChildren();
    setChildrenList(reloaded.length > 0 ? reloaded : INITIAL_CHILDREN);
    setSelectedChildId('child-1');
    setColdBoxes(INITIAL_COLD_BOXES);
    setIsColdChainBreached(false);
    setIsColdChainFrozen(false);
    setSyncLogs(INITIAL_LOGS);
    setSmsAlerts([]);
    setFiredAlertKeys(new Set());
    setActiveTab('field-app');
    setActiveSubViewPhone('scan');
    setGuidedTourStep(null);
  }, []);

  // Guided Tour handlers
  const startGuidedTour = useCallback(() => {
    setGuidedTourStep(1);
    setActiveTab('field-app');
    setActiveSubViewPhone('register');
  }, []);

  const nextGuidedTourStep = useCallback(() => {
    setGuidedTourStep((prev) => {
      if (prev === null) return 1;
      if (prev >= 5) return null;
      const next = prev + 1;
      if (next === 1) {
        setActiveTab('field-app');
        setActiveSubViewPhone('register');
      } else if (next === 2) {
        setActiveTab('field-app');
        setActiveSubViewPhone('scan');
      } else if (next === 3) {
        setActiveTab('offline-sync');
      } else if (next === 4) {
        setActiveTab('offline-sync');
      } else if (next === 5) {
        setActiveTab('manager');
      }
      return next;
    });
  }, []);

  const prevGuidedTourStep = useCallback(() => {
    setGuidedTourStep((prev) => {
      if (prev === null || prev <= 1) return null;
      const next = prev - 1;
      if (next === 1) {
        setActiveTab('field-app');
        setActiveSubViewPhone('register');
      } else if (next === 2) {
        setActiveTab('field-app');
        setActiveSubViewPhone('scan');
      } else if (next === 3) {
        setActiveTab('offline-sync');
      } else if (next === 4) {
        setActiveTab('offline-sync');
      } else if (next === 5) {
        setActiveTab('manager');
      }
      return next;
    });
  }, []);

  const closeGuidedTour = useCallback(() => {
    setGuidedTourStep(null);
  }, []);

  // Computed metrics for Manager Dashboard
  const metrics = useMemo(() => {
    const total = recalculatedChildren.length;
    const fvcCount = recalculatedChildren.filter(
      (c) => c.timeline.filter((d) => d.status === 'due' || d.status === 'overdue').length === 0
    ).length;

    const criticalCount = recalculatedChildren.filter((c) => c.riskLevel === 'critical').length;
    const dropoutPct = total > 0 ? Math.round((criticalCount / total) * 100) : 0;
    const fvcPct = total > 0 ? Math.round((fvcCount / total) * 100) : 0;

    const breachedCount = coldBoxes.filter((b) => b.status === 'breach').length;
    const coldChainPct = Math.round(((coldBoxes.length - breachedCount) / coldBoxes.length) * 100);

    return {
      totalChildren: total,
      fullyVaccinatedCount: fvcCount,
      fullyVaccinatedPct: fvcPct,
      dropoutCount: criticalCount,
      dropoutRatePct: dropoutPct,
      criticalRiskCount: criticalCount,
      coldChainIntegrityPct: coldChainPct,
    };
  }, [recalculatedChildren, coldBoxes]);

  return (
    <PrototypeContext.Provider
      value={{
        currentDate,
        daysAdvanced,
        isOnline,
        pendingActions,
        isSyncing,
        syncProgress,
        children: recalculatedChildren,
        selectedChildId,
        selectedChild,
        coldBoxes,
        isColdChainBreached,
        isColdChainFrozen,
        syncLogs,
        smsAlerts,
        dueListCount,
        isAdminConsoleOpen,
        setIsAdminConsoleOpen,
        openAdminConsole,
        closeAdminConsole,
        toggleAdminConsole,
        isPiiMasked,
        togglePiiMask,
        reloadFromDatabase,
        activeTab,
        setActiveTab,
        activeSubViewPhone,
        setActiveSubViewPhone,
        guidedTourStep,
        setGuidedTourStep,
        selectChild: setSelectedChildId,
        toggleOnline,
        advanceTime,
        resetTime,
        reconnectAndSync,
        registerChild,
        recordDose,
        rewritePendantTag,
        triggerColdChainBreach,
        triggerColdChainFreeze,
        restoreColdChain,
        triggerIVRCall,
        resetDemo,
        startGuidedTour,
        nextGuidedTourStep,
        prevGuidedTourStep,
        closeGuidedTour,
        metrics,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
};

export const usePrototype = () => {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error('usePrototype must be used within a PrototypeProvider');
  }
  return context;
};
