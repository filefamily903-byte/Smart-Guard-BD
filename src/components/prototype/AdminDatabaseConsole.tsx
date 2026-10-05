import React, { useState, useEffect, useMemo } from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import {
  AdminRole,
  ChildRecord,
  PendantRecord,
  FlatDoseRecord,
  AuditLogRecord,
  ColdBox,
  QueuedAction,
} from '../../types/prototype';
import {
  getAllChildren,
  saveChild,
  deleteChild,
  getAllPendants,
  savePendant,
  getAllDoses,
  saveDoseRecord,
  getAllSyncQueue,
  clearSyncQueue,
  getAllAuditLogs,
  logAudit,
  getAllColdBoxes,
  saveColdBoxes,
  resetDatabaseToSeed,
  exportAllDataJSON,
  exportStoreCSV,
  importDataJSON,
  checkIntegrity,
  simulateCorruption,
  repairIntegrity,
  INITIAL_USERS,
  StoreName,
  STORES,
} from '../../utils/demoDatabase';
import {
  Database,
  X,
  Shield,
  Key,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  Users,
  Thermometer,
  Activity,
  Search,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'children'
  | 'pendants'
  | 'doses'
  | 'syncQueue'
  | 'coldBoxes'
  | 'auditLog'
  | 'tools';

export const AdminDatabaseConsole: React.FC = () => {
  const {
    isAdminConsoleOpen,
    closeAdminConsole,
    currentDate,
    reconnectAndSync,
    triggerColdChainBreach,
    triggerColdChainFreeze,
    restoreColdChain,
    isColdChainBreached,
    isColdChainFrozen,
  } = usePrototype();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [currentRole, setCurrentRole] = useState<AdminRole>('Super Admin');
  const [pinInput, setPinInput] = useState<string>('1234');
  const [isRoleUnlocked, setIsRoleUnlocked] = useState<boolean>(true);
  const [isPiiRevealed, setIsPiiRevealed] = useState<boolean>(false);

  // Local state mirrored from DB
  const [childrenList, setChildrenList] = useState<ChildRecord[]>([]);
  const [pendantsList, setPendantsList] = useState<PendantRecord[]>([]);
  const [dosesList, setDosesList] = useState<FlatDoseRecord[]>([]);
  const [queueList, setQueueList] = useState<QueuedAction[]>([]);
  const [boxesList, setBoxesList] = useState<ColdBox[]>([]);
  const [auditList, setAuditList] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter & Search states
  const [childSearch, setChildSearch] = useState<string>('');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');
  const [integrityResult, setIntegrityResult] = useState<{
    valid: boolean;
    issues: string[];
    counts: Record<string, number>;
  } | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editChild, setEditChild] = useState<ChildRecord | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [jsonImportText, setJsonImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // New Child Form Data
  const [newChildData, setNewChildData] = useState({
    name: '',
    motherName: '',
    brn: '',
    dob: '2026-09-18',
    phone: '+880 1712-345678',
    phoneActive: true,
    tagId: '',
  });

  // Current active user object based on role
  const currentUser = useMemo(() => {
    return INITIAL_USERS.find((u) => u.role === currentRole) || INITIAL_USERS[0];
  }, [currentRole]);

  // Load all records from IndexedDB
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [c, p, d, q, b, a] = await Promise.all([
        getAllChildren(),
        getAllPendants(),
        getAllDoses(),
        getAllSyncQueue(),
        getAllColdBoxes(),
        getAllAuditLogs(),
      ]);
      setChildrenList(c);
      setPendantsList(p);
      setDosesList(d);
      setQueueList(q);
      setBoxesList(b);
      setAuditList(a);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminConsoleOpen) {
      refreshData();
      setIsPiiRevealed(false); // Mask by default
    }
  }, [isAdminConsoleOpen]);

  // PII reveal logger
  const handleTogglePii = async () => {
    const nextState = !isPiiRevealed;
    setIsPiiRevealed(nextState);
    if (nextState) {
      await logAudit({
        who: currentUser.name,
        role: currentRole,
        action: 'REVEAL_PII',
        target: 'PII Unmasking Event',
        details: `${currentUser.name} (${currentRole}) unmasked patient BRN and contact telephone records.`,
      });
      refreshData();
    }
  };

  // Role switch handler
  const handleRoleChange = (newRole: AdminRole) => {
    if (pinInput !== '1234') {
      alert('Invalid Demo PIN. Use default: 1234');
      return;
    }
    setCurrentRole(newRole);
    logAudit({
      who: currentUser.name,
      role: newRole,
      action: 'UPDATE',
      target: 'RBAC Switch',
      details: `Session authenticated as role: ${newRole} (User: ${currentUser.name})`,
    });
  };

  // RBAC Filtered Children
  const visibleChildren = useMemo(() => {
    let list = childrenList;

    // Private Clinic Admin only sees clinicTagged records
    if (currentRole === 'Private Clinic Admin') {
      list = list.filter((c) => c.clinicTagged || c.clinicName?.includes('Green Crescent'));
    }

    if (!childSearch.trim()) return list;
    const q = childSearch.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.motherName.toLowerCase().includes(q) ||
        c.brn.toLowerCase().includes(q) ||
        c.pendantTagId.toLowerCase().includes(q)
    );
  }, [childrenList, currentRole, childSearch]);

  // Save new child
  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newChildData.name.trim() || !newChildData.brn.trim() || !newChildData.motherName.trim()) {
      setFormError('Please fill in Name, Mother Name, and BRN.');
      return;
    }

    const cleanBrn = newChildData.brn.trim().toUpperCase();
    const tagId = newChildData.tagId.trim() || `SG-NFC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: ChildRecord = {
      id: 'child-' + Date.now(),
      name: newChildData.name.trim(),
      motherName: newChildData.motherName.trim(),
      brn: cleanBrn,
      dob: newChildData.dob,
      phone: newChildData.phone,
      phoneActive: newChildData.phoneActive,
      healthId: 'HID-' + Math.floor(100000 + Math.random() * 900000),
      pendantToken: `SHA256: ${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      pendantTagId: tagId,
      daysOverdue: 0,
      missedSessions: 0,
      lastDoseDate: null,
      nextDueDoseName: 'BCG (at birth)',
      riskScore: 10,
      riskLevel: 'low',
      ivrTriggered: false,
      ivrTriggerDate: null,
      isInDueList: false,
      clinicTagged: currentRole === 'Private Clinic Admin',
      clinicName: currentRole === 'Private Clinic Admin' ? currentUser.clinic : 'Upazila Health Complex (Public)',
      notes: 'Registered through Admin Database Console.',
      timeline: [
        {
          id: 'dose-admin-' + Date.now() + '-bcg',
          vaccine: 'BCG + bOPV-0',
          disease: 'Tuberculosis & Polio',
          targetAgeEn: 'At Birth',
          targetAgeBn: 'জন্মের সাথে সাথে',
          status: 'due',
          dateScheduled: currentDate,
        },
        {
          id: 'dose-admin-' + Date.now() + '-p1',
          vaccine: 'Penta-1 + PCV-1 + bOPV-1',
          disease: 'DPT, HepB, Hib, Pneumo, Polio',
          targetAgeEn: '6 Weeks',
          targetAgeBn: '৬ সপ্তাহ',
          status: 'not-yet-due',
          dateScheduled: '2026-10-31',
        },
      ],
    };

    const result = await saveChild(newRecord, { name: currentUser.name, role: currentRole });
    if (!result.success) {
      setFormError(result.error || 'Failed to save record.');
      return;
    }

    setIsAddModalOpen(false);
    setNewChildData({
      name: '',
      motherName: '',
      brn: '',
      dob: '2026-09-18',
      phone: '+880 1712-345678',
      phoneActive: true,
      tagId: '',
    });
    await refreshData();
  };

  // Delete Child (Guarded by RBAC)
  const handleDeleteChild = async (childId: string, childName: string) => {
    if (currentRole === 'Auditor' || currentRole === 'District Health Manager') {
      alert(`Permission Denied: ${currentRole} role cannot delete child records.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${childName}? This cascade deletes pendant and doses.`)) {
      return;
    }

    const res = await deleteChild(childId, { name: currentUser.name, role: currentRole });
    if (!res.success) {
      alert(res.error || 'Delete failed');
      return;
    }
    await refreshData();
  };

  // Run Integrity Check
  const handleCheckIntegrity = async () => {
    const res = await checkIntegrity();
    setIntegrityResult(res);
  };

  // Repair Database
  const handleRepairDB = async () => {
    const res = await repairIntegrity();
    alert(res.message);
    await refreshData();
    handleCheckIntegrity();
  };

  // Simulate Corruption
  const handleSimulateCorruption = async () => {
    await simulateCorruption();
    await refreshData();
    await handleCheckIntegrity();
    alert('Simulated orphan dose and orphan pendant injected into database. Click "Repair Database" to test auto-clean.');
  };

  // Export JSON
  const handleExportJSON = async () => {
    const jsonStr = await exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartguard_demo_export_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    await logAudit({
      who: currentUser.name,
      role: currentRole,
      action: 'EXPORT',
      target: 'smartguard_demo',
      details: 'Full JSON backup export generated and downloaded.',
    });
    refreshData();
  };

  // Export CSV
  const handleExportCSV = async (store: StoreName) => {
    const csvStr = await exportStoreCSV(store);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartguard_${store}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = async () => {
    if (!jsonImportText.trim()) return;
    const res = await importDataJSON(jsonImportText, { name: currentUser.name, role: currentRole });
    setImportStatus(res);
    if (res.success) {
      await refreshData();
    }
  };

  // Reset Demo Database
  const handleResetDB = async () => {
    if (!window.confirm('Reset demo database to original seed state? All changes will be re-initialized.')) {
      return;
    }
    await resetDatabaseToSeed({ name: currentUser.name, role: currentRole });
    await refreshData();
    alert('Demo database reset to original 4 children and seed records.');
  };

  if (!isAdminConsoleOpen) return null;

  return (
    <div
      id="admin-db-console-overlay"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-slate-100 backdrop-blur-md overflow-hidden font-sans"
    >
      {/* Top Banner: Mandatory Disclaimer */}
      <div
        id="admin-banner-disclaimer"
        className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Demo admin console:</strong> Data lives in this browser only (IndexedDB: <code className="font-mono text-amber-300">smartguard_demo</code>). Not connected to VaxEPI, DHIS2, or any real health system.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-amber-300/80 hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-amber-900/60 rounded border border-amber-700/50 font-mono">Esc</kbd> or <kbd className="px-1.5 py-0.5 bg-amber-900/60 rounded border border-amber-700/50 font-mono">Ctrl+L</kbd> to close</span>
          <button
            id="admin-console-close-btn"
            onClick={closeAdminConsole}
            className="p-1 rounded hover:bg-amber-500/20 text-amber-200 transition-colors"
            title="Close Admin Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Console Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">SmartGuard BD Admin Database Console</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
                IndexedDB: smartguard_demo
              </span>
            </div>
            <p className="text-xs text-slate-400">Direct query, schema validation, audit trails & cross-tab synchronization</p>
          </div>
        </div>

        {/* RBAC Role Switcher & Privacy Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* PII Toggle */}
          <button
            id="admin-pii-toggle-btn"
            onClick={handleTogglePii}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isPiiRevealed
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle PII Masking (Audited)"
          >
            {isPiiRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPiiRevealed ? 'PII Unmasked (Logged)' : 'Mask PII (Default)'}</span>
          </button>

          {/* Role Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs text-slate-400">Role:</span>
            <select
              id="admin-role-selector"
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Super Admin" className="bg-slate-900 text-white">Super Admin (Dr. Nasreen Akhtar)</option>
              <option value="District Health Manager" className="bg-slate-900 text-white">District Health Manager (Dr. A. Rahman)</option>
              <option value="Private Clinic Admin" className="bg-slate-900 text-white">Private Clinic Admin (Shahnaz Parveen)</option>
              <option value="Auditor" className="bg-slate-900 text-white">Auditor (M. Kabir Hossain - Read Only)</option>
            </select>
          </div>

          <button
            id="admin-refresh-db-btn"
            onClick={refreshData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Refresh database view"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview', icon: Activity, count: null },
          { id: 'children', label: 'Children (Patients)', icon: Users, count: childrenList.length },
          { id: 'pendants', label: 'Pendants', icon: Radio, count: pendantsList.length },
          { id: 'doses', label: 'Vaccine Doses', icon: CheckCircle2, count: dosesList.length },
          { id: 'syncQueue', label: 'Sync Queue', icon: Clock, count: queueList.length },
          { id: 'coldBoxes', label: 'Cold Chain', icon: Thermometer, count: boxesList.length },
          { id: 'auditLog', label: 'Audit Trail', icon: FileText, count: auditList.length },
          { id: 'tools', label: 'Data Tools', icon: Layers, count: null },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`admin-tab-${t.id}`}
              onClick={() => setActiveTab(t.id as AdminTab)}
              className={`px-3.5 py-2.5 flex items-center gap-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-teal-400 text-teal-300 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Console Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* System Status Banner */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h2 className="text-sm font-semibold text-white">IndexedDB Storage Active & Synchronized</h2>
                  <p className="text-xs text-slate-400">
                    Active Profile: <strong className="text-teal-300">{currentUser.name}</strong> ({currentRole})
                    {currentRole === 'Private Clinic Admin' && ' - Viewing Clinic-Tagged Records Only'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button
                  id="admin-overview-quick-integrity"
                  onClick={() => {
                    setActiveTab('tools');
                    handleCheckIntegrity();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verify Foreign Keys</span>
                </button>
                <button
                  id="admin-overview-quick-reset"
                  onClick={handleResetDB}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Children', val: childrenList.length, icon: Users, color: 'text-teal-400' },
                { label: 'Pendants', val: pendantsList.length, icon: Radio, color: 'text-cyan-400' },
                { label: 'Doses Recorded', val: dosesList.filter((d) => d.status === 'done').length, icon: CheckCircle2, color: 'text-emerald-400' },
                { label: 'Pending Queue', val: queueList.length, icon: Clock, color: queueList.length > 0 ? 'text-amber-400' : 'text-slate-400' },
                { label: 'Cold Boxes', val: boxesList.length, icon: Thermometer, color: 'text-blue-400' },
                { label: 'Audit Records', val: auditList.length, icon: FileText, color: 'text-purple-400' },
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span>{kpi.label}</span>
                      <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                    </div>
                    <span className="text-2xl font-mono font-bold text-white">{kpi.val}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Summary Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Audit Actions */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Recent Audit Events</h3>
                  <button onClick={() => setActiveTab('auditLog')} className="text-xs text-teal-400 hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {auditList.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-teal-300">
                            {log.action}
                          </span>
                          <span className="font-medium text-slate-200">{log.target}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{log.details}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Store Summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                  Database Object Stores (smartguard_demo)
                </h3>
                <div className="space-y-1.5 text-xs">
                  {STORES.map((s) => (
                    <div key={s} className="px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono text-slate-300">{s}</span>
                      </div>
                      <button
                        onClick={() => handleExportCSV(s)}
                        className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: CHILDREN CRUD */}
        {/* ================================================================= */}
        {activeTab === 'children' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  id="admin-child-search-input"
                  type="text"
                  placeholder="Search by Child Name, Mother, BRN, or Tag ID..."
                  value={childSearch}
                  onChange={(e) => setChildSearch(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                {currentRole !== 'Auditor' && (
                  <button
                    id="admin-add-child-btn"
                    onClick={() => {
                      setFormError('');
                      setIsAddModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register New Child</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Child Name & Mother</th>
                      <th className="px-4 py-3">BRN (Unique Key)</th>
                      <th className="px-4 py-3">Pendant Tag</th>
                      <th className="px-4 py-3">Clinic / Facility</th>
                      <th className="px-4 py-3">Next Due</th>
                      <th className="px-4 py-3">Risk Level</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {visibleChildren.map((c) => {
                      const displayBrn = isPiiRevealed
                        ? c.brn
                        : c.brn.length > 8
                        ? c.brn.substring(0, 4) + '-XXXX-XXXX'
                        : 'XXXX-XXXX';
                      const displayPhone = isPiiRevealed ? c.phone : '+880 1XXX-XXXXXX';

                      return (
                        <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{c.name}</div>
                            <div className="text-[11px] text-slate-400">Mother: {c.motherName} ({displayPhone})</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-teal-300">{displayBrn}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800 text-cyan-300 border border-slate-700">
                              {c.pendantTagId}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {c.clinicName || 'Public Complex'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-200">{c.nextDueDoseName || 'BCG'}</span>
                            <div className="text-[10px] text-slate-500">{c.daysOverdue}d overdue</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                c.riskLevel === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : c.riskLevel === 'moderate'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {c.riskLevel} ({c.riskScore})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {currentRole !== 'Auditor' && currentRole !== 'District Health Manager' && (
                                <button
                                  onClick={() => handleDeleteChild(c.id, c.name)}
                                  className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                                  title="Delete Child Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {visibleChildren.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                          No matching child records found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: PENDANTS */}
        {/* ================================================================= */}
        {activeTab === 'pendants' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <strong>Pendant Tags Repository:</strong> Physical wearable NFC tokens with cryptographic key pairs. Tag IDs must be unique.
              </div>
              <span className="font-mono text-cyan-300">{pendantsList.length} Active Tags</span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Tag ID (Primary Key)</th>
                    <th className="px-4 py-3">Assigned Patient</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned Date</th>
                    <th className="px-4 py-3">Token Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pendantsList.map((p) => (
                    <tr key={p.tagId} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">{p.tagId}</td>
                      <td className="px-4 py-3 text-white font-medium">{p.childName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{p.assignedDate}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{p.tokenHash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: DOSES */}
        {/* ================================================================= */}
        {activeTab === 'doses' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <strong>Vaccine Doses Store:</strong> Central and frontline dose administration schedules.
              </div>
              <span className="font-mono text-emerald-300">{dosesList.length} Total Doses Recorded/Scheduled</span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Child Name</th>
                    <th className="px-4 py-3">Vaccine</th>
                    <th className="px-4 py-3">Target Age</th>
                    <th className="px-4 py-3">Scheduled Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Batch Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dosesList.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-white">{d.childName}</td>
                      <td className="px-4 py-3 text-teal-300">{d.vaccine}</td>
                      <td className="px-4 py-3 text-slate-400">{d.targetAgeEn} ({d.targetAgeBn})</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{d.dateScheduled}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            d.status === 'done'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : d.status === 'overdue'
                              ? 'bg-rose-500/20 text-rose-300'
                              : d.status === 'due'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{d.batchNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: SYNC QUEUE & CONFLICTS */}
        {/* ================================================================= */}
        {activeTab === 'syncQueue' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Offline Action Queue (IndexedDB: syncQueue)</h3>
                <p className="text-xs text-slate-400">
                  Rule: <strong>Most recent authenticated timestamp wins</strong>. Cryptographic signatures guarantee authenticity.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await reconnectAndSync();
                    await refreshData();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Execute Sync & Conflict Check</span>
                </button>
                <button
                  onClick={async () => {
                    await clearSyncQueue({ name: currentUser.name, role: currentRole });
                    await refreshData();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Target Patient</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queueList.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-slate-400">{q.timestamp}</td>
                      <td className="px-4 py-3 font-semibold text-teal-300">{q.actionType}</td>
                      <td className="px-4 py-3 text-white">{q.childName}</td>
                      <td className="px-4 py-3 text-slate-300">{q.details}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {queueList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">
                        Queue is clean. No offline actions pending synchronization.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: COLD BOXES */}
        {/* ================================================================= */}
        {activeTab === 'coldBoxes' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Cold Chain Carriers Telemetry</h3>
                <p className="text-xs text-slate-400">Safe corridor: 2.0°C – 8.0°C. Breaches trigger automated alerts.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerColdChainBreach();
                    refreshData();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Simulate Breach (11.4°C)</span>
                </button>
                <button
                  onClick={() => {
                    triggerColdChainFreeze();
                    refreshData();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Simulate Freeze (0.5°C)</span>
                </button>
                <button
                  onClick={() => {
                    restoreColdChain();
                    refreshData();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Restore Safe Corridor</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boxesList.map((box) => (
                <div key={box.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{box.name}</h4>
                    <p className="text-xs text-slate-400">{box.location}, {box.district}</p>
                    <div className="text-[11px] text-slate-500 mt-1">Last ping: {box.lastPing}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-mono font-bold ${
                        box.status === 'breach'
                          ? 'text-rose-400 animate-pulse'
                          : box.status === 'freeze'
                          ? 'text-blue-400 animate-pulse'
                          : 'text-emerald-400'
                      }`}
                    >
                      {box.temp}°C
                    </span>
                    <div className="text-[10px] text-slate-400">Battery: {box.battery}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: AUDIT LOG */}
        {/* ================================================================= */}
        {activeTab === 'auditLog' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-semibold text-white">Immutable Audit Log</span>
                <span className="text-xs text-slate-500">({auditList.length} events recorded)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter:</span>
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="bg-slate-950 text-xs text-white px-2 py-1 rounded border border-slate-800"
                >
                  <option value="ALL">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="REVEAL_PII">REVEAL_PII</option>
                  <option value="RESET">RESET</option>
                  <option value="RECORD_DOSE">RECORD_DOSE</option>
                  <option value="SYNC">SYNC</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User & Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditList
                    .filter((a) => auditFilter === 'ALL' || a.action === auditFilter)
                    .map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{a.timestamp}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-slate-200">{a.who}</span>
                          <span className="text-slate-500 ml-1">({a.role})</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              a.action === 'DELETE'
                                ? 'bg-rose-500/20 text-rose-300'
                                : a.action === 'CREATE'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : a.action === 'REVEAL_PII'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-teal-300'
                            }`}
                          >
                            {a.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-sans">{a.target}</td>
                        <td className="px-4 py-3 text-slate-300 font-sans">{a.details}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: DATA TOOLS */}
        {/* ================================================================= */}
        {activeTab === 'tools' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Integrity Check & Repair Card */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Database Integrity Verifier & Repair Tool</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Validates unique BRN keys, unique Pendant Tag IDs, foreign-key links (dose -&gt; child, pendant -&gt; child), and cleans orphaned records.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="admin-tools-verify-btn"
                  onClick={handleCheckIntegrity}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Run Integrity Verification</span>
                </button>
                <button
                  id="admin-tools-repair-btn"
                  onClick={handleRepairDB}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Repair Database (Auto-prune Orphans)</span>
                </button>
                <button
                  id="admin-tools-corrupt-btn"
                  onClick={handleSimulateCorruption}
                  className="px-4 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Inject Test Orphan (Test Repair)</span>
                </button>
              </div>

              {integrityResult && (
                <div className={`mt-4 p-4 rounded-xl border text-xs ${integrityResult.valid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'}`}>
                  <div className="font-bold flex items-center gap-2 mb-1">
                    {integrityResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    <span>{integrityResult.valid ? 'Integrity Verification Passed: 0 Anomalies Detected' : `${integrityResult.issues.length} Integrity Issue(s) Detected:`}</span>
                  </div>
                  {integrityResult.issues.length > 0 && (
                    <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-[11px]">
                      {integrityResult.issues.map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 text-[11px] text-slate-400 font-mono">
                    Stores Verified: {integrityResult.counts.children} children, {integrityResult.counts.pendants} pendants, {integrityResult.counts.doses} doses.
                  </div>
                </div>
              )}
            </div>

            {/* Export & Backup Card */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Export & Backup</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Export the entire IndexedDB database into a validated JSON backup format, or export individual stores as CSV.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="admin-tools-export-json-btn"
                  onClick={handleExportJSON}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full JSON Backup</span>
                </button>
                {STORES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleExportCSV(s)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>{s}.csv</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Import JSON Card */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Import JSON Payload</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Paste JSON containing a children array. The import tool validates schema and rejects duplicate BRNs or Tag IDs.
              </p>
              <textarea
                value={jsonImportText}
                onChange={(e) => setJsonImportText(e.target.value)}
                placeholder='{"children": [{"id": "child-test", "name": "...", "brn": "...", "pendantTagId": "SG-NFC-..."}]}'
                className="w-full h-28 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
              <div className="flex items-center justify-between mt-3">
                <button
                  id="admin-tools-import-btn"
                  onClick={handleImportJSON}
                  disabled={!jsonImportText.trim()}
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Validate & Import</span>
                </button>
                {importStatus && (
                  <span className={`text-xs ${importStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {importStatus.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Add New Child */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Register Child Record</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateChild} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Child Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Siddiqa"
                  value={newChildData.name}
                  onChange={(e) => setNewChildData({ ...newChildData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mother's Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parvin Begum"
                  value={newChildData.motherName}
                  onChange={(e) => setNewChildData({ ...newChildData, motherName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Birth Registration Number (BRN) - Unique Key *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-6789-0123"
                  value={newChildData.brn}
                  onChange={(e) => setNewChildData({ ...newChildData, brn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Duplicates are rejected with a warning.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newChildData.dob}
                    onChange={(e) => setNewChildData({ ...newChildData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pendant Tag ID</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={newChildData.tagId}
                    onChange={(e) => setNewChildData({ ...newChildData, tagId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal-phone-active"
                  checked={newChildData.phoneActive}
                  onChange={(e) => setNewChildData({ ...newChildData, phoneActive: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-teal-500"
                />
                <label htmlFor="modal-phone-active" className="text-slate-300">
                  Mother's phone active & reachable
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
