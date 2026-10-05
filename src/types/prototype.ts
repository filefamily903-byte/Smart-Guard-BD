export interface VaccineDoseRecord {
  id: string;
  vaccine: string;
  disease: string;
  targetAgeEn: string;
  targetAgeBn: string;
  status: 'done' | 'due' | 'overdue' | 'not-yet-due';
  dateAdministered?: string;
  dateScheduled: string;
  batchNumber?: string;
  administeredBy?: string;
}

export interface ChildRecord {
  id: string;
  name: string;
  motherName: string;
  brn: string;
  dob: string;
  phone: string;
  phoneActive: boolean;
  healthId: string;
  pendantToken: string;
  pendantTagId: string;
  timeline: VaccineDoseRecord[];
  riskScore: number; // 0 - 100
  riskLevel: 'low' | 'moderate' | 'critical';
  missedSessions: number;
  daysOverdue: number;
  daysSinceLastDose?: number;
  lastDoseDate?: string | null;
  nextDueDoseName?: string;
  ivrTriggered: boolean;
  ivrTriggerDate: string | null;
  isInDueList: boolean;
  clinicTagged?: boolean;
  clinicName?: string;
  notes?: string;
  scoreBreakdown?: {
    daysOverdue: number;
    overduePts: number;
    missedSessions: number;
    missedPts: number;
    phoneActive: boolean;
    phonePts: number;
    total: number;
    level: string;
    explanation: string;
  };
}

export type AdminRole = 'Super Admin' | 'District Health Manager' | 'Private Clinic Admin' | 'Auditor';

export interface PendantRecord {
  tagId: string; // SG-NFC-####
  childId: string;
  childName: string;
  status: 'active' | 'lost' | 'replaced';
  assignedDate: string;
  lastScanDate: string;
  tokenHash: string;
}

export interface FlatDoseRecord {
  id: string;
  childId: string;
  childName: string;
  vaccine: string;
  disease: string;
  targetAgeEn: string;
  targetAgeBn: string;
  status: 'done' | 'due' | 'overdue' | 'not-yet-due';
  dateScheduled: string;
  dateAdministered?: string;
  batchNumber?: string;
  administeredBy?: string;
}

export interface IvrCallLog {
  id: string;
  childId: string;
  childName: string;
  motherName: string;
  phone: string;
  timestamp: string;
  status: 'completed' | 'queued' | 'in-progress';
  transcriptBn: string;
  dialect: string;
  durationSec: number;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  who: string;
  role: AdminRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVEAL_PII' | 'IMPORT' | 'EXPORT' | 'RESET' | 'REWRITE_TAG' | 'RECORD_DOSE' | 'SYNC' | 'BREACH_SIM' | 'FREEZE_SIM';
  target: string;
  before?: any;
  after?: any;
  details: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  clinic?: string;
  district?: string;
  demoPin: string;
}

export interface QueuedAction {
  id: string;
  actionType: 'REGISTER_CHILD' | 'RECORD_DOSE' | 'REWRITE_TAG';
  timestamp: string;
  childName: string;
  details: string;
  payload: any;
  status: 'pending' | 'synced';
}

export interface ColdBox {
  id: string;
  name: string;
  location: string;
  district: string;
  lat: number;
  lng: number;
  mapX: number; // % in svg
  mapY: number; // % in svg
  temp: number;
  battery: number;
  status: 'normal' | 'warning' | 'breach' | 'freeze';
  lastPing: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'conflict' | 'alert';
  message: string;
  details?: string;
  serverTimestamp?: string;
  pendantTimestamp?: string;
}

export interface SmsAlert {
  id: string;
  timestamp: string;
  recipient: string;
  message: string;
  type: 'breach' | 'ivr' | 'sync' | 'reminder';
}
