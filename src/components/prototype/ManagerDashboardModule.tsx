import React, { useState } from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { Language } from '../../types';
import { ColdBox } from '../../types/prototype';
import {
  BarChart3,
  Thermometer,
  ShieldCheck,
  AlertOctagon,
  MessageSquare,
  MapPin,
  TrendingUp,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  BatteryCharging,
  Send,
  ExternalLink,
} from 'lucide-react';

interface ManagerDashboardModuleProps {
  lang: Language;
}

export const ManagerDashboardModule: React.FC<ManagerDashboardModuleProps> = ({ lang }) => {
  const {
    metrics,
    coldBoxes,
    isColdChainBreached,
    isColdChainFrozen,
    triggerColdChainBreach,
    triggerColdChainFreeze,
    restoreColdChain,
    children: childRecords,
    selectChild,
    setActiveTab,
    smsAlerts,
    triggerIVRCall,
  } = usePrototype();

  const isBn = lang === 'bn';
  const [selectedBoxId, setSelectedBoxId] = useState<string>('box-1');

  const selectedBox = coldBoxes.find((b) => b.id === selectedBoxId) || coldBoxes[0];

  // Map latitude/longitude to SVG viewport percent
  const getMapCoords = (lat: number, lng: number) => {
    // Bangladesh bounds: Lat 20.6 to 26.6, Lng 88.0 to 92.8
    const x = ((lng - 88.0) / 4.8) * 100;
    const y = ((26.6 - lat) / 6.0) * 100;
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-6">
      {/* 1. Flashing Critical Breach Banner (if active) */}
      {isColdChainBreached && (
        <div className="bg-[#FEF2F2] border-2 border-[#DC2626] rounded-2xl p-4 md:p-5 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-[#DC2626] text-white uppercase tracking-wider">
                    CRITICAL COLD-CHAIN BREACH (SIMULATED)
                  </span>
                  <span className="text-[12px] font-mono text-[#991B1B] font-bold">11.4°C</span>
                </div>
                <h3 className="font-heading font-bold text-[16px] text-[#7F1D1D] mt-1">
                  Sunamganj Haor Carrier #04 Exceeded 8.0°C Safe Envelope!
                </h3>
                <p className="text-[12.5px] text-[#991B1B]">
                  Automated LoRaWAN telemetry alarm dispatched. Alert broadcast to Civil Surgeon and Upazila technician (simulated).
                </p>
              </div>
            </div>

            <button
              onClick={restoreColdChain}
              className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {isBn ? 'স্বাভাবিক তাপমাত্রায় ফিরুন (রিস্টোর)' : 'Restore Safe Temp (4.2°C)'}
            </button>
          </div>
        </div>
      )}

      {/* Freeze Event Alert Banner */}
      {isColdChainFrozen && (
        <div className="bg-[#EFF6FF] border-2 border-[#2563EB] rounded-2xl p-4 md:p-5 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-[#2563EB] text-white uppercase tracking-wider">
                    CRITICAL FREEZE EVENT (SIMULATED)
                  </span>
                  <span className="text-[12px] font-mono text-[#1E40AF] font-bold">0.5°C</span>
                </div>
                <h3 className="font-heading font-bold text-[16px] text-[#1E3A8A] mt-1">
                  Carrier Dropped Below 2.0°C Freeze Threshold (0.5°C)!
                </h3>
                <p className="text-[12.5px] text-[#1E40AF]">
                  Critical freeze event flagged. Liquid HepB/Penta vaccines at risk of freeze-damage particulate agglomeration.
                </p>
              </div>
            </div>

            <button
              onClick={restoreColdChain}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {isBn ? 'স্বাভাবিক তাপমাত্রায় ফিরুন' : 'Restore Safe Temp (4.2°C)'}
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Metric KPI Counters (Dynamically updated from Field App) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fully Vaccinated Coverage (FVC) */}
        <div className="card-base p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-[12px] text-[#64748B] mb-1">
            <span>{isBn ? 'সম্পূর্ণ টিকাদান (FVC)' : 'Fully Vaccinated (FVC)'}</span>
            <UserCheck className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-[26px] text-[#0B2530]">
              {metrics.fullyVaccinatedPct}%
            </span>
            <span className="text-[11px] font-semibold text-[#15803D]">
              {metrics.fullyVaccinatedCount}/{metrics.totalChildren} children
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-[#0F766E] rounded-full transition-all duration-500"
              style={{ width: `${metrics.fullyVaccinatedPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Dropout Rate */}
        <div className="card-base p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-[12px] text-[#64748B] mb-1">
            <span>{isBn ? 'ড্রপআউট ঝুঁকি হার' : 'Critical Dropout Rate'}</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-[26px] text-[#B91C1C]">
              {metrics.dropoutRatePct}%
            </span>
            <span className="text-[11px] font-semibold text-[#64748B]">
              {metrics.criticalRiskCount} flagged
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-[#DC2626] rounded-full transition-all duration-500"
              style={{ width: `${metrics.dropoutRatePct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Cold Chain Compliance */}
        <div className="card-base p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-[12px] text-[#64748B] mb-1">
            <span>{isBn ? 'কোল্ড চেইন নিরাপত্তা' : 'Cold Chain Safe Rate'}</span>
            <Thermometer className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-heading font-extrabold text-[26px] ${
                isColdChainBreached || isColdChainFrozen ? 'text-[#DC2626]' : 'text-[#0F766E]'
              }`}
            >
              {metrics.coldChainIntegrityPct}%
            </span>
            <span className="text-[11px] font-semibold text-[#64748B]">
              {coldBoxes.filter((b) => b.status === 'normal').length}/{coldBoxes.length} in corridor
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isColdChainBreached || isColdChainFrozen ? 'bg-[#DC2626]' : 'bg-[#10B981]'
              }`}
              style={{ width: `${metrics.coldChainIntegrityPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Active Tracked Children */}
        <div className="card-base p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-[12px] text-[#64748B] mb-1">
            <span>{isBn ? 'ট্র্যাক করা মোট শিশু' : 'Active Children Tracked'}</span>
            <TrendingUp className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-[26px] text-[#0B2530]">
              {metrics.totalChildren}
            </span>
            <span className="text-[11px] font-semibold text-[#15803D]">
              100% tagged
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-2">
            Synced across VaxEPI & DHIS2
          </div>
        </div>
      </div>

      {/* 3. Cold Chain Telemetry Section: Map + Cold Boxes Table */}
      <div className="card-base p-6 bg-white border border-[#E2E8F0] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-5 h-5 text-[#0F766E]" />
              <h3 className="font-heading font-bold text-[18px] text-[#0B2530]">
                {isBn ? 'রিমোট কোল্ড বক্স টেলিমেট্রি মনিটরিং' : 'Remote Cold Box Telemetry & Geo-Mapping'}
              </h3>
            </div>
            <p className="text-[13px] text-[#64748B]">
              Real-time temperature telemetry across remote river char and haor outreach sessions (Safe range: 2°C–8°C).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isColdChainBreached && !isColdChainFrozen ? (
              <>
                <button
                  onClick={triggerColdChainBreach}
                  className="px-3 py-1.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] text-[12px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  title="Simulate 11.4°C heat breach"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>{isBn ? 'হিট ব্রীচ (১১.৪°সে)' : 'Simulate Heat (11.4°C)'}</span>
                </button>
                <button
                  onClick={triggerColdChainFreeze}
                  className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[12px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  title="Simulate 0.5°C freeze risk"
                >
                  <Thermometer className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{isBn ? 'ফ্রিজ ঝুঁকি (০.৫°সে)' : 'Simulate Freeze (0.5°C)'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={restoreColdChain}
                className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[12.5px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isBn ? 'স্বাভাবিক করুন' : 'Restore Normal (4.2°C)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Map & Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Simplified Bangladesh Regional Map with Beacons */}
          <div className="lg:col-span-5 bg-[#081B24] rounded-2xl p-4 text-white relative flex flex-col items-center justify-between min-h-[380px] border border-[#1E3A47]">
            <div className="w-full flex items-center justify-between text-[11px] text-[#94A3B8] mb-1">
              <span className="font-bold text-[#2DD4BF] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
                Bangladesh Telemetry Grid
              </span>
              <span className="font-mono text-[10px] bg-[#133240] px-2 py-0.5 rounded text-[#94A3B8] border border-[#1E3A47]">
                Lat/Long Geo-Grid
              </span>
            </div>

            {/* Simplified SVG Map of Bangladesh */}
            <div className="relative w-full max-w-[280px] aspect-[4/5] flex items-center justify-center my-2 select-none">
              <svg viewBox="0 0 300 360" className="w-full h-full drop-shadow-md">
                {/* Simplified geographic outline of Bangladesh */}
                <path
                  d="M 105 18 
                     C 118 16, 130 35, 145 42
                     C 160 48, 190 40, 205 52
                     C 220 62, 228 85, 230 105
                     C 225 125, 200 135, 215 155
                     C 225 168, 260 210, 265 240
                     C 270 270, 255 310, 250 330
                     C 240 335, 230 305, 220 280
                     C 210 260, 195 250, 185 260
                     C 175 270, 170 305, 155 305
                     C 140 305, 130 275, 115 285
                     C 98 295, 80 290, 75 275
                     C 65 255, 78 220, 68 200
                     C 58 175, 40 160, 48 130
                     C 55 105, 75 95, 80 70
                     C 85 45, 95 20, 105 18 Z"
                  fill="#133240"
                  stroke="#2DD4BF"
                  strokeWidth="1.75"
                  strokeDasharray="4 2"
                  opacity="0.85"
                />

                {/* Major River Lines: Jamuna / Brahmaputra, Padma, Meghna Delta */}
                <path
                  d="M 115 45 Q 110 110 135 160"
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <path
                  d="M 50 145 Q 100 155 135 160"
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <path
                  d="M 135 160 Q 155 200 165 270"
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.6"
                />

                {/* Haor Wetlands indicator */}
                <ellipse cx="205" cy="95" rx="16" ry="10" fill="#0F766E" opacity="0.3" />
              </svg>

              {/* Interactive Beacons on Map placed by Lat/Long with permanent Name Labels */}
              {coldBoxes.map((box) => {
                const isSelected = box.id === selectedBoxId;
                const isBreached = box.status === 'breach';
                const isFrozen = box.status === 'freeze';
                const coords = getMapCoords(box.lat, box.lng);

                return (
                  <button
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 flex flex-col items-center"
                    title={`${box.name} (${box.district}): ${box.temp}°C [Lat: ${box.lat}, Lng: ${box.lng}]`}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isBreached
                            ? 'bg-[#DC2626] ring-4 ring-[#DC2626]/50 animate-ping'
                            : isFrozen
                            ? 'bg-[#2563EB] ring-4 ring-[#2563EB]/50 animate-pulse'
                            : isSelected
                            ? 'bg-[#2DD4BF] text-[#0B2530] ring-4 ring-[#2DD4BF]/40 scale-110'
                            : 'bg-[#0F766E] text-white hover:scale-110'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Permanent Name Label under beacon */}
                    <div
                      className={`mt-1 text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded shadow-sm border whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-[#2DD4BF] text-[#081B24] border-[#2DD4BF] font-extrabold scale-105'
                          : isBreached
                          ? 'bg-[#DC2626] text-white border-[#EF4444]'
                          : isFrozen
                          ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                          : 'bg-[#081B24]/90 text-[#E2E8F0] border-[#1E3A47]'
                      }`}
                    >
                      {box.district}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="w-full text-center text-[10.5px] text-[#94A3B8] border-t border-[#1E3A47] pt-2">
              Markers positioned by GPS latitude/longitude. Click to inspect live telemetry.
            </div>
          </div>

          {/* Right: Cold Boxes Table */}
          <div className="lg:col-span-7 space-y-3">
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full min-w-[560px] text-left text-[12.5px] bg-white">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-[30%] whitespace-nowrap">Carrier Kit</th>
                    <th className="py-2.5 px-2 w-[22%] whitespace-nowrap">Location</th>
                    <th className="py-2.5 px-2 w-[18%] whitespace-nowrap">Temperature</th>
                    <th className="py-2.5 px-2 w-[14%] whitespace-nowrap">Battery</th>
                    <th className="py-2.5 px-3 text-right w-[16%] whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {coldBoxes.map((box) => {
                    const isSelected = box.id === selectedBoxId;
                    const isBreached = box.status === 'breach';
                    const isFrozen = box.status === 'freeze';

                    return (
                      <tr
                        key={box.id}
                        onClick={() => setSelectedBoxId(box.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#F0FDFA]' : 'hover:bg-[#F8FAFC]'
                        } ${isBreached ? 'bg-[#FEF2F2]' : isFrozen ? 'bg-[#EFF6FF]' : ''}`}
                      >
                        <td className="py-3 px-3 font-semibold text-[#0B2530]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isBreached
                                  ? 'bg-[#DC2626] animate-pulse'
                                  : isFrozen
                                  ? 'bg-[#2563EB] animate-pulse'
                                  : 'bg-[#10B981]'
                              }`}
                            />
                            <span className="truncate max-w-[170px]" title={box.name}>
                              {box.name}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-[#64748B] whitespace-nowrap">{box.location}</td>

                        <td className="py-3 px-2 font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              isBreached
                                ? 'text-[#DC2626] font-extrabold text-[14px]'
                                : isFrozen
                                ? 'text-[#2563EB] font-extrabold text-[14px]'
                                : 'text-[#0F766E]'
                            }
                          >
                            {box.temp}°C
                          </span>
                        </td>

                        <td className="py-3 px-2 text-[#64748B] whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <BatteryCharging className="w-3.5 h-3.5 text-[#10B981]" />
                            <span>{box.battery}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap inline-block ${
                              isBreached
                                ? 'bg-[#DC2626] text-white'
                                : isFrozen
                                ? 'bg-[#2563EB] text-white'
                                : 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                            }`}
                          >
                            {isBreached
                              ? 'BREACH (11.4°C)'
                              : isFrozen
                              ? 'FREEZE (0.5°C)'
                              : 'Safe (2°–8°C)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Box Telemetry Detail Footer */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#475569]">
              <div>
                <span className="font-bold text-[#0B2530]">{selectedBox.name}</span> • Ping:{' '}
                {selectedBox.lastPing}
              </div>
              <div className="font-mono text-[11px] text-[#0F766E]">
                Geo: {selectedBox.lat.toFixed(3)}° N, {selectedBox.lng.toFixed(3)}° E
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dropout Risk Priority List */}
      <div className="card-base p-6 bg-white border border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-[17px] text-[#0B2530]">
              {isBn ? 'ড্রপআউট অগ্রাধিকার তালিকা' : 'Dropout-Risk Management & Action Queue'}
            </h3>
            <p className="text-[12.5px] text-[#64748B]">
              Real-time algorithmic risk flags based on missed follow-up sessions.
            </p>
          </div>
          <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
            {childRecords.filter((c) => c.riskLevel === 'critical').length} Urgent Attention
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase tracking-wider font-bold">
                <th className="pb-2">Child Name</th>
                <th className="pb-2">Mother & BRN</th>
                <th className="pb-2">Days Since Last Dose</th>
                <th className="pb-2">Risk Score</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {childRecords.map((child) => (
                <tr key={child.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 font-semibold text-[#0B2530]">
                    <div className="flex items-center gap-2">
                      <span>{child.name}</span>
                      {child.ivrTriggered && (
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-[#FEF3C7] text-[#92400E] rounded">
                          IVR Sent
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 text-[#64748B]">
                    {child.motherName} • {child.brn}
                  </td>

                  <td className="py-3 font-mono">
                    <span
                      className={
                        (child.daysSinceLastDose ?? child.daysOverdue) >= 56
                          ? 'text-[#DC2626] font-bold'
                          : 'text-[#334155]'
                      }
                    >
                      {child.daysSinceLastDose ?? child.daysOverdue} days
                    </span>
                  </td>

                  <td className="py-3">
                    <span
                      className={`font-mono font-bold text-[13px] ${
                        child.riskLevel === 'critical'
                          ? 'text-[#DC2626]'
                          : child.riskLevel === 'moderate'
                          ? 'text-[#D97706]'
                          : 'text-[#16A34A]'
                      }`}
                    >
                      {child.riskScore}/100
                    </span>
                  </td>

                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => triggerIVRCall(child.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B2530] text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Send IVR voice reminder"
                      >
                        IVR Dial
                      </button>
                      <button
                        onClick={() => {
                          selectChild(child.id);
                          setActiveTab('field-app');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        View Record
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SMS & Emergency Dispatch Stream */}
      {smsAlerts.length > 0 && (
        <div className="card-base p-5 bg-[#081B24] text-white border border-[#1E3A47]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2DD4BF]" />
              <h4 className="font-heading font-bold text-[14px] text-white">
                Automated SMS & Outgoing Escalation Dispatch Log
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#94A3B8]">
              IVR Call Log (simulated)
            </span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto font-mono text-[11px]">
            {smsAlerts.map((sms) => (
              <div
                key={sms.id}
                className="p-2.5 rounded-lg bg-[#133240] border border-[#1E3A47] text-[#E2E8F0] space-y-0.5"
              >
                <div className="flex items-center justify-between text-[#2DD4BF]">
                  <span className="font-bold">To: {sms.recipient}</span>
                  <span className="text-[#94A3B8]">[{sms.timestamp}]</span>
                </div>
                <div className="text-[11.5px] text-[#CBD5E1]">{sms.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
