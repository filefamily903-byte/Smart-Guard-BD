import React, { useState } from 'react';
import { Language, Hotspot } from '../types';
import { translations, sampleVaccineHistory } from '../data/translations';
import { ShieldCheck, Lock, UserCheck, RotateCcw, CheckCircle2, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface PendantDemoProps {
  lang: Language;
}

export const PendantDemo: React.FC<PendantDemoProps> = ({ lang }) => {
  const t = translations[lang].pendant;
  const [activeHotspot, setActiveHotspot] = useState<string | null>('hs1');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'scanned'>('idle');

  const hotspots: Hotspot[] = [
    {
      id: 'hs1',
      x: 180,
      y: 260,
      titleEn: t.hotspot1Title,
      titleBn: t.hotspot1Title,
      descEn: t.hotspot1Desc,
      descBn: t.hotspot1Desc,
    },
    {
      id: 'hs2',
      x: 200,
      y: 320,
      titleEn: t.hotspot2Title,
      titleBn: t.hotspot2Title,
      descEn: t.hotspot2Desc,
      descBn: t.hotspot2Desc,
    },
    {
      id: 'hs3',
      x: 240,
      y: 350,
      titleEn: t.hotspot3Title,
      titleBn: t.hotspot3Title,
      descEn: t.hotspot3Desc,
      descBn: t.hotspot3Desc,
    },
    {
      id: 'hs4',
      x: 160,
      y: 380,
      titleEn: t.hotspot4Title,
      titleBn: t.hotspot4Title,
      descEn: t.hotspot4Desc,
      descBn: t.hotspot4Desc,
    },
  ];

  const handleStartScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('scanned');
    }, 1800);
  };

  const handleResetScan = () => {
    setScanState('idle');
  };

  const selectedHotspot = hotspots.find((h) => h.id === activeHotspot) || hotspots[0];

  return (
    <section id="pendant" className="w-full bg-[#F0FDFA] py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* Two-Column Hardware Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
          {/* Left: Large SVG Pendant Diagram with Hotspots */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="card-base bg-white p-6 md:p-8 w-full relative flex flex-col items-center shadow-md">
              <span className="text-[12px] font-bold text-[#0F766E] uppercase tracking-wider mb-2">
                Interactive Hardware Diagram (Click Hotspots)
              </span>

              <div className="relative w-full max-w-[360px] h-[380px] flex items-center justify-center select-none">
                <svg viewBox="0 0 380 420" className="w-full h-full" fill="none">
                  {/* Traditional Black Kala Dhaga Thread Cord */}
                  <path d="M190 20 C 140 100, 110 160, 150 240" stroke="#0B2530" strokeWidth="6" strokeLinecap="round" />
                  <path d="M190 20 C 240 100, 270 160, 230 240" stroke="#0B2530" strokeWidth="6" strokeLinecap="round" />
                  
                  {/* Black Braided Details */}
                  <path d="M188 22 C 138 102, 108 162, 148 242" stroke="#334155" strokeWidth="2" strokeDasharray="6 3" />
                  <path d="M192 22 C 242 102, 272 162, 232 242" stroke="#334155" strokeWidth="2" strokeDasharray="6 3" />

                  {/* Kala Dhaga Red Accent Knot Bead (Traditional Protection) */}
                  <circle cx="190" cy="235" r="9" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
                  <circle cx="190" cy="220" r="6" fill="#0B2530" />

                  {/* Medical-grade Silicone Pendant Body (Amulet Shape) */}
                  <defs>
                    <linearGradient id="siliconeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#115E59" />
                      <stop offset="50%" stopColor="#0F766E" />
                      <stop offset="100%" stopColor="#0B2530" />
                    </linearGradient>
                    <filter id="pendantGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F766E" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  <path
                    d="M190 245 C 155 270, 130 315, 145 365 C 160 415, 220 415, 235 365 C 250 315, 225 270, 190 245 Z"
                    fill="url(#siliconeGrad)"
                    stroke="#14B8A6"
                    strokeWidth="2.5"
                    filter="url(#pendantGlow)"
                  />

                  {/* Internal Embedded Copper/Ferrite NFC Antenna Loop */}
                  <ellipse cx="190" cy="345" rx="28" ry="34" fill="none" stroke="#6EE7B7" strokeWidth="2" strokeDasharray="4 2" />
                  <ellipse cx="190" cy="345" rx="20" ry="24" fill="none" stroke="#6EE7B7" strokeWidth="1.8" />
                  <ellipse cx="190" cy="345" rx="12" ry="14" fill="none" stroke="#6EE7B7" strokeWidth="1.5" />

                  {/* Central Encrypted Microchip (NTAG216) */}
                  <rect x="183" y="338" width="14" height="14" rx="3" fill="#042F2E" stroke="#99F6E4" strokeWidth="1.5" />
                  <path d="M187 345h6M190 342v6" stroke="#5EEAD4" strokeWidth="1.5" />

                  {/* Relief SmartGuard Shield Logo Emblem */}
                  <path d="M190 282 L180 287 v10 c0 8 5 13 10 15 c5 -2 10 -7 10 -15 v-10 Z" fill="#FFFFFF" fillOpacity="0.9" />
                  <path d="M185 292l3 3 6-6" stroke="#0F766E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

                  {/* 4 Interactive Hotspot Pins */}
                  {hotspots.map((hs) => {
                    const isSelected = activeHotspot === hs.id;
                    return (
                      <g
                        key={hs.id}
                        className="cursor-pointer transition-transform duration-200 hover:scale-125"
                        onClick={() => setActiveHotspot(hs.id)}
                      >
                        <circle
                          cx={hs.x}
                          cy={hs.y}
                          r={isSelected ? 13 : 10}
                          fill={isSelected ? '#B91C1C' : '#0F766E'}
                          className={isSelected ? 'animate-pulse' : ''}
                        />
                        <circle cx={hs.x} cy={hs.y} r={4} fill="#FFFFFF" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Active Hotspot Explanatory Box */}
              <div className="w-full bg-[#F0FDFA] border border-[#0F766E]/20 rounded-xl p-4 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                  <h4 className="text-[15px] font-bold text-[#0B2530]">
                    {lang === 'en' ? selectedHotspot.titleEn : selectedHotspot.titleBn}
                  </h4>
                </div>
                <p className="text-[13.5px] text-[#475569] leading-relaxed">
                  {lang === 'en' ? selectedHotspot.descEn : selectedHotspot.descBn}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Bullet Features */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex flex-col gap-6">
              {/* Feature 1 */}
              <div className="card-base p-6 bg-white flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="display-h3 text-[#0B2530] mb-1.5">{t.bullet1Title}</h3>
                  <p className="text-[15px] text-[#475569] leading-[1.7]">{t.bullet1Desc}</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card-base p-6 bg-white flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="display-h3 text-[#0B2530] mb-1.5">{t.bullet2Title}</h3>
                  <p className="text-[15px] text-[#475569] leading-[1.7]">{t.bullet2Desc}</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card-base p-6 bg-white flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="display-h3 text-[#0B2530] mb-1.5">{t.bullet3Title}</h3>
                  <p className="text-[15px] text-[#475569] leading-[1.7]">{t.bullet3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* INTERACTIVE DEMO: TAP TO SCAN PHONE SIMULATION */}
        {/* ---------------------------------------------------- */}
        <div id="pendant-simulator" className="w-full bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-10 shadow-lg">
          <div className="text-center max-w-[600px] mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E] text-[12px] font-bold mb-2 border border-[#0F766E]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE FIELD TESTBED SIMULATOR</span>
            </div>
            <h3 className="display-h2 text-[#0B2530] mb-2">{t.demoHeading}</h3>
            <p className="text-[15px] text-[#64748B]">{t.demoSubtitle}</p>
          </div>

          <div className="flex flex-col items-center">
            {/* Action Trigger Button */}
            {scanState === 'idle' && (
              <button
                onClick={handleStartScan}
                className="h-[52px] px-8 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-[16px] flex items-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                <span>{t.tapBtn}</span>
              </button>
            )}

            {/* Scanning State Animation */}
            {scanState === 'scanning' && (
              <div className="flex flex-col items-center py-8">
                <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                  <div className="absolute inset-0 rounded-full bg-[#0F766E]/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-[#0F766E]/30 animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                </div>
                <p className="text-[16px] font-semibold text-[#0F766E] animate-pulse">
                  {t.scanning}
                </p>
                <span className="text-[12px] text-[#64748B] mt-1">Reading UID: 04:A2:88:F1:C9:20 (AES-128)</span>
              </div>
            )}

            {/* Scanned Child Record Display */}
            {scanState === 'scanned' && (
              <div className="w-full max-w-[720px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
                {/* Child Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white font-heading font-extrabold text-[22px] flex items-center justify-center shadow-sm">
                      TH
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-heading font-bold text-[18px] md:text-[20px] text-[#0B2530]">
                          {t.childName}
                        </h4>
                        <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/30">
                          {t.verifiedBadge}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30">
                          Sample data, fictional child
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-[#64748B] mt-0.5">
                        <span>{t.childAge}</span>
                        <span>•</span>
                        <span>{t.motherName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end">
                    <span className="font-mono text-[12px] font-semibold bg-white px-2.5 py-1 rounded border border-[#CBD5E1] text-[#334155]">
                      {t.dhisId}
                    </span>
                    <span className="text-[11px] text-[#64748B] mt-1">Synced via Encrypted SQLite</span>
                  </div>
                </div>

                {/* Vaccine Schedule Timeline */}
                <div className="py-6">
                  <h5 className="text-[14px] font-bold uppercase tracking-wider text-[#334155] mb-4">
                    National Immunization Record (EPI Protocol)
                  </h5>

                  <div className="flex flex-col gap-3">
                    {sampleVaccineHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white border border-[#E2E8F0] gap-2"
                      >
                        <div className="flex items-center gap-3">
                          {item.status === 'done' ? (
                            <div className="w-7 h-7 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          )}

                          <div>
                            <span className="text-[14.5px] font-bold text-[#0B2530] block">
                              {item.vaccine}
                            </span>
                            <span className="text-[12px] text-[#64748B]">
                              {lang === 'en' ? item.targetAgeEn : item.targetAgeBn}
                              {item.batch && ` • Batch: ${item.batch}`}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[12.5px] font-semibold px-2.5 py-1 rounded-lg self-start sm:self-auto ${
                            item.status === 'done'
                              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20'
                              : 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20'
                          }`}
                        >
                          {lang === 'en' ? item.dateOrDueEn : item.dateOrDueBn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset Action */}
                <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[12.5px] text-[#64748B] italic">
                    *{t.prototypeNotice}
                  </span>
                  <button
                    onClick={handleResetScan}
                    className="h-10 px-4 rounded-lg bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9] text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.rescanBtn}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
