import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { TrendingUp, UserCheck, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

interface ImpactProps {
  lang: Language;
}

export const Impact: React.FC<ImpactProps> = ({ lang }) => {
  const t = translations[lang].impact;
  const [hasAnimated, setHasAnimated] = useState(false);
  const [val1, setVal1] = useState(0);
  const [val2, setVal2] = useState(25);
  const [val3, setVal3] = useState(25);
  const [val4, setVal4] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Counter 1: 0 -> 90%
          let step1 = 0;
          const timer1 = setInterval(() => {
            step1 += 3;
            if (step1 >= 90) {
              setVal1(90);
              clearInterval(timer1);
            } else {
              setVal1(step1);
            }
          }, 30);

          // Counter 2: 25 -> 5%
          let step2 = 25;
          const timer2 = setInterval(() => {
            step2 -= 1;
            if (step2 <= 5) {
              setVal2(5);
              clearInterval(timer2);
            } else {
              setVal2(step2);
            }
          }, 45);

          // Counter 3: 25 -> 0%
          let step3 = 25;
          const timer3 = setInterval(() => {
            step3 -= 1;
            if (step3 <= 0) {
              setVal3(0);
              clearInterval(timer3);
            } else {
              setVal3(step3);
            }
          }, 40);

          // Counter 4: 0 -> 41%
          let step4 = 0;
          const timer4 = setInterval(() => {
            step4 += 2;
            if (step4 >= 41) {
              setVal4(41);
              clearInterval(timer4);
            } else {
              setVal4(step4);
            }
          }, 35);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const kpis = [
    {
      displayVal: `>${val1}%`,
      title: t.kpi1Title,
      baseline: t.kpi1Baseline,
      icon: TrendingUp,
      accent: 'text-[#0F766E]',
    },
    {
      displayVal: `<${val2}%`,
      title: t.kpi2Title,
      baseline: t.kpi2Baseline,
      icon: UserCheck,
      accent: 'text-[#0F766E]',
    },
    {
      displayVal: val3 === 0 ? "0 freeze events" : `${val3} freeze events`,
      title: t.kpi3Title,
      baseline: t.kpi3Baseline,
      icon: ShieldAlert,
      accent: 'text-[#0F766E]',
      isFreezeEvent: true,
    },
    {
      displayVal: `-${val4}%`,
      title: t.kpi4Title,
      baseline: t.kpi4Baseline,
      icon: Clock,
      accent: 'text-[#0F766E]',
    },
  ];

  return (
    <section id="impact" ref={sectionRef} className="w-full bg-white py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* 4 Animated KPI Cards with aligned titles & dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="card-base p-7 md:p-8 flex flex-col justify-between h-full bg-[#FFFFFF]"
              >
                <div className="flex flex-col flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center mb-6 shrink-0">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <div className="min-h-[4rem] flex items-end mb-2">
                    <span className={`font-heading font-extrabold tracking-tight block ${kpi.accent} ${kpi.isFreezeEvent ? 'text-[28px] sm:text-[32px] leading-tight' : 'text-[40px] md:text-[44px]'}`}>
                      {kpi.displayVal}
                    </span>
                  </div>

                  <h3 className="display-h3 text-[#0B2530] mb-3 min-h-[3rem] flex items-start">{kpi.title}</h3>
                </div>

                <div className="mt-auto pt-4 border-t border-[#E2E8F0] min-h-[3rem] flex items-center">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B]">
                    <span>{kpi.baseline}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="text-center text-[13px] text-[#64748B] max-w-[640px] mx-auto">
          *{t.footnote} {/* (source needed: EPI Bangladesh 2024 review benchmarks) */}
        </p>
      </div>
    </section>
  );
};
