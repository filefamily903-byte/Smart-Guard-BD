import React from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { Language } from '../../types';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Smartphone,
  Scan,
  Database,
  GitMerge,
  ShieldAlert,
  Thermometer,
  Check,
} from 'lucide-react';

interface GuidedTourModalProps {
  lang: Language;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ lang }) => {
  const {
    guidedTourStep,
    nextGuidedTourStep,
    prevGuidedTourStep,
    closeGuidedTour,
  } = usePrototype();

  const isBn = lang === 'bn';

  if (guidedTourStep === null) return null;

  const TOUR_STEPS = [
    {
      step: 1,
      titleEn: 'Step 1: Register Newborn & Assign Pendant',
      titleBn: 'ধাপ ১: নতুন নবজাতক নিবন্ধন ও পেন্ড্যান্ট অ্যাসাইন',
      descEn:
        'In the Phone Frame, click "Verify with VaxEPI" (1.5s simulated DGHS API check) to generate a national Health ID. Then click "Assign Pendant" to create a virtual 128-bit encrypted chip token without plain-text PII.',
      descBn:
        'ফোন স্ক্রিনে "Verify with VaxEPI" বোতামে চাপুন (১.৫ সেকেন্ডে জাতীয় আইডি নিশ্চিতকরণ)। এরপর "Assign Pendant" চেপে কোনো প্লেইন-টেক্সট পিআইআই ছাড়াই ১২৮-বিট এনক্রিপ্ট টোকেন তৈরি করুন।',
      icon: Smartphone,
      actionHintEn: 'Action: Tap "Verify with VaxEPI" then "Assign Pendant" on the phone screen.',
      actionHintBn: 'করণীয়: ফোনের স্ক্রিনে "Verify with VaxEPI" ও "Assign Pendant" চাপুন।',
    },
    {
      step: 2,
      titleEn: 'Step 2: Tap Pendant to Scan & Record a Dose',
      titleBn: 'ধাপ ২: এনএফসি পেন্ড্যান্ট স্ক্যান ও টিকা প্রয়োগ রেকর্ড',
      descEn:
        'Switch to "Scan & Doses" tab inside the phone. Click "Tap Pendant to Scan" to play the NFC radar animation and reveal Tanvir\'s vaccine timeline (done/due/overdue). Click "Record" on a due dose, enter batch number, and confirm.',
      descBn:
        'ফোনে "স্ক্যান ও টিকা" ট্যাবে যান। "Tap Pendant to Scan" চেপে এনএফসি স্ক্যান অ্যানিমেশন দেখুন এবং ডিজিটাল টাইমলাইন খুলুন। এরপর "প্রয়োগ" বোতামে চেপে ব্যাচ নম্বর সহ টিকা নিশ্চিত করুন।',
      icon: Scan,
      actionHintEn: 'Action: Click "Tap Pendant to Scan", then click "Record" to sign a dose.',
      actionHintBn: 'করণীয়: "Tap Pendant to Scan" চাপুন এবং পরবর্তীতে "Record" দিয়ে টিকা সাইন করুন।',
    },
    {
      step: 3,
      titleEn: 'Step 3: Go Offline (Simulating Remote Chars)',
      titleBn: 'ধাপ ৩: অফলাইন মোড ও লোকাল IndexedDB কিউ',
      descEn:
        'Click "Go Offline" in the top bar or Offline Sync tab. Notice that all subsequent field operations are queued locally in browser IndexedDB, with an orange "X pending" counter badge.',
      descBn:
        'টপ বারে "Offline Mode" চালু করুন। হাওর চরে সংযোগহীন অবস্থায় কাজগুলো ব্রাউজারের IndexedDB-তে জমা হয়ে "X pending" ব্যাজ প্রদর্শন করে।',
      icon: Database,
      actionHintEn: 'Action: Toggle the Online/Offline button to test offline resilience.',
      actionHintBn: 'করণীয়: টপ বার বা মডিউলে অফলাইন বাটন টগল করুন।',
    },
    {
      step: 4,
      titleEn: 'Step 4: Reconnect & Timestamp Conflict Resolution',
      titleBn: 'ধাপ ৪: পুনঃসংযোগ ও টাইমস্ট্যাম্প বিরোধ নিষ্পত্তি',
      descEn:
        'Click "Reconnect & Sync Gateway". Watch the multi-step sync progress bar and examine the scripted conflict log: the wearable pendant\'s newer timestamp overrides the stale server cache — pendant wins!',
      descBn:
        '"Reconnect & Sync Gateway" বোতামে চাপুন। সিঙ্ক অ্যানিমেশন শেষে স্ক্রিপ্টেড কনফ্লিক্ট পরীক্ষা করুন: পেন্ড্যান্টের নতুন টাইমস্ট্যাম্প সার্ভারের পুরাতন ক্যাশকে প্রতিস্থাপন করে বিজয়ী হয়।',
      icon: GitMerge,
      actionHintEn: 'Action: Click "Reconnect & Sync Gateway" to witness the conflict resolution.',
      actionHintBn: 'করণীয়: "Reconnect & Sync Gateway" চাপুন এবং পেন্ড্যান্ট-উইন্স প্রোটোকল দেখুন।',
    },
    {
      step: 5,
      titleEn: 'Step 5: Fast-Forward +56d & Simulate Cold-Chain Breach',
      titleBn: 'ধাপ ৫: সময় এগিয়ে আইভিআর কল ও কোল্ড চেইন ব্রিচ অ্যালার্ট',
      descEn:
        'Click "+56 Days (Threshold)" in the top bar. The risk score escalates past the 56-day boundary. Play the simulated Bangla IVR voice call. Then in Manager Dashboard, click "Simulate Breach" to dispatch SMS alarms!',
      descBn:
        'টপ বারে "+56 Days" চাপুন। শিশুর ঝুঁকি সীমা পার হলে বাংলায় আইভিআর ভয়েস কল প্লে করুন। এরপর ম্যানেজার ড্যাশবোর্ডে গিয়ে "Simulate Breach" দিয়ে লাল সতর্কতা ও এসএমএস অ্যালার্ট পরীক্ষা করুন!',
      icon: ShieldAlert,
      actionHintEn: 'Action: Test "+56 Days", play the Bangla IVR call, and trigger a cold-chain breach.',
      actionHintBn: 'করণীয়: "+56 Days" চাপুন, বাংলা আইভিআর চালান এবং কোল্ড চেইন ব্রিচ সিমুলেট করুন।',
    },
  ];

  const currentStepData = TOUR_STEPS[guidedTourStep - 1] || TOUR_STEPS[0];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed bottom-6 right-4 md:right-8 z-50 max-w-[420px] w-full bg-[#0B2530] text-white rounded-2xl border-2 border-[#2DD4BF] shadow-2xl p-4 md:p-5 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header with Step Dots & Close Button */}
      <div className="flex items-center justify-between border-b border-[#1E3A47] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2DD4BF] text-[#0B2530] flex items-center justify-center font-black text-[13px]">
            {guidedTourStep}
          </div>
          <span className="font-heading font-bold text-[14px] text-white">
            {isBn ? 'স্মার্টগার্ড ইন্টারেক্টিভ গাইড' : 'Guided Prototype Tour'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#94A3B8]">
            {guidedTourStep} of 5
          </span>
          <button
            onClick={closeGuidedTour}
            className="text-[#94A3B8] hover:text-white p-1 cursor-pointer transition-colors"
            title="Close guided tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#1E3A47] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[#2DD4BF] transition-all duration-300"
          style={{ width: `${(guidedTourStep / 5) * 100}%` }}
        />
      </div>

      {/* Body Content */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-[#2DD4BF] font-bold text-[14px]">
          <StepIcon className="w-4 h-4" />
          <h4>{isBn ? currentStepData.titleBn : currentStepData.titleEn}</h4>
        </div>

        <p className="text-[12.5px] text-[#CBD5E1] leading-relaxed">
          {isBn ? currentStepData.descBn : currentStepData.descEn}
        </p>

        <div className="bg-[#133240] p-2.5 rounded-xl border border-[#1E3A47] text-[11.5px] text-[#99F6E4] font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2DD4BF] shrink-0" />
          <span>{isBn ? currentStepData.actionHintBn : currentStepData.actionHintEn}</span>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1E3A47]">
        <button
          onClick={prevGuidedTourStep}
          disabled={guidedTourStep <= 1}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#94A3B8] hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{isBn ? 'আগেরটি' : 'Previous'}</span>
        </button>

        {guidedTourStep < 5 ? (
          <button
            onClick={nextGuidedTourStep}
            className="px-4 py-1.5 rounded-xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B2530] text-[12.5px] font-bold transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
          >
            <span>{isBn ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={closeGuidedTour}
            className="px-4 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[12.5px] font-bold transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
          >
            <span>{isBn ? 'ট্যুর সম্পন্ন' : 'Finish Tour'}</span>
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
