import React, { useState, useEffect, useRef } from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { Language } from '../../types';
import { VaccineDoseRecord } from '../../types/prototype';
import {
  Smartphone,
  Scan,
  UserPlus,
  Search,
  ListFilter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Lock,
  PlusCircle,
  Sparkles,
  Wifi,
  WifiOff,
  BatteryMedium,
  RotateCw,
  Tag,
  FileCheck,
  ChevronRight,
  X,
  Radio,
  Timer,
  Check,
  Bot,
  Send,
} from 'lucide-react';

interface FieldAppPhoneProps {
  lang: Language;
}

export const FieldAppPhone: React.FC<FieldAppPhoneProps> = ({ lang }) => {
  const {
    children: childRecords,
    selectedChild,
    selectChild,
    registerChild,
    recordDose,
    rewritePendantTag,
    isOnline,
    currentDate,
    activeSubViewPhone,
    setActiveSubViewPhone,
    guidedTourStep,
    nextGuidedTourStep,
  } = usePrototype();

  const isBn = lang === 'bn';

  // Local state inside the phone app
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(true);

  // Dose recording modal state
  const [isRecordDoseModalOpen, setIsRecordDoseModalOpen] = useState<boolean>(false);
  const [selectedDoseToAdminister, setSelectedDoseToAdminister] = useState<VaccineDoseRecord | null>(null);
  const [doseBatchInput, setDoseBatchInput] = useState<string>('PV-2026-9045');
  const [isSubmittingDose, setIsSubmittingDose] = useState<boolean>(false);
  const [doseSuccessToast, setDoseSuccessToast] = useState<string | null>(null);

  // Register Newborn State
  const [regName, setRegName] = useState<string>('Nayeem Khan');
  const [regMother, setRegMother] = useState<string>('Rina Begum');
  const [regBrn, setRegBrn] = useState<string>('2026-DH-7719-502');
  const [regDob, setRegDob] = useState<string>('2026-09-02');
  const [regPhone, setRegPhone] = useState<string>('+880 1712-334455');
  const [regError, setRegError] = useState<string | null>(null);
  const [isVerifyingVaxEpi, setIsVerifyingVaxEpi] = useState<boolean>(false);
  const [vaxEpiVerifiedId, setVaxEpiVerifiedId] = useState<string | null>(null);
  const [isAssigningPendant, setIsAssigningPendant] = useState<boolean>(false);
  const [assignedPendantToken, setAssignedPendantToken] = useState<string | null>(null);

  // Lost Tag Search & Rewrite State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [rewriteTimer, setRewriteTimer] = useState<number>(0);
  const [rewriteResult, setRewriteResult] = useState<{ tagId: string; elapsed: number } | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // AI Clinical Guide Drawer State
  const [isAiClinicalOpen, setIsAiClinicalOpen] = useState<boolean>(false);
  const [aiClinicalQuery, setAiClinicalQuery] = useState<string>('');
  const [aiClinicalLoading, setAiClinicalLoading] = useState<boolean>(false);
  const [aiClinicalResponse, setAiClinicalResponse] = useState<string | null>(null);

  const handleAskClinicalGuidance = async (questionText: string) => {
    if (!questionText.trim()) return;
    setAiClinicalLoading(true);
    setAiClinicalResponse(null);

    try {
      const res = await fetch('/api/gemini/clinical-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: questionText,
          childName: selectedChild?.name,
          vaccine: selectedDoseToAdminister?.vaccine || 'Pentavalent / PCV',
          lang: isBn ? 'bn' : 'en',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiClinicalResponse(data.guidance);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      setAiClinicalResponse(
        isBn
          ? `ইপিআই বাংলাদেশ গাইডলাইন: সাধারণ সর্দি, কাশি বা ডায়রিয়া থাকলে টিকা প্রদানে কোনো বাধা নেই। তবে শিশুর তীব্র জ্বর (১০২°ফা এর বেশি) থাকলে সুস্থ হওয়া পর্যন্ত টিকা স্থগিত রাখুন। টিকার পর মৃদু জ্বরের জন্য প্যারাসিটামল ড্রপ চিকিৎসকের নির্দেশিত ডোজে খাওয়ানো যেতে পারে।`
          : `DGHS EPI Protocol: Mild cough, common cold, or minor diarrhea are NOT contraindications for routine immunization. Only acute high fever (>102°F) warrants postponing until the child stabilizes.`
      );
    } finally {
      setAiClinicalLoading(false);
    }
  };

  // Handle Scan action
  const handleTapToScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      if (guidedTourStep === 2) {
        // Encourage next action in tour
      }
    }, 1400);
  };

  // Handle VaxEPI Verification (1.5s loading)
  const handleVerifyVaxEpi = () => {
    setIsVerifyingVaxEpi(true);
    setVaxEpiVerifiedId(null);
    setTimeout(() => {
      setIsVerifyingVaxEpi(false);
      const generatedId = `VXI-2026-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 89)}`;
      setVaxEpiVerifiedId(generatedId);
    }, 1500);
  };

  // Handle Assign Pendant
  const handleAssignPendant = () => {
    setIsAssigningPendant(true);
    setTimeout(() => {
      setIsAssigningPendant(false);
      const token = `SHA256: 0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}b89a`;
      setAssignedPendantToken(token);
    }, 1200);
  };

  // Complete Registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!vaxEpiVerifiedId || !assignedPendantToken) return;

    const res = await registerChild({
      name: regName,
      motherName: regMother,
      brn: regBrn,
      dob: regDob,
      phone: regPhone,
      phoneActive: true,
      healthId: vaxEpiVerifiedId,
      pendantToken: assignedPendantToken,
    });

    if (!res.success) {
      setRegError(res.error || 'Duplicate record: BRN already exists');
      return;
    }

    setActiveSubViewPhone('scan');
    setDoseSuccessToast(isBn ? 'নতুন শিশুর তথ্য সফলভাবে নিবন্ধিত হয়েছে!' : 'Newborn successfully registered with Kala Dhaga pendant!');
    setTimeout(() => setDoseSuccessToast(null), 4000);
  };

  // Handle Record Dose submission
  const handleConfirmDose = async () => {
    if (!selectedDoseToAdminister) return;
    setIsSubmittingDose(true);
    await recordDose(selectedChild.id, selectedDoseToAdminister.id, doseBatchInput);
    setIsSubmittingDose(false);
    setIsRecordDoseModalOpen(false);
    setDoseSuccessToast(
      isBn
        ? `${selectedDoseToAdminister.vaccine} সফলভাবে প্রয়োগ রেকর্ড করা হয়েছে!`
        : `${selectedDoseToAdminister.vaccine} dose recorded & cryptographically signed!`
    );
    setTimeout(() => setDoseSuccessToast(null), 4000);
  };

  // Handle Lost-Tag Rewrite with Live Stopwatch
  const handleRewriteTag = async (childId: string) => {
    setIsRewriting(true);
    setRewriteResult(null);
    setRewriteTimer(0);

    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000);
      setRewriteTimer(Math.round(elapsed * 10) / 10);
    }, 100);

    const res = await rewritePendantTag(childId);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRewriting(false);
    if (res.success) {
      setRewriteResult({ tagId: res.newTagId, elapsed: res.elapsedSec });
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Filtered children for Lost-Tag Search
  const searchResults = childRecords.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.motherName.toLowerCase().includes(q) ||
      c.brn.toLowerCase().includes(q) ||
      c.healthId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Contextual Tour Hint */}
      {guidedTourStep === 1 && (
        <div className="mb-4 bg-[#F0FDFA] border-2 border-[#0F766E] rounded-xl p-3.5 max-w-[440px] text-center shadow-md animate-bounce">
          <span className="text-[13px] font-bold text-[#0F766E] block">
            📍 {isBn ? 'ধাপ ১: নতুন নবজাতক নিবন্ধন ও পেন্ড্যান্ট অ্যাসাইন' : 'Step 1: Register Newborn & Assign Pendant'}
          </span>
          <p className="text-[12px] text-[#334155] mt-0.5">
            {isBn
              ? 'নিচের ফোন স্ক্রিনে "Verify with VaxEPI" চাপুন, এরপর "Assign Pendant" এবং সংরক্ষণ করুন।'
              : 'Tap "Verify with VaxEPI" in the phone frame below, then "Assign Pendant" and save.'}
          </p>
        </div>
      )}

      {guidedTourStep === 2 && (
        <div className="mb-4 bg-[#F0FDFA] border-2 border-[#0F766E] rounded-xl p-3.5 max-w-[440px] text-center shadow-md animate-bounce">
          <span className="text-[13px] font-bold text-[#0F766E] block">
            📍 {isBn ? 'ধাপ ২: পেন্ড্যান্ট স্ক্যান ও ডোজ রেকর্ড' : 'Step 2: Tap Pendant to Scan & Record Dose'}
          </span>
          <p className="text-[12px] text-[#334155] mt-0.5">
            {isBn
              ? '"Tap Pendant to Scan" চাপুন, টাইমলাইন দেখুন এবং "Record Dose" দিয়ে টিকা প্রয়োগ নিশ্চিত করুন।'
              : 'Tap "Tap Pendant to Scan", view digital timeline, and click "Record Dose" with batch number.'}
          </p>
        </div>
      )}

      {/* Demo Child Selector - placed OUTSIDE the phone frame */}
      <div className="w-full max-w-[390px] mb-3 bg-white border border-[#E2E8F0] px-4 py-2.5 rounded-2xl shadow-sm flex items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-1.5 text-[#64748B]">
          <Smartphone className="w-4 h-4 text-[#0F766E]" />
          <span className="font-semibold text-[#0B2530]">
            {isBn ? 'ডেমো শিশু নির্বাচন:' : 'Demo Child Selector:'}
          </span>
        </div>
        <select
          value={selectedChild.id}
          onChange={(e) => selectChild(e.target.value)}
          className="font-medium bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-[#0B2530] text-[12px] cursor-pointer focus:outline-none focus:border-[#0F766E]"
          title="Switch sample child record"
        >
          {childRecords.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.riskLevel.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Realistic Smartphone Chassis Frame (360px - 410px width) */}
      <div className="w-full max-w-[390px] bg-[#0B151C] rounded-[48px] p-3.5 shadow-2xl border-4 border-[#334155] ring-1 ring-white/10 relative">
        {/* Dynamic Island / Speaker Notch with safe clearance */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#1E293B] mr-2" />
          <div className="w-1 h-1 rounded-full bg-[#0F766E]" />
        </div>

        {/* Screen Container */}
        <div className="w-full bg-[#F8FAFC] rounded-[38px] overflow-hidden flex flex-col min-h-[640px] max-h-[740px] relative text-[#0B2530]">
          {/* 1. Phone Top Status Bar - with ample padding to clear notch */}
          <div className="bg-[#0F766E] text-white px-6 pt-7 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-tight">
            <span>09:41 AM</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-90">{currentDate}</span>
              {isOnline ? (
                <span className="flex items-center gap-0.5 text-[#A7F3D0]">
                  <Wifi className="w-3 h-3" />
                  <span>4G</span>
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[#FDE68A] font-bold">
                  <WifiOff className="w-3 h-3" />
                  <span>OFF</span>
                </span>
              )}
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. Field App Header with CHW Identity */}
          <div className="bg-[#0F766E] text-white px-4 pb-3 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-[12px]">
                AK
              </div>
              <div>
                <h4 className="font-heading font-bold text-[13px] leading-tight">
                  {isBn ? 'আমেনা খাতুন (সিএইচডব্লিউ #৪০২)' : 'Amena Khatun (CHW #402)'}
                </h4>
                <span className="text-[10.5px] text-[#CCFBF1] block">
                  Sunamganj Tahirpur Outreach
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAiClinicalOpen(true)}
                className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[#5EEAD4] text-[10.5px] font-bold flex items-center gap-1 border border-white/25 transition-all cursor-pointer shadow-2xs"
                title="Open DGHS AI Clinical Guide"
              >
                <Sparkles className="w-3 h-3 text-[#5EEAD4]" />
                <span>{isBn ? 'এআই গাইড' : 'AI Guide'}</span>
              </button>
              <span className="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded text-white block">
                {isOnline ? 'VaxEPI (mock)' : 'Offline Mode'}
              </span>
            </div>
          </div>

          {/* 3. In-App Navigation Tabs */}
          <div className="bg-white border-b border-[#E2E8F0] px-2 py-1.5 flex items-center justify-around text-[11px] font-bold">
            <button
              onClick={() => setActiveSubViewPhone('scan')}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSubViewPhone === 'scan'
                  ? 'text-[#0F766E] bg-[#F0FDFA]'
                  : 'text-[#64748B] hover:text-[#0F766E]'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>{isBn ? 'স্ক্যান ও টিকা' : 'Scan & Doses'}</span>
            </button>

            <button
              onClick={() => setActiveSubViewPhone('register')}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSubViewPhone === 'register'
                  ? 'text-[#0F766E] bg-[#F0FDFA]'
                  : 'text-[#64748B] hover:text-[#0F766E]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isBn ? 'নিবন্ধন' : 'Register'}</span>
            </button>

            <button
              onClick={() => setActiveSubViewPhone('lost-tag')}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSubViewPhone === 'lost-tag'
                  ? 'text-[#0F766E] bg-[#F0FDFA]'
                  : 'text-[#64748B] hover:text-[#0F766E]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{isBn ? 'হারানো ট্যাগ' : 'Lost Tag (<60s)'}</span>
            </button>

            <button
              onClick={() => setActiveSubViewPhone('due-list')}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors cursor-pointer relative ${
                activeSubViewPhone === 'due-list'
                  ? 'text-[#0F766E] bg-[#F0FDFA]'
                  : 'text-[#64748B] hover:text-[#0F766E]'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>{isBn ? 'ডিউ লিস্ট' : 'Due List'}</span>
            </button>
          </div>

          {/* Toast Notice */}
          {doseSuccessToast && (
            <div className="bg-[#ECFDF5] border-b border-[#A7F3D0] p-2 text-[11.5px] text-[#065F46] font-semibold flex items-center gap-1.5 shadow-sm animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{doseSuccessToast}</span>
            </div>
          )}

          {/* Screen Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[13px]">
            {/* ======================================================== */}
            {/* SUB-VIEW 1: SCAN PENDANT & TIMELINE                      */}
            {/* ======================================================== */}
            {activeSubViewPhone === 'scan' && (
              <div className="space-y-4">
                {/* NFC Tap Scanner Banner */}
                <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border-2 border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center mb-2.5 relative">
                    {isScanning ? (
                      <Sparkles className="w-7 h-7 animate-spin text-[#0F766E]" />
                    ) : (
                      <Scan className="w-7 h-7 stroke-[2]" />
                    )}
                    {isScanning && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-[#0F766E] animate-ping" />
                    )}
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] mb-1">
                    {isBn ? 'কালা সুতা এনএফসি রিডার' : 'Wearable Pendant NFC Reader'}
                  </span>

                  <button
                    onClick={handleTapToScan}
                    disabled={isScanning}
                    className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isScanning ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>{isBn ? 'এনএফসি ট্যাগ পড়া হচ্ছে...' : 'Reading NFC Tag...'}</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4" />
                        <span>{isBn ? 'পেন্ড্যান্ট স্ক্যান করতে ট্যাপ করুন' : 'Tap Pendant to Scan'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Child Card Header */}
                {scanSuccess && selectedChild && (
                  <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-bold text-[16px] text-[#0B2530]">
                            {selectedChild.name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                            Verified
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[12px] text-[#64748B]">
                            {isBn ? 'মাতা:' : "Mother:"} <span className="font-medium text-[#334155]">{selectedChild.motherName}</span>
                          </p>
                          <div className="flex items-center gap-1.5 text-[11.5px]">
                            <span className="text-[#64748B]">BRN:</span>
                            <span className="font-mono font-semibold text-[#0B2530] whitespace-nowrap tracking-tight">
                              {selectedChild.brn}
                            </span>
                          </div>
                          <div className="text-[11px] pt-0.5">
                            {selectedChild.lastDoseDate ? (
                              <span className="text-[#64748B]">
                                Last dose: <span className="font-mono font-medium text-[#334155]">{selectedChild.lastDoseDate}</span>
                              </span>
                            ) : (
                              <span className="text-[#0F766E] font-semibold">
                                Next due: {selectedChild.nextDueDoseName || 'BCG'} <span className="text-[10px] text-[#64748B] font-normal">(Newborn, 0 doses)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Virtual Pendant Encrypted Token Display (No plain-text PII) */}
                    <div className="bg-[#0B2530] text-[#E2E8F0] p-2.5 rounded-xl border border-[#1E3A47] text-[11px]">
                      <div className="flex items-center justify-between text-[10px] text-[#2DD4BF] font-semibold mb-1">
                        <div className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>NO PLAIN-TEXT PII ON CHIP</span>
                        </div>
                        <span className="font-mono text-[9.5px] bg-[#1E3A47] px-1.5 py-0.5 rounded text-white">
                          {selectedChild.pendantTagId}
                        </span>
                      </div>
                      <div className="font-mono text-[10.5px] text-[#94A3B8] break-all leading-tight">
                        {selectedChild.pendantToken}
                      </div>
                    </div>

                    {/* Vaccine Timeline with Done/Due/Overdue/Not yet due */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[12px] text-[#0B2530]">
                          {isBn ? 'টিকা প্রদানের ডিজিটাল সময়রেখা' : 'EPI Immunization Timeline'}
                        </span>
                        <span className="text-[11px] text-[#0F766E] font-semibold">
                          {selectedChild.timeline.filter((d) => d.status === 'done').length}/
                          {selectedChild.timeline.length} {isBn ? 'সম্পন্ন' : 'Doses Done'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedChild.timeline.map((dose) => {
                          const isDone = dose.status === 'done';
                          const isOverdue = dose.status === 'overdue';
                          const isDue = dose.status === 'due';
                          const isNotYetDue = dose.status === 'not-yet-due';

                          return (
                            <div
                              key={dose.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                isDone
                                  ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                                  : isOverdue
                                  ? 'bg-[#FEF2F2] border-[#FECACA]'
                                  : isDue
                                  ? 'bg-[#F0FDFA] border-[#99F6E4]'
                                  : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-80'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                                ) : isOverdue ? (
                                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                                ) : (
                                  <Clock className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                                )}

                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[12px] text-[#0B2530]">
                                      {dose.vaccine}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/80 border border-[#E2E8F0] font-medium text-[#64748B]">
                                      {isBn ? dose.targetAgeBn : dose.targetAgeEn}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-[#64748B]">
                                    {isDone ? (
                                      <span className="text-[#15803D] font-medium">
                                        Administered ({dose.dateAdministered}) • {dose.batchNumber}
                                      </span>
                                    ) : isOverdue ? (
                                      <span className="text-[#B91C1C] font-semibold">
                                        Overdue since {dose.dateScheduled}
                                      </span>
                                    ) : isDue ? (
                                      <span className="text-[#0F766E] font-medium">
                                        Due today / scheduled: {dose.dateScheduled}
                                      </span>
                                    ) : (
                                      <span className="text-[#64748B]">Scheduled: {dose.dateScheduled}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {isDone ? null : isNotYetDue ? (
                                <button
                                  disabled
                                  className="px-2 py-1 rounded-lg bg-[#E2E8F0] text-[#64748B] text-[10.5px] font-semibold shrink-0 cursor-not-allowed"
                                >
                                  {isBn ? 'অপেক্ষমান' : 'Not yet due'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedDoseToAdminister(dose);
                                    setIsRecordDoseModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11px] font-bold shrink-0 shadow-sm cursor-pointer"
                                >
                                  {isBn ? 'প্রয়োগ' : 'Record'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* SUB-VIEW 2: REGISTER NEWBORN & ASSIGN PENDANT            */}
            {/* ======================================================== */}
            {activeSubViewPhone === 'register' && (
              <form onSubmit={handleCompleteRegistration} className="space-y-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="border-b border-[#E2E8F0] pb-2">
                  <h3 className="font-heading font-bold text-[15px] text-[#0B2530]">
                    {isBn ? 'নতুন নবজাতক নিবন্ধন' : 'Register Newborn & Assign Pendant'}
                  </h3>
                  <p className="text-[11.5px] text-[#64748B]">
                    {isBn ? 'ডিজিএইচএস ভ্যাক্সইপিআই জাতীয় আইডির সাথে সংযোগ' : 'Integrated with DGHS VaxEPI registry'}
                  </p>
                </div>

                {regError && (
                  <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[12px] font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    {isBn ? 'শিশুর নাম' : "Child's Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-[12.5px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    {isBn ? 'মাতার নাম' : "Mother's Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={regMother}
                    onChange={(e) => setRegMother(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-[12.5px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    {isBn ? 'জন্ম নিবন্ধন নম্বর (BRN)' : 'Birth Registration Number (BRN)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regBrn}
                    onChange={(e) => setRegBrn(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-[12.5px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                {/* Step A: VaxEPI Verification Button (1.5s simulated loading) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleVerifyVaxEpi}
                    disabled={isVerifyingVaxEpi || !!vaxEpiVerifiedId}
                    className={`w-full h-10 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      vaxEpiVerifiedId
                        ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                        : 'bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-sm'
                    }`}
                  >
                    {isVerifyingVaxEpi ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-[#2DD4BF]" />
                        <span>{isBn ? 'ভ্যাক্সইপিআই যাচাই হচ্ছে (১.৫ সে)...' : 'Verifying with VaxEPI (1.5s)...'}</span>
                      </>
                    ) : vaxEpiVerifiedId ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        <span>VaxEPI ID: {vaxEpiVerifiedId}</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4 text-[#2DD4BF]" />
                        <span>{isBn ? 'Verify with VaxEPI' : 'Verify with VaxEPI'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Step B: Assign Pendant (generates virtual encrypted token) */}
                {vaxEpiVerifiedId && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAssignPendant}
                      disabled={isAssigningPendant || !!assignedPendantToken}
                      className={`w-full h-10 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        assignedPendantToken
                          ? 'bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]'
                          : 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm'
                      }`}
                    >
                      {isAssigningPendant ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>{isBn ? 'পেন্ড্যান্টে এনক্রিপ্ট টোকেন লেখা হচ্ছে...' : 'Minting 128-bit chip token...'}</span>
                        </>
                      ) : assignedPendantToken ? (
                        <>
                          <Tag className="w-4 h-4 text-[#0F766E]" />
                          <span className="truncate">{assignedPendantToken.substring(0, 24)}...</span>
                        </>
                      ) : (
                        <>
                          <Tag className="w-4 h-4" />
                          <span>{isBn ? 'Assign Pendant' : 'Assign Pendant'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Complete & Save */}
                <button
                  type="submit"
                  disabled={!vaxEpiVerifiedId || !assignedPendantToken}
                  className="w-full h-10 rounded-xl bg-[#047857] hover:bg-[#065F46] disabled:opacity-40 text-white font-bold text-[13px] shadow-sm transition-all cursor-pointer mt-2"
                >
                  {isBn ? 'নিবন্ধন সম্পন্ন ও সংরক্ষণ করুন' : 'Save & Bind Kala Dhaga Pendant'}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* SUB-VIEW 3: LOST-TAG SEARCH & REWRITE (<60s TIMER)        */}
            {/* ======================================================== */}
            {activeSubViewPhone === 'lost-tag' && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div>
                  <h3 className="font-heading font-bold text-[15px] text-[#0B2530]">
                    {isBn ? 'হারানো ট্যাগ পুনরুদ্ধার ও রি-রাইট' : 'Lost Tag Recovery (<60s)'}
                  </h3>
                  <p className="text-[11.5px] text-[#64748B]">
                    {isBn ? 'নাম, মাতার নাম বা বিআরএন দিয়ে সন্ধান করুন' : 'Search by child name, mother name, or BRN'}
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isBn ? 'অনুসন্ধান: তানভীর, রোকেয়া, বা BRN...' : 'Search: Tanvir, Rokeya, BRN...'}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#CBD5E1] text-[12px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                {/* Benchmark Indicator */}
                <div className="bg-[#F0FDFA] border border-[#0F766E]/20 rounded-xl p-2.5 flex items-center justify-between text-[11.5px]">
                  <div className="flex items-center gap-1.5 text-[#0F766E] font-bold">
                    <Timer className="w-4 h-4" />
                    <span>WHO/EPI Target: &lt; 60s Rewrite</span>
                  </div>
                  {isRewriting ? (
                    <span className="font-mono font-bold text-[#B91C1C] animate-pulse">
                      ⏱ {rewriteTimer}s elapsed
                    </span>
                  ) : rewriteResult ? (
                    <span className="font-mono font-bold text-[#15803D]">
                      ✓ {rewriteResult.elapsed}s completed!
                    </span>
                  ) : (
                    <span className="text-[#64748B]">Ready</span>
                  )}
                </div>

                {/* Matched Records */}
                <div className="space-y-2 pt-1">
                  {searchResults.slice(0, 3).map((child) => (
                    <div
                      key={child.id}
                      className="p-3 rounded-xl border border-[#E2E8F0] hover:border-[#0F766E]/40 transition-colors bg-[#F8FAFC]"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <span className="font-bold text-[13px] text-[#0B2530] block">
                            {child.name}
                          </span>
                          <div className="text-[11px] text-[#64748B] flex flex-wrap items-center gap-1">
                            <span>Mother: {child.motherName}</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">
                              BRN: <span className="font-mono font-semibold text-[#0B2530]">{child.brn}</span>
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[#475569]">
                          {child.pendantTagId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                        <span className="text-[11px] text-[#15803D] font-semibold">
                          {child.timeline.filter((d) => d.status === 'done').length} doses safe in history
                        </span>

                        <button
                          onClick={() => handleRewriteTag(child.id)}
                          disabled={isRewriting}
                          className="px-3 py-1 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11.5px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <RotateCw className={`w-3 h-3 ${isRewriting ? 'animate-spin' : ''}`} />
                          <span>{isBn ? 'নতুন ট্যাগে রি-রাইট' : 'Re-write to new tag'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SUB-VIEW 4: OFFLINE DUE LIST (CATCHMENT WORKERS)          */}
            {/* ======================================================== */}
            {activeSubViewPhone === 'due-list' && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <div>
                    <h3 className="font-heading font-bold text-[15px] text-[#0B2530]">
                      {isBn ? 'মাঠকর্মীর অফলাইন ডিউ তালিকা' : 'CHW Offline Catchment Due List'}
                    </h3>
                    <span className="text-[11px] text-[#64748B]">
                      {childRecords.filter((c) => c.isInDueList).length} children priority follow-up
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded font-bold">
                    Tahirpur Session #04
                  </span>
                </div>

                <div className="space-y-2">
                  {childRecords
                    .filter((c) => c.isInDueList)
                    .map((child) => (
                      <div
                        key={child.id}
                        onClick={() => {
                          selectChild(child.id);
                          setActiveSubViewPhone('scan');
                        }}
                        className="p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2]/60 hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[13px] text-[#0B2530]">{child.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B91C1C] text-white">
                            Risk {child.riskScore}/100
                          </span>
                        </div>
                        <div className="text-[11px] text-[#475569] mt-1 flex items-center justify-between">
                          <span>Mother: {child.motherName}</span>
                          <span>Last dose: {child.lastDoseDate}</span>
                        </div>
                        <div className="mt-2 text-[10.5px] text-[#991B1B] font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Home visit prioritized • Dial: {child.phone}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Clinical Protocol & Dosage Guide Overlay */}
          {isAiClinicalOpen && (
            <div className="absolute inset-0 z-40 bg-white flex flex-col animate-in slide-in-from-bottom duration-200">
              {/* Drawer Top Header */}
              <div className="bg-gradient-to-r from-[#0B2530] to-[#0F766E] text-white px-4 pt-10 pb-3 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#2DD4BF] border border-white/20">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[13px] text-white leading-tight">
                      {isBn ? 'ইপিআই ক্লিনিক্যাল সহকারী' : 'EPI Clinical Protocol Guide'}
                    </h4>
                    <span className="text-[10px] text-[#A7F3D0]">
                      Powered by Gemini 3.8 Flash
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAiClinicalOpen(false)}
                  className="w-7 h-7 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close clinical guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-3.5 overflow-y-auto flex-1 space-y-3 bg-[#F8FAFC] text-[12px]">
                {/* Child Context Banner */}
                <div className="p-2.5 rounded-xl bg-white border border-[#CBD5E1] flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10.5px] text-[#64748B] block">{isBn ? 'বর্তমান শিশু:' : 'Active Patient:'}</span>
                    <span className="font-bold text-[#0B2530] text-[12.5px]">{selectedChild.name}</span>
                    <span className="text-[11px] text-[#64748B]"> (DOB: {selectedChild.dob})</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                    {selectedChild.riskLevel.toUpperCase()}
                  </span>
                </div>

                {/* Quick 1-Tap Protocol Questions */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                    {isBn ? '⚡ তাৎক্ষণিক ফিল্ড প্রটোকল প্রশ্ন:' : '⚡ Instant Clinical Questions:'}
                  </label>
                  <div className="space-y-1.5">
                    {[
                      {
                        qBn: 'টিকার পর হালকা জ্বর ও প্যারাসিটামল সেবন নিয়ম',
                        qEn: 'Mild post-vaccine fever & paracetamol rules',
                      },
                      {
                        qBn: 'পেনটাভ্যালেন্ট টিকার দুটি ডোজের মধ্যে ন্যূনতম বিরতি কত দিন?',
                        qEn: 'Minimum interval between Pentavalent doses',
                      },
                      {
                        qBn: 'শিশুর সাধারণ সর্দি-কাশি থাকলে কি টিকা দেওয়া যাবে?',
                        qEn: 'Can vaccines be administered if child has mild cough?',
                      },
                      {
                        qBn: 'ইনজেকশন দেওয়ার জায়গায় শক্ত হওয়া বা ফুলে গেলে করণীয়',
                        qEn: 'Swelling or induration at injection site',
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskClinicalGuidance(isBn ? item.qBn : item.qEn)}
                        disabled={aiClinicalLoading}
                        className="w-full text-left p-2 rounded-lg bg-white hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#99F6E4] text-[#0F766E] text-[11px] font-medium transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
                      >
                        <span className="line-clamp-1">{isBn ? item.qBn : item.qEn}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0F766E] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clinical Guidance Response Area */}
                {aiClinicalLoading ? (
                  <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#0F766E]/20 border-t-[#0F766E] animate-spin" />
                    <p className="text-[11.5px] font-medium text-[#0F766E]">
                      {isBn ? 'ইপিআই নির্দেশিকা অনুযায়ী উত্তর তৈরি হচ্ছে...' : 'Consulting DGHS EPI protocols...'}
                    </p>
                  </div>
                ) : aiClinicalResponse ? (
                  <div className="p-3.5 rounded-xl bg-white border border-[#0F766E]/30 shadow-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[11px] border-b border-[#F1F5F9] pb-1.5">
                      <span className="font-bold text-[#0F766E] flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        {isBn ? 'ইপিআই ক্লিনিক্যাল নির্দেশনা:' : 'Clinical Advice:'}
                      </span>
                      <span className="text-[10px] text-[#64748B]">DGHS Aligned</span>
                    </div>
                    <p className="text-[12px] text-[#334155] leading-relaxed font-bangla whitespace-pre-line">
                      {aiClinicalResponse}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Bottom Custom Query Input */}
              <div className="p-2.5 bg-white border-t border-[#E2E8F0] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (aiClinicalQuery.trim()) {
                      handleAskClinicalGuidance(aiClinicalQuery);
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={aiClinicalQuery}
                    onChange={(e) => setAiClinicalQuery(e.target.value)}
                    placeholder={isBn ? 'ইপিআই নিয়ম বা প্রশ্ন লিখুন...' : 'Ask clinical EPI question...'}
                    className="flex-1 h-9 px-3 text-[11.5px] rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:outline-none focus:border-[#0F766E] focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={aiClinicalLoading || !aiClinicalQuery.trim()}
                    className="h-9 px-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                    aria-label="Send clinical question"
                  >
                    {aiClinicalLoading ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 4. Phone Bottom Soft Navigation Bar */}
          <div className="bg-white border-t border-[#E2E8F0] px-6 py-2 flex items-center justify-center">
            <div className="w-24 h-1 bg-[#CBD5E1] rounded-full" />
          </div>
        </div>
      </div>

      {/* Record a Dose Modal Dialog */}
      {isRecordDoseModalOpen && selectedDoseToAdminister && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-[#E2E8F0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-[15px] text-[#0B2530]">
                    {isBn ? 'টিকা প্রয়োগ রেকর্ড' : 'Record Vaccine Administration'}
                  </h4>
                  <span className="text-[11px] text-[#64748B]">For {selectedChild.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsRecordDoseModalOpen(false)}
                className="text-[#64748B] hover:text-[#0B2530] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <span className="text-[11px] text-[#64748B] block mb-0.5">Vaccine:</span>
                <span className="font-bold text-[#0B2530] text-[14px]">
                  {selectedDoseToAdminister.vaccine}
                </span>
                <span className="text-[11.5px] text-[#0F766E] block">
                  {selectedDoseToAdminister.disease}
                </span>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  {isBn ? 'ভ্যাকসিন ভায়াল ব্যাচ নম্বর' : 'Vial Batch Number'}
                </label>
                <input
                  type="text"
                  value={doseBatchInput}
                  onChange={(e) => setDoseBatchInput(e.target.value)}
                  placeholder="e.g. PV-2026-9045"
                  className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] text-[13px] font-mono focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="text-[11.5px] text-[#64748B] bg-[#F0FDFA] p-2.5 rounded-lg border border-[#0F766E]/20 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>
                  {isOnline
                    ? 'Will sync directly with VaxEPI national registry.'
                    : 'Offline active: Signature queued in local IndexedDB.'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsRecordDoseModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDose}
                disabled={isSubmittingDose || !doseBatchInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-[12.5px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingDose ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing...</span>
                  </>
                ) : (
                  <span>{isBn ? 'টিকা প্রয়োগ নিশ্চিত করুন' : 'Confirm & Sign Dose'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
