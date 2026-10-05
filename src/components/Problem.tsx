import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Database, UserX, FileText, ThermometerSnowflake, Info } from 'lucide-react';

interface ProblemProps {
  lang: Language;
}

export const Problem: React.FC<ProblemProps> = ({ lang }) => {
  const t = translations[lang].problem;

  const cards = [
    {
      icon: Database,
      title: t.card1Title,
      desc: t.card1Desc,
    },
    {
      icon: UserX,
      title: t.card2Title,
      desc: t.card2Desc,
    },
    {
      icon: FileText,
      title: t.card3Title,
      desc: t.card3Desc,
    },
    {
      icon: ThermometerSnowflake,
      title: t.card4Title,
      desc: t.card4Desc,
    },
  ];

  return (
    <section id="problem" className="w-full bg-white py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Section Header (Centered) */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* 4 Cards Grid with row-aligned titles and descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7 mb-12">
          {cards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card-base p-7 md:p-8 flex flex-col justify-between h-full group bg-white"
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/15 flex items-center justify-center text-[#0F766E] mb-6 group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-200 shrink-0">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="display-h3 text-[#0B2530] mb-3 min-h-[3.25rem] flex items-start">{item.title}</h3>
                  <p className="text-[15px] text-[#475569] leading-[1.7] flex-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlighted Callout Box */}
        {/* <!-- (source needed: Bangladesh Urban Health Survey / Private Provider Immunization Analysis) --> */}
        <div className="w-full rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/25 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Info className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[17px] md:text-[18px] font-semibold text-[#0B2530] leading-[1.5] mb-1">
              "{t.callout}"
            </p>
            <span className="text-[13px] text-[#0F766E] font-medium tracking-wide">
              * {t.calloutSource}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
