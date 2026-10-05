import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Network, PhoneCall, ShieldCheck, Check, Layers } from 'lucide-react';

interface SolutionProps {
  lang: Language;
}

export const Solution: React.FC<SolutionProps> = ({ lang }) => {
  const t = translations[lang].solution;

  const cards = [
    {
      badge: "01",
      icon: Network,
      title: t.card1Title,
      desc: t.card1Desc,
      highlights: [
        "FHIR & REST API gateways",
        "Encrypted RBAC authentication",
        "Automated dual-way VaxEPI sync"
      ]
    },
    {
      badge: "02",
      icon: PhoneCall,
      title: t.card2Title,
      desc: t.card2Desc,
      highlights: [
        "Sylheti & Chittagonian native voice prompts",
        "Automated 56-day overdue escalations",
        "Zero-internet feature phone compatibility"
      ]
    },
    {
      badge: "03",
      icon: ShieldCheck,
      title: t.card3Title,
      desc: t.card3Desc,
      highlights: [
        "Culturally embedded Kala Dhaga design",
        "IP68 waterproof passive silicone body",
        "Laser-etched DataMatrix QR fallback"
      ]
    }
  ];

  return (
    <section id="solution" className="w-full bg-[#F8FAFC] py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* 3 Large Cards Grid with equal row alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="card-base p-8 flex flex-col justify-between h-full bg-white relative overflow-hidden"
              >
                {/* Subtle top indicator */}
                <div className="w-full h-1 bg-gradient-to-r from-[#0F766E] to-[#99F6E4] absolute top-0 left-0" />

                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-[13px] font-extrabold text-[#0F766E] bg-[#F0FDFA] px-2.5 py-1 rounded-full border border-[#0F766E]/15">
                      SOLUTION {card.badge}
                    </span>
                  </div>

                  <h3 className="display-h3 text-[#0B2530] mb-3 min-h-[3.75rem] flex items-start">
                    {card.title}
                  </h3>

                  <p className="text-[15px] text-[#475569] leading-[1.7] mb-6 min-h-[4.5rem]">
                    {card.desc}
                  </p>
                </div>

                {/* Key specs checklist with aligned top divider */}
                <div className="mt-auto pt-5 border-t border-[#E2E8F0] flex flex-col gap-2.5">
                  {card.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#334155]">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
