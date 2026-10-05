import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Flame, GraduationCap, Award, Printer, CheckCircle } from 'lucide-react';

interface AdoptionProps {
  lang: Language;
}

export const Adoption: React.FC<AdoptionProps> = ({ lang }) => {
  const t = translations[lang].adoption;

  const steps = [
    {
      icon: Flame,
      num: 'Phase 1',
      title: t.step1Title,
      desc: t.step1Desc,
    },
    {
      icon: GraduationCap,
      num: 'Phase 2',
      title: t.step2Title,
      desc: t.step2Desc,
    },
    {
      icon: Award,
      num: 'Phase 3',
      title: t.step3Title,
      desc: t.step3Desc,
    },
    {
      icon: Printer,
      num: 'Phase 4',
      title: t.step4Title,
      desc: t.step4Desc,
    },
  ];

  return (
    <section id="adoption" className="w-full bg-white py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* 4 Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card-base p-7 bg-[#F8FAFC] flex flex-col justify-between h-full relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-[#0F766E] border border-[#E2E8F0]">
                      {item.num}
                    </span>
                  </div>

                  <h3 className="display-h3 text-[#0B2530] mb-2.5">{item.title}</h3>
                  <p className="text-[14.5px] text-[#64748B] leading-[1.65]">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Adoption Callout: Automated Month-End Printing */}
        <div className="rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/25 p-6 md:p-8 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shrink-0">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-[17px] text-[#0B2530] mb-1">
              Zero Double-Entry Burden for Health Assistants (HA & FWA)
            </h4>
            <p className="text-[14.5px] text-[#475569] leading-relaxed">
              At the end of each month, the system auto-generates and prints the standard DGHS Government Paper Register (EPI Khata). Health workers avoid hours of handwriting tallies by candlelight while government audit requirements remain 100% satisfied.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
