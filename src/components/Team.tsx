import React from 'react';
import { Language } from '../types';
import { translations, teamMembers } from '../data/translations';
import { Mail, GraduationCap, ArrowRight } from 'lucide-react';

interface TeamProps {
  lang: Language;
  onOpenContact: () => void;
}

export const Team: React.FC<TeamProps> = ({ lang, onOpenContact }) => {
  const t = translations[lang].team;

  return (
    <section id="team" className="w-full bg-[#F8FAFC] py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* 3 Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-14">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="card-base p-8 bg-white flex flex-col items-center text-center justify-between h-full"
            >
              <div className="flex flex-col items-center flex-1 w-full">
                {/* Avatar with Teal Gradient */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] text-white flex items-center justify-center font-heading font-extrabold text-[24px] shadow-md mb-5 ring-4 ring-[#F0FDFA]">
                  {member.initials}
                </div>

                <h3 className="font-heading font-bold text-[20px] text-[#0B2530] mb-1">
                  {lang === 'en' ? member.name : member.nameBn}
                </h3>

                <div className="min-h-[2.5rem] flex items-center justify-center mb-2">
                  <span className="text-[14px] font-semibold text-[#0F766E]">
                    {lang === 'en' ? member.roleEn : member.roleBn}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-[12px] font-medium mb-4">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{member.grade}</span>
                </div>

                <p className="text-[15px] text-[#475569] leading-[1.7]">
                  {lang === 'en' ? member.descEn : member.descBn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Banner Bar */}
        <div className="max-w-[800px] mx-auto rounded-2xl bg-white border border-[#E2E8F0] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-[17px] text-[#0B2530]">
                {t.contactLead}
              </h4>
              <a href="mailto:fk361542@gmail.com" className="text-[13.5px] text-[#0F766E] hover:underline font-medium">
                fk361542@gmail.com • Phase 1 Concept Inquiries
              </a>
            </div>
          </div>

          <button
            onClick={onOpenContact}
            className="h-[46px] px-6 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <span>{t.contactBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
