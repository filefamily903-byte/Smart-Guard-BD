import React from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { Language } from '../../types';
import {
  Wifi,
  WifiOff,
  Calendar,
  RotateCcw,
  Sparkles,
  Smartphone,
  Database,
  ShieldAlert,
  BarChart3,
  LayoutGrid,
  Info,
  Clock,
  FastForward,
} from 'lucide-react';

interface PrototypeTopBarProps {
  lang: Language;
}

export const PrototypeTopBar: React.FC<PrototypeTopBarProps> = ({ lang }) => {
  const {
    currentDate,
    daysAdvanced,
    isOnline,
    pendingActions,
    toggleOnline,
    advanceTime,
    resetTime,
    resetDemo,
    startGuidedTour,
    activeTab,
    setActiveTab,
    guidedTourStep,
  } = usePrototype();

  const isBn = lang === 'bn';

  return (
    <div className="w-full bg-[#0B2530] text-white border-b border-[#1E3A47] shadow-md sticky top-[72px] z-40">
      {/* 1. Mandatory Disclaimer Banner */}
      <div className="bg-[#081B24] border-b border-[#1E3A47] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[12px] md:text-[13px]">
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse shrink-0" />
          <span className="font-semibold text-[#F1F5F9]">
            {isBn
              ? 'কাল্পনিক ডেমো ডেটা সহ প্রোটোটাইপ। প্রকৃত স্বাস্থ্য ব্যবস্থার সাথে যুক্ত নয়।'
              : 'Prototype with sample data. Not connected to real health systems.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Guided Tour Trigger */}
          <button
            onClick={startGuidedTour}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              guidedTourStep !== null
                ? 'bg-[#2DD4BF] text-[#0B2530] shadow-[0_0_12px_rgba(45,212,191,0.5)] ring-2 ring-white'
                : 'bg-[#0F766E] hover:bg-[#14B8A6] text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'নির্দেশিত ট্যুর (৫ ধাপ)' : 'Guided Tour (5 Steps)'}</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={resetDemo}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold text-[#94A3B8] hover:text-white hover:bg-[#1E3A47] transition-colors cursor-pointer"
            title={isBn ? 'ডেমো রিসেট করুন' : 'Reset demo to initial state'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isBn ? 'রিসেট' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>

      {/* 2. Simulation Controls: Time Machine + Offline Toggle */}
      <div className="max-w-[1280px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Time Fast-Forward Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-[#133240] px-3 py-1.5 rounded-xl border border-[#1E3A47] text-[13px]">
            <Calendar className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-[#94A3B8]">{isBn ? 'সিমুলেটেড তারিখ:' : 'Simulated Date:'}</span>
            <span className="font-mono font-bold text-white tracking-wide">{currentDate}</span>
            {daysAdvanced > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#0F766E] text-[#99F6E4]">
                +{daysAdvanced}d
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1 bg-[#133240] p-1 rounded-xl border border-[#1E3A47]">
            <button
              onClick={() => advanceTime(7)}
              className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-[#1E3A47] hover:bg-[#0F766E] text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Fast forward simulated time by 7 days"
            >
              <FastForward className="w-3 h-3 text-[#2DD4BF]" />
              <span>+7 {isBn ? 'দিন' : 'Days'}</span>
            </button>

            <button
              onClick={() => advanceTime(56)}
              className="px-2.5 py-1 rounded-lg text-[12px] font-bold bg-[#B91C1C]/20 hover:bg-[#B91C1C] text-[#FCA5A5] hover:text-white border border-[#B91C1C]/40 transition-colors flex items-center gap-1 cursor-pointer"
              title="Fast forward simulated time by 56 days to trigger dropout risk boundary"
            >
              <ShieldAlert className="w-3 h-3 text-[#F87171]" />
              <span>+56 {isBn ? 'দিন (ঝুঁকি সীমা)' : 'Days (Threshold)'}</span>
            </button>

            {daysAdvanced > 0 && (
              <button
                onClick={resetTime}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                title="Reset time to Day 0"
              >
                {isBn ? 'আজকে ফিরুন' : 'Today'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Online / Offline Toggle & Pending Queue Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleOnline()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                isOnline
                  ? 'bg-[#064E3B]/40 text-[#6EE7B7] border-[#059669]/50 hover:bg-[#064E3B]/60'
                  : 'bg-[#78350F]/50 text-[#FCD34D] border-[#D97706]/60 hover:bg-[#78350F]/70 ring-2 ring-[#F59E0B]'
              }`}
              aria-label="Toggle Online/Offline mode"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-[#34D399]" />
                  <span>{isBn ? 'অনলাইন (লাইভ সিঙ্ক)' : 'Online (DGHS Sync)'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-[#FBBF24] animate-pulse" />
                  <span>{isBn ? 'অফলাইন মোড' : 'Offline Mode'}</span>
                </>
              )}
            </button>

            {/* Offline Pending Queue Badge */}
            {pendingActions.length > 0 && (
              <div
                onClick={() => setActiveTab('offline-sync')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F59E0B] text-[#78350F] font-extrabold text-[12px] shadow-sm hover:scale-105 transition-transform cursor-pointer animate-pulse"
                title="Actions queued in IndexedDB waiting for connection"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {pendingActions.length} {isBn ? 'অপেক্ষমান' : 'pending'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Module Tabs Navigation */}
      <div className="max-w-[1280px] mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-[#1E3A47]/60 pt-1">
        <button
          onClick={() => setActiveTab('field-app')}
          className={`flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'field-app'
              ? 'border-[#2DD4BF] text-[#2DD4BF] bg-[#133240]/40'
              : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#133240]/20'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>1. {isBn ? 'ফিল্ড অ্যাপ (ফোন স্ক্রিন)' : 'Field App (Phone)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('offline-sync')}
          className={`flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'offline-sync'
              ? 'border-[#2DD4BF] text-[#2DD4BF] bg-[#133240]/40'
              : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#133240]/20'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. {isBn ? 'অফলাইন ও সিঙ্ক' : 'Offline & Sync'}</span>
          {pendingActions.length > 0 && (
            <span className="ml-1 w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('dropout')}
          className={`flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'dropout'
              ? 'border-[#2DD4BF] text-[#2DD4BF] bg-[#133240]/40'
              : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#133240]/20'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>3. {isBn ? 'ড্রপআউট প্রতিরোধ ও আইভিআর' : 'Dropout Prevention & IVR'}</span>
        </button>

        <button
          onClick={() => setActiveTab('manager')}
          className={`flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'manager'
              ? 'border-[#2DD4BF] text-[#2DD4BF] bg-[#133240]/40'
              : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#133240]/20'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>4. {isBn ? 'ম্যানেজার ড্যাশবোর্ড' : 'Manager Dashboard'}</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`hidden lg:flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-[#2DD4BF] text-[#2DD4BF] bg-[#133240]/40'
              : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#133240]/20'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>{isBn ? 'এক নজরে সব' : 'All-in-One Grid'}</span>
        </button>
      </div>
    </div>
  );
};
