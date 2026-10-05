import React from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { Language } from '../../types';
import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  GitMerge,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Smartphone,
  ShieldCheck,
  Radio,
  FileText,
} from 'lucide-react';

interface OfflineSyncModuleProps {
  lang: Language;
}

export const OfflineSyncModule: React.FC<OfflineSyncModuleProps> = ({ lang }) => {
  const {
    isOnline,
    toggleOnline,
    pendingActions,
    reconnectAndSync,
    isSyncing,
    syncProgress,
    syncLogs,
    guidedTourStep,
  } = usePrototype();

  const isBn = lang === 'bn';

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-6">
      {/* Contextual Tour Hint */}
      {guidedTourStep === 3 && (
        <div className="bg-[#F0FDFA] border-2 border-[#0F766E] rounded-xl p-4 text-center shadow-md animate-bounce">
          <span className="text-[13px] font-bold text-[#0F766E] block">
            📍 {isBn ? 'ধাপ ৩: অফলাইন মোড পরীক্ষা' : 'Step 3: Test Offline Mode & Action Queuing'}
          </span>
          <p className="text-[12px] text-[#334155] mt-0.5">
            {isBn
              ? 'উপরে "Offline Mode" টগল করুন। ফিল্ড অ্যাপে যে কোনো কাজ করলে তা স্থানীয় IndexedDB-তে জমা হবে।'
              : 'Toggle "Offline Mode" to simulate remote char conditions. Actions queue in local IndexedDB.'}
          </p>
        </div>
      )}

      {guidedTourStep === 4 && (
        <div className="bg-[#F0FDFA] border-2 border-[#0F766E] rounded-xl p-4 text-center shadow-md animate-bounce">
          <span className="text-[13px] font-bold text-[#0F766E] block">
            📍 {isBn ? 'ধাপ ৪: পুনঃসংযোগ ও টাইমস্ট্যাম্প বিরোধ নিষ্পত্তি' : 'Step 4: Reconnect & Witness Timestamp Conflict Resolution'}
          </span>
          <p className="text-[12px] text-[#334155] mt-0.5">
            {isBn
              ? 'নিচের "Reconnect & Sync Gateway" বোতামে চাপুন এবং স্ক্রিপ্টেড কনফ্লিক্ট লগ দেখুন।'
              : 'Click "Reconnect & Sync Gateway" below to execute sync and see the pendant-wins timestamp resolution.'}
          </p>
        </div>
      )}

      {/* 1. Header & Quick Status Strip */}
      <div className="card-base p-6 bg-white border border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center">
                <Database className="w-5 h-5 stroke-[2]" />
              </div>
              <h2 className="font-heading font-bold text-[20px] text-[#0B2530]">
                {isBn ? 'অফলাইন-ফার্স্ট আর্কিটেকচার ও সিঙ্ক হাব' : 'Offline-First Engine & Conflict Resolver'}
              </h2>
            </div>
            <p className="text-[14px] text-[#64748B]">
              {isBn
                ? 'নেটওয়ার্কবিহীন দুর্গম হাওর চরে IndexedDB ব্যাকড লোকাল কিউ এবং সিউডো-ক্রিপ্টোগ্রাফিক টাইমস্ট্যাম্প অগ্রাধিকার।'
                : 'IndexedDB edge queue for river chars without cellular signal, featuring cryptographic pendant-wins conflict resolution.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-[13px] font-bold ${
                isOnline
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]'
                  : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 animate-pulse" />}
              <span>{isOnline ? 'Online (VaxEPI Live)' : 'Offline (Local Edge)'}</span>
            </div>

            {/* Offline Toggle */}
            <button
              onClick={() => toggleOnline()}
              className="px-3.5 py-2 rounded-xl text-[13px] font-bold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] transition-colors cursor-pointer"
            >
              {isOnline ? (isBn ? 'অফলাইনে যান' : 'Go Offline') : isBn ? 'অনলাইনে যান' : 'Go Online'}
            </button>

            {/* Reconnect & Sync Button */}
            <button
              onClick={reconnectAndSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-[13px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'পুনঃসংযোগ ও সিঙ্ক' : 'Reconnect & Sync Gateway'}</span>
            </button>
          </div>
        </div>

        {/* Sync Progress Indicator */}
        {isSyncing && (
          <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between text-[12px] font-semibold text-[#0F766E] mb-1.5">
              <span>Synchronizing with DGHS National Immunization Gateway...</span>
              <span>{syncProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F766E] transition-all duration-300 rounded-full"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Side-by-Side: Pending IndexedDB Queue & Scripted Conflict Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Actions Queue */}
        <div className="lg:col-span-6 card-base p-5 bg-white border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <h3 className="font-heading font-bold text-[16px] text-[#0B2530]">
                  {isBn ? 'অপেক্ষমান অফলাইন কিউ (IndexedDB)' : 'Local IndexedDB Pending Queue'}
                </h3>
              </div>
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                {pendingActions.length} {isBn ? 'অপেক্ষমান' : 'queued'}
              </span>
            </div>

            {pendingActions.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] text-[#64748B]">
                <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-[#334155]">
                  {isBn ? 'কোনো অপেক্ষমান অফলাইন কাজ নেই' : 'Queue is empty — all records synced'}
                </p>
                <p className="text-[11.5px] mt-1 text-[#64748B]">
                  {isBn
                    ? 'অফলাইনে থাকা অবস্থায় ফিল্ড অ্যাপে নতুন শিশু নিবন্ধন বা টিকা দিলে তা এখানে দেখাবে।'
                    : 'Switch to offline mode and perform field actions to populate this local queue.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {pendingActions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] text-[12.5px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#9A3412] text-[11px] uppercase tracking-wider">
                        {item.actionType}
                      </span>
                      <span className="text-[10px] font-mono text-[#78350F]">{item.timestamp}</span>
                    </div>
                    <div className="font-semibold text-[#431407]">{item.childName}</div>
                    <p className="text-[11.5px] text-[#7C2D12]">{item.details}</p>
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] text-[#9A3412] font-mono">
                      <Database className="w-3 h-3" />
                      <span>Stored in IndexedDB: /smartguard/pending/{item.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Fallback engine: LocalStorage + RAM</span>
            <span className="text-[#10B981] font-semibold">✓ Sandbox Resilient</span>
          </div>
        </div>

        {/* Right Column: Scripted Conflict Resolution Spotlight */}
        <div className="lg:col-span-6 card-base p-5 bg-[#0B2530] text-white border border-[#1E3A47] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center">
                <GitMerge className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[16px] text-white">
                  {isBn ? 'স্ক্রিপ্টেড বিরোধ নিষ্পত্তি প্রোটোকল' : 'Scripted Conflict Resolution'}
                </h3>
                <span className="text-[11px] text-[#CBD5E1]">
                  Pendant Cryptographic Timestamp vs Central Server
                </span>
              </div>
            </div>

            {/* Explicit Comparison Panel Title & Visual Contrast Cards */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-heading font-bold text-[13px] text-[#2DD4BF] tracking-wide uppercase">
                  Pendant vs Server timestamp
                </h4>
                <span className="text-[10.5px] font-mono text-[#CBD5E1] bg-[#133240] px-2 py-0.5 rounded border border-[#1E3A47]">
                  Deterministic LWW Rule
                </span>
              </div>

              <div className="space-y-3">
                {/* Server Entry (Older / Stale) */}
                <div className="p-3.5 rounded-xl bg-[#0F2936] border border-[#2A4858] text-white">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="flex items-center gap-1.5 text-[#E2E8F0] font-bold">
                      <Server className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>CENTRAL SERVER ENTRY (STALE)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#7F1D1D] text-[#FECACA] border border-[#DC2626] font-bold">
                      Older / Overruled
                    </span>
                  </div>
                  <div className="font-mono text-[13px] font-semibold text-white">
                    2026-09-18 16:30:00 GMT+6
                  </div>
                  <div className="text-[12px] text-[#CBD5E1] mt-1">
                    Child #VXI-2026-8841-92 listed with 3 doses (delayed upstream cellular sync).
                  </div>
                </div>

                {/* Pendant Entry (Newer / Physical Tag Winner) */}
                <div className="p-3.5 rounded-xl bg-[#083332] border-2 border-[#2DD4BF] text-white shadow-md">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="flex items-center gap-1.5 text-[#5EEAD4] font-bold">
                      <Smartphone className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <span>WEARABLE PENDANT NFC TOKEN (WINNER)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#2DD4BF] text-[#081B24] font-black tracking-wider">
                      ✓ PENDANT WINS
                    </span>
                  </div>
                  <div className="font-mono text-[13px] font-bold text-white">
                    2026-09-19 10:14:22 GMT+6
                  </div>
                  <div className="text-[12px] text-[#E0F2FE] mt-1">
                    Physical tag tap authenticated with offline cryptographic signature. Dose #4 recorded on device.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-[#081B24] border border-[#1E3A47] text-[11.5px] text-[#E2E8F0]">
              <span className="text-[#2DD4BF] font-bold">Protocol Rule:</span> Most recent authenticated timestamp wins. Cryptographically signed physical NFC tokens override stale centralized records to eliminate lost outreach sessions.
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#64748B]">
            Automated conflict audit logged into national DHIS2 interoperability stream.
          </div>
        </div>
      </div>

      {/* 3. Live Sync Audit Log Stream */}
      <div className="card-base p-5 bg-white border border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0F766E]" />
            <h3 className="font-heading font-bold text-[15px] text-[#0B2530]">
              {isBn ? 'সিঙ্ক ইভেন্ট অডিট লগ' : 'Real-Time Sync & Gateway Audit Stream'}
            </h3>
          </div>
          <span className="text-[11px] text-[#64748B] font-mono">
            {syncLogs.length} events logged
          </span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] font-mono text-[11.5px]">
          {syncLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg border flex items-start gap-2 ${
                log.type === 'conflict'
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                  : log.type === 'alert'
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                  : log.type === 'success'
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                  : 'bg-white border-[#E2E8F0] text-[#334155]'
              }`}
            >
              <span className="text-[#64748B] shrink-0">[{log.timestamp}]</span>
              <div className="flex-1">
                <span className="font-semibold">{log.message}</span>
                {log.details && (
                  <span className="block text-[10.5px] mt-0.5 opacity-90">{log.details}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
