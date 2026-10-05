import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { FileInput, CheckSquare, Fingerprint, CreditCard, Scan, RefreshCw } from 'lucide-react';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const t = translations[lang].howItWorks;
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { num: 1, icon: FileInput, title: t.step1Title, desc: t.step1Desc },
    { num: 2, icon: CheckSquare, title: t.step2Title, desc: t.step2Desc },
    { num: 3, icon: Fingerprint, title: t.step3Title, desc: t.step3Desc },
    { num: 4, icon: CreditCard, title: t.step4Title, desc: t.step4Desc },
    { num: 5, icon: Scan, title: t.step5Title, desc: t.step5Desc },
    { num: 6, icon: RefreshCw, title: t.step6Title, desc: t.step6Desc },
  ];

  // Animate active step on scroll or timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section id="how-it-works" ref={containerRef} className="w-full bg-white py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* Desktop Stepper Bar (Horizontal) */}
        <div className="hidden lg:block mb-12 relative">
          {/* Connecting Line */}
          <div className="absolute top-[28px] left-[5%] right-[5%] h-[3px] bg-[#E2E8F0] -z-0">
            <div
              className="h-full bg-[#0F766E] transition-all duration-500 ease-out"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-6 gap-3 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isPast = idx < activeStep;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center text-center group cursor-pointer focus-visible:outline-none"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-[#0F766E] text-white shadow-lg ring-4 ring-[#0F766E]/20 scale-110'
                        : isPast
                        ? 'bg-[#0F766E] text-white'
                        : 'bg-white border-2 border-[#CBD5E1] text-[#64748B] group-hover:border-[#0F766E]'
                    }`}
                  >
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span
                    className={`mt-3 text-[14px] font-bold transition-colors ${
                      isActive ? 'text-[#0F766E]' : 'text-[#334155]'
                    }`}
                  >
                    0{step.num}. {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid (Visible for both desktop and mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`card-base p-6 md:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'border-[#0F766E] bg-[#F0FDFA] shadow-md ring-1 ring-[#0F766E]'
                    : 'bg-white'
                }`}
              >
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-[#0F766E] text-white' : 'bg-[#F0FDFA] text-[#0F766E]'
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0F766E] border border-[#E2E8F0]">
                      STEP 0{step.num}
                    </span>
                  </div>
                  <h3 className="display-h3 text-[#0B2530] mb-2 min-h-[2rem] flex items-start">{step.title}</h3>
                  <p className="text-[15px] text-[#475569] leading-[1.7] min-h-[4.5rem]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
