import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Shield, BrainCircuit, WifiOff, ArrowDown, Server, Smartphone, Cloud, FileCheck } from 'lucide-react';

interface ArchitectureProps {
  lang: Language;
}

export const Architecture: React.FC<ArchitectureProps> = ({ lang }) => {
  const t = translations[lang].architecture;

  const layers = [
    {
      num: '01',
      title: 'Field Layer',
      badge: 'Edge Devices',
      desc: t.layer1,
      icon: Smartphone,
      color: 'bg-[#F0FDFA] border-[#0F766E]/30 text-[#0F766E]',
    },
    {
      num: '02',
      title: 'Sync & Conflict Layer',
      badge: 'Cryptographic Edge Truth',
      desc: t.layer2,
      icon: Server,
      color: 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0B2530]',
    },
    {
      num: '03',
      title: 'Cloud Infrastructure Layer',
      badge: 'GCP Microservices',
      desc: t.layer3,
      icon: Cloud,
      color: 'bg-[#F0FDFA] border-[#0F766E]/30 text-[#0F766E]',
    },
    {
      num: '04',
      title: 'National Health Systems',
      badge: 'DGHS Interoperability',
      desc: t.layer4,
      icon: FileCheck,
      color: 'bg-[#0B2530] border-[#0B2530] text-white',
    },
  ];

  const cards = [
    {
      icon: Shield,
      title: t.card1Title,
      desc: t.card1Desc,
    },
    {
      icon: BrainCircuit,
      title: t.card2Title,
      desc: t.card2Desc,
    },
    {
      icon: WifiOff,
      title: t.card3Title,
      desc: t.card3Desc,
    },
  ];

  return (
    <section id="architecture" className="w-full bg-white py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* Layered Diagram in SVG/CSS */}
        <div className="max-w-[900px] mx-auto mb-16 flex flex-col items-center">
          {layers.map((layer, idx) => {
            const Icon = layer.icon;
            const isLast = idx === layers.length - 1;

            return (
              <React.Fragment key={idx}>
                <div
                  className={`w-full rounded-2xl border p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-transform hover:-translate-y-0.5 ${layer.color}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-current/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold tracking-wider uppercase opacity-80">
                          LAYER {layer.num}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                          {layer.badge}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-[18px] md:text-[20px] mt-0.5">
                        {layer.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[14px] md:text-[14.5px] max-w-[460px] opacity-90 leading-relaxed">
                    {layer.desc}
                  </p>
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <div className="my-2 text-[#0F766E] flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-[#0F766E]/40" />
                    <ArrowDown className="w-4 h-4 text-[#0F766E]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="card-base p-7 bg-[#F8FAFC]">
                <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="display-h3 text-[#0B2530] mb-2.5">{card.title}</h3>
                <p className="text-[14.5px] text-[#64748B] leading-[1.65]">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
