import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Building2, Landmark, Check } from 'lucide-react';

interface BusinessModelProps {
  lang: Language;
}

export const BusinessModel: React.FC<BusinessModelProps> = ({ lang }) => {
  const t = translations[lang].business;

  return (
    <section id="business" className="w-full bg-[#F8FAFC] py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* 2 Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1000px] mx-auto">
          {/* Card 1: B2B */}
          <div className="card-base p-8 md:p-9 bg-white flex flex-col justify-between h-full">
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center">
                  <Building2 className="w-7 h-7 stroke-[2]" />
                </div>
                <span className="text-[12.5px] font-extrabold px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/15 uppercase">
                  B2B SaaS
                </span>
              </div>

              <h3 className="display-h3 text-[#0B2530] mb-1 min-h-[2.25rem] flex items-start">{t.card1Title}</h3>
              <span className="text-[14px] font-semibold text-[#0F766E] block mb-4 min-h-[1.5rem]">{t.card1Sub}</span>

              <p className="text-[15px] text-[#475569] leading-[1.7] mb-6 min-h-[5rem]">{t.card1Desc}</p>
            </div>

            <div className="pt-6 border-t border-[#E2E8F0] flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="text-[13.5px] font-medium text-[#334155]">Tiered monthly clinic subscription</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="text-[13.5px] font-medium text-[#334155]">Automated VaxEPI government compliance exports</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="text-[13.5px] font-medium text-[#334155]">Verifiable QR immunization certificates for travel</span>
              </div>
            </div>
          </div>

          {/* Card 2: B2G */}
          <div className="card-base p-8 md:p-9 bg-white flex flex-col justify-between h-full">
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center">
                  <Landmark className="w-7 h-7 stroke-[2]" />
                </div>
                <span className="text-[12.5px] font-extrabold px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/15 uppercase">
                  B2G Cloud
                </span>
              </div>

              <h3 className="display-h3 text-[#0B2530] mb-1 min-h-[2.25rem] flex items-start">{t.card2Title}</h3>
              <span className="text-[14px] font-semibold text-[#0F766E] block mb-4 min-h-[1.5rem]">{t.card2Sub}</span>

              <p className="text-[15px] text-[#475569] leading-[1.7] mb-6 min-h-[5rem]">{t.card2Desc}</p>
            </div>

            <div className="pt-6 border-t border-[#E2E8F0] flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="text-[13.5px] font-medium text-[#334155]">City Corporation municipal cloud leasing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="text-[13.5px] font-medium text-[#334155]">GIS hotspot analytics for floating & slum infants</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="text-[13.5px] font-medium text-[#334155]">Elimination of paper ledger printing overhead</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
