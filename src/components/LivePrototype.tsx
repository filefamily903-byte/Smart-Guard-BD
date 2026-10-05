import React from 'react';
import { PrototypeProvider, usePrototype } from '../context/PrototypeContext';
import { Language } from '../types';
import { PrototypeTopBar } from './prototype/PrototypeTopBar';
import { FieldAppPhone } from './prototype/FieldAppPhone';
import { OfflineSyncModule } from './prototype/OfflineSyncModule';
import { DropoutPreventionModule } from './prototype/DropoutPreventionModule';
import { ManagerDashboardModule } from './prototype/ManagerDashboardModule';
import { GuidedTourModal } from './prototype/GuidedTourModal';
import { AdminDatabaseConsole } from './prototype/AdminDatabaseConsole';
import { Sparkles, LayoutGrid, Smartphone, Database, ShieldAlert, BarChart3 } from 'lucide-react';

interface LivePrototypeProps {
  lang: Language;
}

const LivePrototypeContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const { activeTab } = usePrototype();
  const isBn = lang === 'bn';

  return (
    <div className="w-full flex flex-col">
      {/* 1. Global Simulation Controller & Navigation */}
      <PrototypeTopBar lang={lang} />

      {/* 2. Main Interactive Workspace */}
      <div className="w-full bg-[#F8FAFC] py-8 md:py-12 px-4 md:px-8 border-b border-[#E2E8F0] min-h-[700px]">
        <div className="max-w-[1240px] mx-auto">
          {/* Active View Container */}
          {activeTab === 'field-app' && (
            <div className="flex flex-col items-center justify-center animate-in fade-in duration-200">
              <div className="text-center max-w-[600px] mb-6">
                <span className="eyebrow-label block mb-1">
                  {isBn ? 'মডিউল ১: মোবাইল ফোন ফিল্ড ক্লায়েন্ট' : 'MODULE 1: FIELD WORKER PHONE CLIENT'}
                </span>
                <h3 className="display-h3 text-[#0B2530]">
                  {isBn ? 'স্মার্টগার্ড মাঠপর্যায় টিকাদান ইন্টারফেস' : 'Wearable Pendant Scanner & Outreach Logger'}
                </h3>
                <p className="text-[14px] text-[#64748B] mt-1">
                  {isBn
                    ? 'কালা সুতা এনএফসি ট্যাগ স্ক্যান, নতুন নবজাতক ডিজিএইচএস নিবন্ধন এবং <৬০ সেকেন্ডে হারানো ট্যাগ রি-রাইট।'
                    : 'Interactive NFC scan, newborn DGHS VaxEPI verification, dose signatures, and lost-tag rewrite under 60 seconds.'}
                </p>
              </div>
              <FieldAppPhone lang={lang} />
            </div>
          )}

          {activeTab === 'offline-sync' && (
            <div className="animate-in fade-in duration-200">
              <OfflineSyncModule lang={lang} />
            </div>
          )}

          {activeTab === 'dropout' && (
            <div className="animate-in fade-in duration-200">
              <DropoutPreventionModule lang={lang} />
            </div>
          )}

          {activeTab === 'manager' && (
            <div className="animate-in fade-in duration-200">
              <ManagerDashboardModule lang={lang} />
            </div>
          )}

          {/* All-in-One Grid View (Desktop & Tablet) */}
          {activeTab === 'all' && (
            <div className="space-y-10 animate-in fade-in duration-200">
              <div className="text-center max-w-[700px] mx-auto mb-6">
                <span className="eyebrow-label block mb-1">
                  {isBn ? 'সমন্বিত ইকোসিস্টেম গ্রিড' : 'CONNECTED MULTI-MODULE SIMULATION'}
                </span>
                <h3 className="display-h3 text-[#0B2530]">
                  {isBn ? 'এক নজরে চারটি সংযুক্ত মডিউল' : 'All 4 SmartGuard BD Modules Sharing One State Store'}
                </h3>
                <p className="text-[14px] text-[#64748B] mt-1">
                  Actions in the Field App phone immediately propagate to the Offline Queue, Dropout Engine, and Manager Dashboard.
                </p>
              </div>

              {/* Split Row: Phone on Left, Offline & Dropout on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-3 px-2">
                    <span className="font-heading font-bold text-[15px] text-[#0B2530] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#0F766E]" />
                      <span>1. Field App Phone</span>
                    </span>
                    <span className="text-[11px] font-semibold text-[#0F766E] bg-[#F0FDFA] px-2 py-0.5 rounded border border-[#0F766E]/20">
                      Live Client
                    </span>
                  </div>
                  <FieldAppPhone lang={lang} />
                </div>

                <div className="lg:col-span-7 space-y-8">
                  {/* Module 2: Offline Sync Preview */}
                  <div>
                    <div className="w-full flex items-center justify-between mb-3 px-2">
                      <span className="font-heading font-bold text-[15px] text-[#0B2530] flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-[#0F766E]" />
                        <span>2. Offline Edge & Timestamp Conflict</span>
                      </span>
                    </div>
                    <OfflineSyncModule lang={lang} />
                  </div>

                  {/* Module 3: Dropout Prevention Preview */}
                  <div>
                    <div className="w-full flex items-center justify-between mb-3 px-2">
                      <span className="font-heading font-bold text-[15px] text-[#0B2530] flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
                        <span>3. Dropout Risk Engine & IVR Call</span>
                      </span>
                    </div>
                    <DropoutPreventionModule lang={lang} />
                  </div>
                </div>
              </div>

              {/* Bottom Full-Width: Manager Dashboard */}
              <div className="pt-6 border-t border-[#E2E8F0]">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <span className="font-heading font-bold text-[17px] text-[#0B2530] flex items-center gap-1.5">
                    <BarChart3 className="w-5 h-5 text-[#0F766E]" />
                    <span>4. Upazila & National Manager Telemetry Dashboard</span>
                  </span>
                </div>
                <ManagerDashboardModule lang={lang} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Guided Tour Modal */}
      <GuidedTourModal lang={lang} />

      {/* 4. Full-Screen Admin Database Console (IndexedDB: smartguard_demo) */}
      <AdminDatabaseConsole />
    </div>
  );
};

