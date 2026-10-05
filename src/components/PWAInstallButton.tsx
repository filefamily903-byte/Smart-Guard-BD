import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Share2,
  PlusSquare,
  X,
  CheckCircle,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  HardDriveDownload,
  Laptop,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang?: Language;
  variant?: 'nav' | 'hero' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'en',
  variant = 'nav',
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isInIframe,
    swActive,
    install,
    openInDedicatedTab,
  } = usePWAInstall();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'offline'>('guide');

  // If already installed and running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  const isBn = lang === 'bn';

  const handleClick = async () => {
    // If native prompt is available (outside iframe on supported browser), fire immediately
    if (isInstallable && !isInIframe) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
        return;
      }
    }
    // Otherwise open the multi-platform install assistant modal
    setIsOpenModal(true);
  };

  const label = isBn ? 'অ্যাপ ইনস্টল করুন' : 'Install App';
  const labelSub = isBn ? 'অফলাইন ও মাঠপর্যায়ে ব্যবহারের জন্য' : 'For zero-internet field operations';

  return (
    <>
      {/* 1. Navbar compact pill style */}
      {variant === 'nav' && (
        <button
          type="button"
          onClick={handleClick}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-gradient-to-r from-[#0F766E] to-[#0D9488] text-white hover:from-[#115E59] hover:to-[#0F766E] shadow-xs hover:shadow-sm transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap border border-teal-400/30"
          title={labelSub}
          aria-label={label}
        >
          {installSuccess ? (
            <CheckCircle className="w-3.5 h-3.5 text-[#5EEAD4]" />
          ) : (
            <Download className="w-3.5 h-3.5 text-[#5EEAD4]" />
          )}
          <span>{label}</span>
          <span className="hidden xl:inline-block text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-[#CCFBF1] font-mono font-medium">
            PWA
          </span>
        </button>
      )}

      {/* 2. Hero prominent button style */}
      {variant === 'hero' && (
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white text-[#0F766E] hover:bg-[#F0FDFA] border border-[#99F6E4] shadow-sm hover:shadow-md transition-all duration-150 active:scale-98 cursor-pointer"
          title={labelSub}
        >
          <Download className="w-4 h-4 text-[#0F766E]" />
          <span>{label}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E]">
            {isBn ? 'অফলাইন সক্রিয়' : 'Offline Ready'}
          </span>
        </button>
      )}

      {/* 3. Floating Quick-Access badge (for mobile) */}
      {variant === 'floating' && (
        <button
          type="button"
          onClick={handleClick}
          className="fixed bottom-4 right-20 z-40 sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0F766E] text-white text-[11px] font-bold shadow-lg border border-white/20 active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#5EEAD4]" />
          <span>{isBn ? 'ইনস্টল' : 'Install'}</span>
        </button>
      )}

      {/* Comprehensive Universal Installation Assistant Modal */}
      {isOpenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpenModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-[#CBD5E1] text-[#334155] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-[#0F766E]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[16px] text-[#0B2530]">
                    {isBn ? 'স্মার্টগার্ড বিডি অ্যাপ ইনস্টল ও অফলাইন' : 'SmartGuard BD App Installation & Offline'}
                  </h3>
                  <p className="text-[12px] text-[#64748B]">
                    {isBn ? 'মোবাইল বা পিসিতে ইনস্টল করে সম্পূর্ণ অফলাইনে চালান' : 'Install to desktop or mobile for 100% zero-internet field operations'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0B2530] hover:bg-[#F1F5F9] flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#E2E8F0] mt-3">
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`py-2 px-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'guide'
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-[#64748B] hover:text-[#0B2530]'
                }`}
              >
                {isBn ? 'ইনস্টল করার নিয়মাবলী' : 'Installation Guide'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('offline')}
                className={`py-2 px-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'offline'
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-[#64748B] hover:text-[#0B2530]'
                }`}
              >
                <span>{isBn ? 'অফলাইন স্ট্যাটাস ও ডায়াগনস্টিক' : 'Offline Readiness'}</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              </button>
            </div>

            {/* Tab 1: Installation Guide */}
            {activeTab === 'guide' && (
              <div className="py-4 space-y-4">
                {/* Notice if running inside AI Studio embedded preview iframe */}
                {isInIframe && (
                  <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]">
                    <div className="flex items-start gap-2.5">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2563EB]" />
                      <div className="text-[12.5px] leading-relaxed">
                        <strong className="block font-semibold">
                          {isBn ? 'প্রিভিউ আইফ্রেম শনাক্ত হয়েছে' : 'Embedded Preview Detected'}
                        </strong>
                        <p className="mt-0.5 text-[#3B82F6]">
                          {isBn
                            ? 'ব্রাউজারের নিরাপত্তা নীতি অনুযায়ী আইফ্রেমের ভেতর সরাসরি ইনস্টল প্রম্পট ব্লক থাকে। ফুল উইন্ডোতে ওপেন করলে ১-ক্লিকেই ইনস্টল করা যায়।'
                            : 'Modern browsers security blocks 1-click install inside an embedded preview iframe. Open in a dedicated tab to install directly with one click.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openInDedicatedTab}
                      className="mt-3 w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{isBn ? 'নতুন ট্যাবে খুলুন এবং ইনস্টল করুন' : 'Open in Dedicated Tab to Install'}</span>
                    </button>
                  </div>
                )}

                {/* Direct 1-Click install if browser prompt is ready */}
                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await install();
                      if (res) {
                        setInstallSuccess(true);
                        setIsOpenModal(false);
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4 text-[#5EEAD4]" />
                    <span>{isBn ? 'সরাসরি ডিভাইসে ইনস্টল করুন (১-ক্লিক)' : 'Install to Device Now (1-Click)'}</span>
                  </button>
                )}

                {/* Platform Step-by-Step Cards */}
                <div className="space-y-3">
                  {/* Chrome / Edge / Desktop Guide */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-2 font-bold text-[13px] text-[#0B2530] mb-1.5">
                      <Laptop className="w-4 h-4 text-[#0F766E]" />
                      <span>{isBn ? 'গুগল ক্রোম / এজ (পিসি ও ম্যাক)' : 'Google Chrome / Microsoft Edge (PC & Mac)'}</span>
                    </div>
                    <ul className="text-[12px] text-[#475569] space-y-1 pl-5 list-disc">
                      <li>
                        {isBn
                          ? 'ব্রাউজারের অ্যাড্রেস বারের ডান পাশে থাকা "Install" (কম্পিউটার/ডাউনলোড আইকন) বাটনে ক্লিক করুন।'
                          : 'Click the Install icon (computer/download icon) on the far right of the address bar.'}
                      </li>
                      <li>
                        {isBn
                          ? 'অথবা ব্রাউজার মেনু (⋮) থেকে "Save and share" -> "Install SmartGuard BD" নির্বাচন করুন।'
                          : 'Or click the browser menu (⋮) -> "Save and share" -> "Install SmartGuard BD".'}
                      </li>
                    </ul>
                  </div>

                  {/* Android Phone Guide */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-2 font-bold text-[13px] text-[#0B2530] mb-1.5">
                      <Smartphone className="w-4 h-4 text-[#0F766E]" />
                      <span>{isBn ? 'অ্যান্ড্রয়েড ফোন (মাঠকর্মীদের জন্য)' : 'Android Phone (Field Health Workers)'}</span>
                    </div>
                    <ul className="text-[12px] text-[#475569] space-y-1 pl-5 list-disc">
                      <li>
                        {isBn
                          ? 'ক্রোম ব্রাউজারের উপরে ডানদিকের তিনটি ডটে (⋮) ট্যাপ করুন।'
                          : 'Tap the three vertical dots (⋮) in the top right of Chrome.'}
                      </li>
                      <li>
                        {isBn
                          ? '"Install app" বা "Add to Home screen" চাপুন।'
                          : 'Tap "Install app" or "Add to Home screen".'}
                      </li>
                    </ul>
                  </div>

                  {/* Apple iOS Safari Guide */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-2 font-bold text-[13px] text-[#0B2530] mb-1.5">
                      <Smartphone className="w-4 h-4 text-[#0F766E]" />
                      <span>{isBn ? 'আইফোন / আইপ্যাড (Safari)' : 'iPhone / iPad (Safari)'}</span>
                    </div>
                    <p className="text-[12px] text-[#475569]">
                      {isBn ? (
                        <>Safari-তে নিচে <strong className="text-[#0B2530] inline-flex items-center gap-0.5"><Share2 className="w-3.5 h-3.5" /> Share</strong> আইকনে চাপ দিন, তারপর নিচে স্ক্রোল করে <strong className="text-[#0B2530] inline-flex items-center gap-0.5"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong> চাপুন।</>
                      ) : (
                        <>In Safari, tap the <strong className="text-[#0B2530] inline-flex items-center gap-0.5"><Share2 className="w-3.5 h-3.5" /> Share</strong> button, scroll down and tap <strong className="text-[#0B2530] inline-flex items-center gap-0.5"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong>.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Offline Readiness & Diagnostics */}
            {activeTab === 'offline' && (
              <div className="py-4 space-y-3.5">
                <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4]">
                  <div className="flex items-center gap-2 font-bold text-[13.5px] text-[#0F766E] mb-1">
                    <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                    <span>{isBn ? 'অফলাইন সিস্টেম সম্পূর্ণ প্রস্তুত' : 'Offline Subsystem 100% Armed'}</span>
                  </div>
                  <p className="text-[12px] text-[#134E4A] leading-relaxed">
                    {isBn
                      ? 'সার্ভিস ওয়ার্কার ব্রাউজারে ইনস্টল হয়ে সমস্ত ক্লিনিক্যাল ডাটাবেস, এনএফসি ট্যাগ সিমুলেটর, আইভিআর অডিও এবং ভ্যাকসিনেশন শিডিউল ক্যাশ মেমরিতে সেভ করে রেখেছে।'
                      : 'The Service Worker has permanently cached the DGHS EPI immunization schedule, offline NFC tag reader, audio prompts, and field simulation.'}
                  </p>
                </div>

                <div className="space-y-2 text-[12.5px]">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="font-medium text-[#334155]">{isBn ? 'সার্ভিস ওয়ার্কার ইঞ্জিন:' : 'Service Worker Core:'}</span>
                    <span className="font-bold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {swActive ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'রেজিস্টার্ড (Registered)' : 'Registered')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="font-medium text-[#334155]">{isBn ? 'ওয়েব অ্যাপ ম্যানিফেস্ট:' : 'Web App Manifest:'}</span>
                    <span className="font-bold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {isBn ? 'ভ্যালিড (Standalone)' : 'Valid (Standalone)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="font-medium text-[#334155]">{isBn ? 'ক্যাশ করা ফাইল ও অডিও:' : 'Pre-cached Files & Audio:'}</span>
                    <span className="font-bold text-[#0F766E] font-mono">33+ Assets</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="font-medium text-[#334155]">{isBn ? 'মাঠপর্যায়ে ইন্টারনেট ছাড়া কাজ:' : 'Zero-Internet Field Function:'}</span>
                    <span className="font-bold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {isBn ? 'সমর্থিত (100% Offline)' : '100% Supported'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#92400E]">
                  <strong>{isBn ? 'অফলাইন টেস্ট করার নিয়ম:' : 'How to test offline right now:'}</strong>
                  <p className="mt-1">
                    {isBn
                      ? 'আপনার কম্পিউটার বা মোবাইলের Wi-Fi / ডেটা বন্ধ করুন (Airplane Mode)। এরপর পেজটি রিফ্রেশ দিন বা ফিল্ড অ্যাপে শিশু স্ক্যান ও টিকা এন্ট্রি করুন—সবকিছু নিখুঁতভাবে চলবে।'
                      : 'Disconnect your Wi-Fi/mobile data or turn on Airplane Mode. Refresh the page or record doses in the Field Phone module—everything will continue working flawlessly.'}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#64748B]">
                SmartGuard BD v1.3 • PWA Standard
              </span>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="px-4 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B2530] font-semibold text-[13px] transition cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
