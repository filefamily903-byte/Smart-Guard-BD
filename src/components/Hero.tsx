import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeroProps {
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ lang }) => {
  const t = translations[lang].hero;

  return (
    <section id="hero" className="w-full bg-[#F0FDFA] py-16 md:py-24 border-b border-[#E2E8F0] relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#0F766E]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#0F766E]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (Content) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#0F766E]/20 text-[#0F766E] shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
              <span className="eyebrow-label">{t.eyebrow}</span>
            </div>

            {/* H1 Headline */}
            <h1 className="display-h1 text-[#0B2530] mb-6 max-w-[700px] [text-wrap:balance]">
              {t.h1}
            </h1>

            {/* Subtitle */}
            <p className="text-[17px] md:text-[18px] text-[#334155] leading-[1.7] mb-8 max-w-[640px]">
              {t.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-10">
              <a
                href="#how-it-works"
                className="h-[48px] px-7 rounded-[12px] text-[15px] font-semibold bg-[#0F766E] text-white hover:bg-[#115E59] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E] whitespace-nowrap"
              >
                <span>{t.btnPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#demo"
                className="h-[48px] px-6 rounded-[12px] text-[15px] font-semibold text-[#0F766E] bg-white border border-[#0F766E]/30 hover:bg-[#F0FDFA] hover:border-[#0F766E] flex items-center justify-center gap-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
                <span>{t.btnSecondary}</span>
              </a>
              <PWAInstallButton lang={lang} variant="hero" />
            </div>

            {/* 3 Single-line Stat Chips */}
            <div className="pt-6 border-t border-[#0F766E]/15 w-full">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="text-[13px] font-bold text-[#0B2530] whitespace-nowrap">{t.stat1Label}</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span className="text-[13px] font-bold text-[#0B2530] whitespace-nowrap">{t.stat2Label}</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <span className="text-[14px] font-extrabold text-[#0F766E] shrink-0">-41%</span>
                  <span className="text-[13px] font-bold text-[#0B2530] whitespace-nowrap">{t.stat3Label}</span>
                </div>
              </div>
              <p className="text-[12px] text-[#64748B] mt-2.5">
                *{t.statFootnote}
              </p>
            </div>
          </div>

          {/* Right Column: Custom SVG Illustration (Enlarged by ~30%) */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            {/* Soft Mint Gradient Blob */}
            <div className="w-[380px] h-[380px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-[#99F6E4]/40 via-[#CCFBF1]/50 to-white/70 absolute -z-10 blur-xl" />

            {/* Floating SVG Device + Pendant Scanner Stage */}
            <div className="animate-float relative w-full max-w-[500px] flex items-center justify-center p-2">
              <svg viewBox="0 0 400 460" className="w-full h-auto drop-shadow-xl select-none" fill="none">
                {/* Defs for gradients & filters */}
                <defs>
                  <linearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0B2530" />
                    <stop offset="100%" stopColor="#1E293B" />
                  </linearGradient>
                  <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="100%" stopColor="#F0FDFA" />
                  </linearGradient>
                  <linearGradient id="pendantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#115E59" />
                    <stop offset="100%" stopColor="#0F766E" />
                  </linearGradient>
                </defs>

                {/* Smartphone Shell */}
                <rect x="50" y="30" width="220" height="380" rx="34" fill="url(#phoneBody)" stroke="#334155" strokeWidth="3" />
                {/* Screen */}
                <rect x="62" y="44" width="196" height="352" rx="24" fill="url(#screenGrad)" />

                {/* Phone Speaker & Camera Notch */}
                <rect x="125" y="52" width="70" height="8" rx="4" fill="#0B2530" />
                <circle cx="112" cy="56" r="3" fill="#334155" />

                {/* Screen UI: SmartGuard Header */}
                <rect x="74" y="74" width="172" height="36" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
                <circle cx="92" cy="92" r="10" fill="#0F766E" />
                <path d="M89 92l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="110" y="85" width="70" height="6" rx="3" fill="#0B2530" />
                <rect x="110" y="94" width="45" height="5" rx="2.5" fill="#64748B" />

                {/* Screen UI: Scanner Radar Rings */}
                <circle cx="160" cy="200" r="45" fill="none" stroke="#0F766E" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                <circle cx="160" cy="200" r="62" fill="none" stroke="#0F766E" strokeWidth="1.5" opacity="0.25" />
                <circle cx="160" cy="200" r="28" fill="#0F766E" fillOpacity="0.08" />

                {/* NFC Waves emitting from phone */}
                <path d="M190 180c10 12 10 28 0 40" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M200 172c15 17 15 39 0 56" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

                {/* Screen Card Bottom */}
                <rect x="74" y="270" width="172" height="110" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                <rect x="86" y="284" width="60" height="7" rx="3.5" fill="#0B2530" />
                <rect x="86" y="295" width="110" height="5" rx="2.5" fill="#64748B" />
                {/* Vaccine Status Chips on screen */}
                <rect x="86" y="312" width="42" height="16" rx="4" fill="#DCFCE7" />
                <text x="94" y="324" fill="#16A34A" fontSize="9" fontWeight="700" fontFamily="sans-serif">BCG ✓</text>
                <rect x="134" y="312" width="52" height="16" rx="4" fill="#DCFCE7" />
                <text x="142" y="324" fill="#16A34A" fontSize="9" fontWeight="700" fontFamily="sans-serif">Penta ✓</text>
                <rect x="86" y="336" width="60" height="16" rx="4" fill="#FEF3C7" />
                <text x="92" y="348" fill="#D97706" fontSize="9" fontWeight="700" fontFamily="sans-serif">MR-1 Due</text>

                {/* --- Kala Dhaga Wearable Pendant & Cord --- */}
                {/* Traditional Black Braided Cord */}
                <path d="M280 40 C 270 120, 240 160, 245 220" stroke="#0B2530" strokeWidth="5" strokeLinecap="round" />
                <path d="M282 42 C 272 122, 242 162, 247 222" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                {/* Red Thread Accent Bead / Knot (Kala Dhaga Tradition) */}
                <circle cx="246" cy="216" r="6" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1" />
                <circle cx="246" cy="204" r="4.5" fill="#0B2530" />

                {/* Medical Grade Silicone Pendant Body */}
                <g filter="url(#shadow)">
                  <path d="M246 222 C 230 236, 216 260, 222 284 C 228 308, 264 308, 270 284 C 276 260, 262 236, 246 222 Z" fill="url(#pendantGrad)" stroke="#115E59" strokeWidth="2" />
                  {/* Inner NFC Antenna Coil graphic on Pendant */}
                  <ellipse cx="246" cy="275" rx="14" ry="17" fill="none" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="3 2" />
                  <ellipse cx="246" cy="275" rx="8" ry="10" fill="none" stroke="#A7F3D0" strokeWidth="1.5" />
                  {/* Center Shield Icon */}
                  <path d="M246 268 L241 271 v5 c0 4 2.5 6.5 5 7.5 c2.5 -1 5 -3.5 5 -7.5 v-5 Z" fill="#FFFFFF" />
                  <circle cx="246" cy="275" r="1.5" fill="#0F766E" />
                </g>

                {/* Live RF Scan Glow Indicator Tag */}
                <rect x="235" y="325" width="112" height="28" rx="14" fill="#0F766E" />
                <circle cx="249" cy="339" r="4" fill="#99F6E4" />
                <text x="260" y="343" fill="#FFFFFF" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">NFC SCANNING</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
