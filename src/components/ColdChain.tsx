import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Thermometer, Radio, MapPin, BellRing, AlertTriangle, X, CheckCircle } from 'lucide-react';

interface ColdChainProps {
  lang: Language;
}

export const ColdChain: React.FC<ColdChainProps> = ({ lang }) => {
  const t = translations[lang].coldChain;
  const [showAlert, setShowAlert] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(3.4);

  // Periodic alert toast loop (every 7 seconds)
  useEffect(() => {
    const alertInterval = setInterval(() => {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3800);
    }, 7500);

    // Subtle temperature fluctuation loop between 3.2°C and 3.8°C
    const tempInterval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.4;
      setCurrentTemp((prev) => {
        const next = Math.round((prev + delta) * 10) / 10;
        return Math.min(Math.max(next, 2.6), 5.4);
      });
    }, 2500);

    return () => {
      clearInterval(alertInterval);
      clearInterval(tempInterval);
    };
  }, []);

  return (
    <section id="cold-chain" className="w-full bg-[#F8FAFC] py-16 md:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-[640px] mx-auto mb-14 md:mb-16">
          <span className="eyebrow-label block mb-3">{t.eyebrow}</span>
          <h2 className="display-h2 text-[#0B2530] mb-4 [text-wrap:balance] max-w-[20ch] mx-auto">{t.h2}</h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] leading-[1.7]">{t.subtitle}</p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Explanatory Content */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
                <Thermometer className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[17px] text-[#0B2530] mb-1">
                  2°C to 8°C Guaranteed Buffer
                </h4>
                <p className="text-[15px] text-[#64748B] leading-relaxed">{t.bullet1}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[17px] text-[#0B2530] mb-1">
                  GPS & Haor River Logistics
                </h4>
                <p className="text-[15px] text-[#64748B] leading-relaxed">{t.bullet2}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[17px] text-[#0B2530] mb-1">
                  Automated Escalation Protocol
                </h4>
                <p className="text-[15px] text-[#64748B] leading-relaxed">{t.bullet3}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[17px] text-[#0B2530] mb-1">
                  Open-Source ThingsBoard Engine
                </h4>
                <p className="text-[15px] text-[#64748B] leading-relaxed">{t.bullet4}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mock Dashboard Card */}
          <div className="lg:col-span-6 relative">
            {/* Concept Dashboard Container */}
            <div className="card-base bg-white p-6 md:p-8 relative shadow-lg overflow-hidden">
              {/* Top Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] block">
                    {t.conceptLabel}
                  </span>
                  <h3 className="font-heading font-bold text-[18px] text-[#0B2530]">
                    {t.dashboardTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full text-[12px] font-bold border border-[#16A34A]/20">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                  <span>{t.dashboardTag}</span>
                </div>
              </div>

              {/* Live Temperature Gauge & Status */}
              <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
                    <Thermometer className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[12.5px] text-[#64748B] block font-medium">
                      {t.tempLabel}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading font-extrabold text-[36px] text-[#0B2530] tracking-tight">
                        +{currentTemp.toFixed(1)}
                      </span>
                      <span className="text-[20px] font-bold text-[#64748B]">°C</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className="flex items-center gap-1 text-[#16A34A] font-bold text-[13px]">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.statusSafe}</span>
                  </div>
                  <span className="text-[12px] text-[#64748B] mt-0.5">
                    Target range: +2.0°C to +8.0°C
                  </span>
                </div>
              </div>

              {/* Alert Toast positioned ABOVE the chart area */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  showAlert ? 'max-h-36 opacity-100 my-4' : 'max-h-0 opacity-0 my-0 pointer-events-none'
                }`}
              >
                <div className="bg-[#FEF2F2] border-2 border-[#B91C1C] rounded-xl p-3.5 shadow-md flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#B91C1C] text-white flex items-center justify-center shrink-0 animate-bounce">
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[13px] font-bold text-[#B91C1C] block">
                      {t.alertToast}
                    </span>
                    <span className="text-[11px] text-[#991B1B]">
                      SMS dispatched to Sunamganj Civil Surgeon Office
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAlert(false)}
                    className="text-[#991B1B] hover:text-[#B91C1C] p-1 cursor-pointer"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 24-Hour Temperature Line Chart (SVG) */}
              <div className="pt-5">
                <div className="flex items-center justify-between mb-3 text-[12px] text-[#64748B]">
                  <span className="font-semibold text-[#334155]">24-Hour Cold Chain Telemetry</span>
                  <span>Sensors: DS18B20 1-Wire</span>
                </div>

                <div className="w-full h-32 relative bg-[#F8FAFC] rounded-xl p-2 border border-[#E2E8F0]">
                  <svg viewBox="0 0 320 100" className="w-full h-full" preserveAspectRatio="none">
                    {/* Safe Corridor Band (2°C - 8°C) */}
                    <rect x="0" y="25" width="320" height="50" fill="#DCFCE7" fillOpacity="0.4" />
                    <line x1="0" y1="25" x2="320" y2="25" stroke="#16A34A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="0" y1="75" x2="320" y2="75" stroke="#16A34A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />

                    {/* Smooth Temp Trace staying in safe zone */}
                    <path
                      d="M0 55 Q 30 50, 60 52 T 120 48 T 180 54 T 240 50 T 280 46 T 320 48"
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="2.5"
                    />

                    {/* Sensor Data Points */}
                    <circle cx="60" cy="52" r="3" fill="#0F766E" />
                    <circle cx="120" cy="48" r="3" fill="#0F766E" />
                    <circle cx="180" cy="54" r="3" fill="#0F766E" />
                    <circle cx="240" cy="50" r="3" fill="#0F766E" />
                    <circle cx="320" cy="48" r="4" fill="#0F766E" className="animate-ping" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
