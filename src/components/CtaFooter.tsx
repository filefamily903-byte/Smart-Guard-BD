import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ArrowRight, Mail, Shield, Heart } from 'lucide-react';

interface CtaFooterProps {
  lang: Language;
  onOpenContact: () => void;
}

export const CtaFooter: React.FC<CtaFooterProps> = ({ lang, onOpenContact }) => {
  const t = translations[lang].footer;
  const nav = translations[lang].nav;

  return (
    <footer className="w-full">
      {/* ---------------------------------------------------- */}
      {/* 12. TEAL CALL-TO-ACTION BANNER */}
      {/* ---------------------------------------------------- */}
      <section id="cta" className="w-full bg-[#0F766E] py-16 md:py-20 text-white relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-[12px] font-bold tracking-wider uppercase mb-6 border border-white/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Join the Health-Tech Movement</span>
          </div>

          <h2 className="font-heading font-extrabold text-[32px] md:text-[46px] leading-[1.2] max-w-[760px] mb-6">
            Let's protect every child's immunization record.
          </h2>

          <p className="text-[17px] md:text-[18px] text-white/80 max-w-[620px] mb-8 leading-relaxed">
            Partner with us to pilot SmartGuard BD across rural haor wetlands, urban informal settlements, and private clinics.
          </p>

          <button
            onClick={onOpenContact}
            className="h-[50px] px-8 rounded-xl bg-white text-[#0F766E] hover:bg-[#F0FDFA] font-bold text-[15px] shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center gap-2.5 cursor-pointer"
          >
            <span>Contact the Team</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* MAIN DARK NAVY FOOTER (#0B2530) */}
      {/* ---------------------------------------------------- */}
      <div className="w-full bg-[#0B2530] text-[#94A3B8] pt-16 pb-12 border-t border-[#1E293B]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1E293B]">
            {/* Col 1: Brand Wordmark & Overview */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <a href="#hero" className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0F766E] text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-heading font-extrabold text-[20px] text-white tracking-tight">
                  SmartGuard<span className="text-[#2DD4BF]">BD</span>
                </span>
              </a>

              <p className="text-[14px] text-[#94A3B8] leading-relaxed max-w-[380px] mb-4">
                {t.desc}
              </p>

              <div className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B] bg-[#1E293B] px-3 py-1.5 rounded-lg border border-[#334155]">
                <span>Status:</span>
                <span className="text-[#2DD4BF] font-semibold">Phase 1 Innovation Concept</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="lg:col-span-3 flex flex-col">
              <h4 className="font-heading font-bold text-[15px] text-white uppercase tracking-wider mb-4 whitespace-nowrap">
                {t.navTitle}
              </h4>
              <div className="flex flex-col gap-2.5 text-[14px]">
                <a href="#problem" className="hover:text-white transition-colors">{nav.problem}</a>
                <a href="#solution" className="hover:text-white transition-colors">{nav.solution}</a>
                <a href="#how-it-works" className="hover:text-white transition-colors">{nav.howItWorks}</a>
                <a href="#pendant" className="hover:text-white transition-colors">{nav.pendant}</a>
                <a href="#impact" className="hover:text-white transition-colors">{nav.impact}</a>
                <a href="#business" className="hover:text-white transition-colors">{nav.business}</a>
                <a href="#team" className="hover:text-white transition-colors">{nav.team}</a>
              </div>
            </div>

            {/* Col 3: Tech & Standards */}
            <div className="lg:col-span-2 flex flex-col">
              <h4 className="font-heading font-bold text-[15px] text-white uppercase tracking-wider mb-4 whitespace-nowrap">
                {t.techTitle}
              </h4>
              <div className="flex flex-col gap-2.5 text-[14px]">
                <span className="hover:text-white transition-colors">VaxEPI & DHIS2 Sync</span>
                <span className="hover:text-white transition-colors">ISO/IEC 14443 Type A</span>
                <span className="hover:text-white transition-colors">IP68 Medical Silicone</span>
                <span className="hover:text-white transition-colors">ThingsBoard IoT Core</span>
                <span className="hover:text-white transition-colors">AES-256 Storage</span>
              </div>
            </div>

            {/* Col 4: Official Contact Placeholder */}
            <div className="lg:col-span-2 flex flex-col">
              <h4 className="font-heading font-bold text-[15px] text-white uppercase tracking-wider mb-4 whitespace-nowrap">
                {t.contactTitle}
              </h4>
              <div className="flex flex-col gap-2 text-[14px]">
                <a href="mailto:fk361542@gmail.com" className="text-white font-medium hover:text-[#2DD4BF] transition-colors">
                  fk361542@gmail.com
                </a>
                <span>Dhaka, Bangladesh</span>
                <button
                  onClick={onOpenContact}
                  className="mt-2 text-[13px] text-[#2DD4BF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send inquiry</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#64748B]">
            <div>
              <p className="font-semibold text-white/80">
                {t.subline}
              </p>
              <p className="text-[12px] mt-0.5">
                {t.disclaimer}
              </p>
            </div>

            <div className="text-right">
              <span>© 2026 SmartGuard BD. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