export const LivePrototype: React.FC<LivePrototypeProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  return (
    <section id="demo" className="w-full bg-white border-b border-[#E2E8F0] relative scroll-mt-16">
      {/* Prototype Provider wraps all shared state */}
      <PrototypeProvider>
        {/* Section Header */}
        <div className="pt-16 pb-8 md:pt-20 md:pb-10 max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E] text-[12.5px] font-bold mb-3 border border-[#0F766E]/20 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#0F766E]" />
            <span>LIVE INTERACTIVE PROTOTYPE</span>
          </div>

          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[22ch] mx-auto">
            {isBn ? 'স্মার্টগার্ড বিডি লাইভ প্রোটোটাইপ টেস্টবেড' : 'Experience the Working SmartGuard BD System'}
          </h2>

          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7] max-w-[720px] mx-auto">
            {isBn
              ? 'একটি কেন্দ্রীয় স্টেট স্টোরের মাধ্যমে সংযুক্ত চারটি কার্যকর মডিউল: মোবাইল ফিল্ড অ্যাপ, অফলাইন সিঙ্ক, স্বয়ংক্রিয় আইভিআর ভয়েস কল এবং কোল্ড চেইন মনিটরিং ড্যাশবোর্ড।'
              : 'A fully functional simulated testbed connecting the frontline CHW mobile app, IndexedDB offline engine, automated Bangla IVR voice calls, and cold-chain telemetry.'}
          </p>
        </div>

        {/* Prototype Body Content */}
        <LivePrototypeContent lang={lang} />
      </PrototypeProvider>
    </section>
  );
};
