import React, { useState, useEffect, useRef } from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { Language } from '../../types';
import {
  ShieldAlert,
  FastForward,
  RotateCcw,
  PhoneCall,
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Clock,
  BellRing,
  UserX,
  Radio,
  Sparkles,
  HelpCircle,
  Calendar,
  ChevronDown,
  Copy,
  Check,
  X,
  Bot,
  FileCode,
  Languages,
  Download,
  Share2,
  Activity,
} from 'lucide-react';

export type DialectKey = 'sylheti' | 'rangpuri' | 'chittagonian' | 'standard_bengali';

export interface DialectItem {
  key: DialectKey;
  name: string;
  nameBn: string;
  region: string;
  regionBn: string;
  badge: string;
}

export const DIALECT_OPTIONS: DialectItem[] = [
  {
    key: 'sylheti',
    name: 'Sylheti',
    nameBn: 'সিলেটি',
    region: 'Sylhet Haor Flash Flood Basins',
    regionBn: 'সিলেট হাওর অববাহিকা (সুনামগঞ্জ/হবিগঞ্জ)',
    badge: 'হাওর উপভাষা',
  },
  {
    key: 'rangpuri',
    name: 'Rangpuri / Rajbongshi',
    nameBn: 'রংপুরী / রাজবংশী',
    region: 'Kurigram / Brahmaputra Riverine Chars',
    regionBn: 'কুড়িগ্রাম ব্রহ্মপুত্র নদীভাঙন চর এলাকা',
    badge: 'উত্তরবঙ্গ চর উপভাষা',
  },
  {
    key: 'chittagonian',
    name: 'Chittagonian',
    nameBn: 'চাটগাঁইয়া',
    region: 'Southeastern Coastal & Chittagong Hill Tracts',
    regionBn: 'দক্ষিণ-পূর্ব উপকূল ও পার্বত্য চট্টগ্রাম',
    badge: 'উপকূলীয় উপভাষা',
  },
  {
    key: 'standard_bengali',
    name: 'Standard Bengali',
    nameBn: 'প্রমিত বাংলা',
    region: 'DGHS 16263 National Central Outreach',
    regionBn: 'স্বাস্থ্য অধিদপ্তর কেন্দ্রীয় প্রাতিষ্ঠানিক বার্তা',
    badge: 'প্রাতিষ্ঠানিক ১৬২৬৩',
  },
];

interface DropoutPreventionModuleProps {
  lang: Language;
}

export const DropoutPreventionModule: React.FC<DropoutPreventionModuleProps> = ({ lang }) => {
  const {
    currentDate,
    daysAdvanced,
    advanceTime,
    resetTime,
    children: childRecords,
    selectedChild,
    selectChild,
    triggerIVRCall,
    smsAlerts,
    guidedTourStep,
  } = usePrototype();

  const isBn = lang === 'bn';

  const [expandedChildScoreId, setExpandedChildScoreId] = useState<string | null>(null);

  // Audio Speech & HTML5 Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [callPhase, setCallPhase] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<'bn' | 'en'>('bn');
  const [speechSynthSupported, setSpeechSynthSupported] = useState<boolean>(true);

  // Dialect-Aware IVR State (Sylheti, Rangpuri/Rajbongshi, Chittagonian, Standard Bengali)
  const [selectedDialect, setSelectedDialect] = useState<DialectKey>('sylheti');
  const [isInteroperabilityModalOpen, setIsInteroperabilityModalOpen] = useState<boolean>(false);
  const [interopTab, setInteropTab] = useState<'fhir' | 'dhis2' | 'timeline'>('fhir');
  const [copiedInterop, setCopiedInterop] = useState<boolean>(false);

  // Gemini AI Clinical Counselor State
  const [aiPlanChild, setAiPlanChild] = useState<any | null>(null);
  const [isAiPlanLoading, setIsAiPlanLoading] = useState<boolean>(false);
  const [aiPlanData, setAiPlanData] = useState<{
    rootCauseAnalysis: string;
    motherCounselingScript: string;
    catchUpPlan: string;
    customIvrMessage: string;
    urgencyLevel: string;
    probabilityScore?: number;
    rootDrivers?: string[];
  } | null>(null);
  const [isAiPlanModalOpen, setIsAiPlanModalOpen] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [isSpeakingCounseling, setIsSpeakingCounseling] = useState<boolean>(false);
  const [customIvrMessage, setCustomIvrMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const callIntervalRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Dialect specific voice scripts with native Bengali phonetic script & English translation
  const DIALECT_SCRIPTS: Record<DialectKey, { native: string; english: string }> = {
    sylheti: {
      native: `আসসালামু আলাইকুম। স্মার্টগার্ড বিডি আর স্বাস্থ্য অধিদপ্তর থাকি কইরাম। ${selectedChild?.motherName || 'রোকেয়া'} বইন, আফনার হুরুতা ${selectedChild?.name || 'তানভীর'}-এর টিকার দিন পার অই গেছে গা। হাওরের বাদল আর পানির ডরে টিকা বাদ দিবা না। সামনর হাটে হাসপাতালেও বা স্বাস্থ্যকেন্দ্রে আইয়া তানভীরে টিকা দিয়া যান। তানভীর বালা থাকব।`,
      english: `Assalamu Alaikum. This is SmartGuard BD and DGHS health directorate calling. Sister ${selectedChild?.motherName || 'Rokeya'}, your child ${selectedChild?.name || 'Tanvir'}'s vaccination date has passed. Do not skip vaccination out of fear of haor rains and water. Please bring ${selectedChild?.name || 'Tanvir'} to the clinic or health post on the next market day. ${selectedChild?.name || 'Tanvir'} will stay safe.`,
    },
    rangpuri: {
      native: `আসসালামু আলাইকুম বুজি। স্মার্টগার্ড আর স্বাস্থ্য অফিসের তকনে কবার ধরছি। ${selectedChild?.motherName || 'রোকেয়া'} বুজি, তোমার ছাওয়া ${selectedChild?.name || 'তানভীর'}-এর টিকার সময় পার হইয়া গেইচে। চরোত বান-পানির কষ্ট হইলেও ছাওয়াটার টিকা বাদ দেন না। সামনের টিকাদান ঘাটে আসিয়া তানভীরক সুঁইটা দিয়া যান।`,
      english: `Assalamu Alaikum sister. Calling from SmartGuard and the health office. Sister ${selectedChild?.motherName || 'Rokeya'}, your child ${selectedChild?.name || 'Tanvir'}'s immunization date has elapsed. Even with the hardships of river char floods, do not abandon the child's vaccine. Come to the upcoming immunization post and get ${selectedChild?.name || 'Tanvir'} vaccinated.`,
    },
    chittagonian: {
      native: `আসসালামু আলাইকুম। স্বাস্থ্য অধিদপ্তর আর স্মার্টগার্ডত্তুন অঁনারে হদ্দে। ${selectedChild?.motherName || 'রোকেয়া'} বইন, অঁনার গুঁড়া ${selectedChild?.name || 'তানভীর'}-এর টিকার তারিক পার অই গেইয়েগৈ। পাহাড়ি পথ বা সাগরের বাদল্লে ডরাই টিকা ন ফেলাইবেন। অগ্গো সেশনত স্বাস্থ্যকেন্দ্রে আই তানভীরে টিকা দি ফেলাইবুন।`,
      english: `Assalamu Alaikum. Speaking to you from the Health Directorate and SmartGuard. Sister ${selectedChild?.motherName || 'Rokeya'}, your little one ${selectedChild?.name || 'Tanvir'}'s vaccination date has passed. Do not skip vaccines due to mountain terrain or coastal rain. Please bring ${selectedChild?.name || 'Tanvir'} to the upcoming session at the health clinic.`,
    },
    standard_bengali: {
      native: `আসসালামু আলাইকুম। স্বাস্থ্য অধিদপ্তর ও স্মার্টগার্ড বিডি ১৬২৬৩ হেল্পলাইন থেকে জানানো যাচ্ছে। সম্মানিত অভিভাবক ${selectedChild?.motherName || 'রোকেয়া বেগম'}, আপনার শিশু ${selectedChild?.name || 'তানভীর হাসান'}-এর নির্ধারিত জীবনরক্ষাকারী টিকার সময় পার হয়ে গিয়েছে। শিশুর সুরক্ষায় আগামী সেশনেই নিকটস্থ স্বাস্থ্যকেন্দ্রে নিয়ে আসুন।`,
      english: `Assalamu Alaikum. Notification from the Directorate General of Health Services and SmartGuard BD 16263 Helpline. Respected caregiver ${selectedChild?.motherName || 'Rokeya Begum'}, the scheduled life-saving vaccination for your child ${selectedChild?.name || 'Tanvir Hasan'} is overdue. For your child's protection, please visit your nearest health clinic during the upcoming session.`,
    },
  };

  // Active IVR Script based on current dialect selection
  const BANGLA_IVR_SPEECH = customIvrMessage || DIALECT_SCRIPTS[selectedDialect].native;
  const ENGLISH_IVR_TRANSCRIPT = DIALECT_SCRIPTS[selectedDialect].english;

  // AI Counselor Trigger
  const handleOpenAiCounselor = async (child: any) => {
    setAiPlanChild(child);
    setIsAiPlanModalOpen(true);
    setIsAiPlanLoading(true);
    setAiPlanData(null);
    setCopiedScript(false);

    try {
      const res = await fetch('/api/gemini/health-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child: {
            name: child.name,
            dob: child.dob,
            motherName: child.motherName,
            phone: child.phone,
            distanceToClinicKm: child.location?.includes('Char') ? 8.2 : 5.4,
            maternalLiteracy: 'none',
            priorDoseDelayDays: { bcg: 7, penta1: child.daysSinceLastDose ?? child.daysOverdue ?? 28 },
            geographicalVulnerability: child.location || 'Sylhet Haor flash flood basins',
            pendingDose: child.missedVaccine || child.pendingDose || 'Pentavalent-2 / PCV-2',
            missedSessions: child.missedSessions,
          },
          dialect: selectedDialect,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const risk = data.dropoutRiskAssessment;
        const dialectScript = data.dialectAwareIvr?.allDialects?.[selectedDialect] || data.dialectAwareIvr;
        setAiPlanData({
          rootCauseAnalysis: risk?.rootDrivers?.join('\n• ') || 'High geographical vulnerability and seasonal communication obstacles in riverine basins.',
          motherCounselingScript: dialectScript?.scriptNative || DIALECT_SCRIPTS[selectedDialect].native,
          catchUpPlan: isBn
            ? 'ইপিআই বাংলাদেশ প্রটোকল অনুযায়ী অবিলম্বে পেনটাভ্যালেন্ট এবং পিসিভি ক্যাচ-আপ ডোজ প্রদান করতে হবে। পরবর্তী ৯ মাসের এমআর-১ টিকার পূর্বে এটি সম্পন্ন করা আবশ্যক।'
            : 'Administer catch-up Pentavalent and PCV doses immediately with the DGHS-specified minimum interval before 9-month MR-1.',
          customIvrMessage: dialectScript?.scriptNative || DIALECT_SCRIPTS[selectedDialect].native,
          urgencyLevel: risk?.riskCategory || ((child.riskScore ?? 80) >= 70 ? 'CRITICAL' : 'HIGH'),
          probabilityScore: risk?.probabilityScore ?? child.riskScore,
          rootDrivers: risk?.rootDrivers || [],
        });
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      // Resilient fallback for clinical insight
      setAiPlanData({
        rootCauseAnalysis: isBn
          ? `ভৌগোলিক বিচ্ছিন্নতা (${child.location || 'হাওর/চর অঞ্চল'}), স্বাস্থ্যকেন্দ্র হতে দূরবর্তী অবস্থান (>৫ কিমি) এবং টিকার পর স্বাভাবিক জ্বরের কারণে পারিবারিক দ্বিধা।`
          : `Geographical vulnerability in remote riverine char/haor terrain (>5km from clinic), coupled with maternal apprehension regarding expected post-vaccine fever.`,
        motherCounselingScript: DIALECT_SCRIPTS[selectedDialect].native,
        catchUpPlan: isBn
          ? `ইপিআই বাংলাদেশ প্রটোকল অনুযায়ী অবিলম্বে পেনটাভ্যালেন্ট-৩ এবং পিসিভি-৩ ক্যাচ-আপ ডোজ প্রদান করতে হবে। পরবর্তী ৯ মাসের এমআর টিকার পূর্বে এটি সম্পন্ন করা আবশ্যক।`
          : `Administer catch-up Pentavalent and PCV doses immediately at the next session with a mandatory minimum interval before MR-1.`,
        customIvrMessage: DIALECT_SCRIPTS[selectedDialect].native,
        urgencyLevel: (child.riskScore ?? 80) >= 70 ? 'CRITICAL' : 'HIGH',
        probabilityScore: child.riskScore ?? 84,
        rootDrivers: [
          'দূরবর্তী স্বাস্থ্যকেন্দ্র ও মৌসুমি জলাবদ্ধতা',
          'পূর্ববর্তী পেনটা-১ ডোজে বিলম্বজনিত ড্রপআউট ধারা',
          'টিকার মৃদু স্বাভাবিক জ্বর সংক্রান্ত সচেতনতার অভাব'
        ],
      });
    } finally {
      setIsAiPlanLoading(false);
    }
  };

  const handleSpeakCounselingScript = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingCounseling) {
      window.speechSynthesis.cancel();
      setIsSpeakingCounseling(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isBn ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingCounseling(false);
    utterance.onerror = () => setIsSpeakingCounseling(false);
    setIsSpeakingCounseling(true);
    window.speechSynthesis.speak(utterance);
  };

  // Standards & Interoperability Data Mappings (HL7 FHIR R4 & DHIS2 Tracker)
  const fhirBundleSample = {
    resourceType: "Bundle",
    type: "collection",
    id: `sg-bundle-${selectedChild?.id || 'child-01'}`,
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:patient-${selectedChild?.id || '01'}`,
        resource: {
          resourceType: "Patient",
          id: selectedChild?.id || "child-01",
          identifier: [
            {
              system: "http://dghs.gov.bd/fhir/nid-brn",
              value: selectedChild?.brn || "20251910000000001"
            },
            {
              system: "http://smartguard.bd/nfc-pendant-uid",
              value: selectedChild?.pendantTagId || "04:5A:8B:1A:9C:60:80"
            }
          ],
          active: true,
          name: [{ use: "official", text: selectedChild?.name || "Tanvir Hasan" }],
          gender: "male",
          birthDate: selectedChild?.dob || "2025-11-15",
          telecom: [{ system: "phone", value: selectedChild?.phone || "+8801712345678", use: "mobile" }],
          contact: [
            {
              relationship: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0131", code: "MTH", display: "Mother" }] }],
              name: { text: selectedChild?.motherName || "Rokeya Begum" }
            }
          ],
          address: [
            {
              use: "home",
              type: "physical",
              text: (selectedChild as any)?.location || selectedChild?.clinicName || "Sylhet Haor Flash Flood Basin, Sunamganj, Bangladesh"
            }
          ]
        }
      },
      {
        fullUrl: `urn:uuid:imm-${selectedChild?.id || '01'}-bcg`,
        resource: {
          resourceType: "Immunization",
          id: `imm-${selectedChild?.id || '01'}-bcg`,
          status: "completed",
          vaccineCode: {
            coding: [{ system: "http://hl7.org/fhir/sid/cvx", code: "19", display: "BCG" }],
            text: "BCG (Tuberculosis) + bOPV-0"
          },
          patient: { reference: `Patient/${selectedChild?.id || 'child-01'}` },
          occurrenceDateTime: "2025-11-20T09:30:00+06:00",
          lotNumber: "BCG-2025-09",
          location: { display: "Sunamganj Sadar Upazila Health Complex, DGHS" },
          protocolApplied: [
            {
              series: "Bangladesh National EPI",
              targetDisease: [{ text: "Tuberculosis" }],
              doseNumberPositiveInt: 1
            }
          ]
        }
      },
      {
        fullUrl: `urn:uuid:imm-${selectedChild?.id || '01'}-penta1`,
        resource: {
          resourceType: "Immunization",
          id: `imm-${selectedChild?.id || '01'}-penta1`,
          status: "completed",
          vaccineCode: {
            coding: [{ system: "http://hl7.org/fhir/sid/cvx", code: "198", display: "DTP-hepB-Hib, PCV" }],
            text: "Pentavalent-1 + PCV-1 + bOPV-1 + fIPV-1"
          },
          patient: { reference: `Patient/${selectedChild?.id || 'child-01'}` },
          occurrenceDateTime: "2026-01-20T10:15:00+06:00",
          lotNumber: "PNT-2025-78A",
          location: { display: "Haor Basin Satellite EPI Session Post" },
          protocolApplied: [
            {
              series: "Bangladesh National EPI",
              targetDisease: [{ text: "Diphtheria, Tetanus, Pertussis, HepB, Hib, Pneumococcal" }],
              doseNumberPositiveInt: 1
            }
          ]
        }
      }
    ]
  };

  const dhis2TrackerSample = {
    trackedEntityType: "MCPHISS_CHILD_ENTITY",
    orgUnit: "dghs_org_sunamganj_haor_01",
    attributes: [
      { attribute: "ATTR_CHILD_NAME", value: selectedChild?.name || "Tanvir Hasan" },
      { attribute: "ATTR_MOTHER_NAME", value: selectedChild?.motherName || "Rokeya Begum" },
      { attribute: "ATTR_NFC_TOKEN_AES", value: selectedChild?.pendantToken || "SG-NFC-7A8B9C0D1E2F" },
      { attribute: "ATTR_GEO_RISK", value: (selectedChild as any)?.location || selectedChild?.clinicName || "Sylhet Haor basin" },
      { attribute: "ATTR_DROPOUT_PROBABILITY", value: `${selectedChild?.riskScore ?? 84}%` },
      { attribute: "ATTR_RISK_CATEGORY", value: (selectedChild?.riskScore ?? 84) >= 70 ? "HIGH" : "MODERATE" }
    ],
    enrollments: [
      {
        program: "EPI_BANGLADESH_CHILD_TRACKER",
        status: "ACTIVE",
        enrollmentDate: selectedChild?.dob || "2025-11-15",
        incidentDate: selectedChild?.dob || "2025-11-15",
        events: [
          {
            programStage: "EPI_STAGE_PENTA_PCV",
            status: "OVERDUE",
            eventDate: "2026-02-15",
            dataValues: [
              { dataElement: "DE_VACCINE_MISSED", value: selectedChild?.nextDueDoseName || (selectedChild as any)?.pendingDose || "Pentavalent-2 / PCV-2" },
              { dataElement: "DE_DAYS_OVERDUE", value: String(selectedChild?.daysSinceLastDose ?? selectedChild?.daysOverdue ?? 42) },
              { dataElement: "DE_IVR_STATUS", value: "DIALECT_SCHEDULED" },
              { dataElement: "DE_DIALECT_USED", value: selectedDialect.toUpperCase() }
            ]
          }
        ]
      }
    ]
  };

  const epiAdherenceSample = {
    timelineAuthority: "DGHS Bangladesh National Expanded Programme on Immunization (EPI)",
    complianceStandard: "100% Adherence to National Schedule",
    milestones: [
      { milestone: "Birth", vaccines: ["BCG", "bOPV-0"], target: "0-14 days", status: "COMPLETED" },
      { milestone: "6 Weeks", vaccines: ["Pentavalent-1", "PCV-1", "bOPV-1", "fIPV-1"], target: "42 days", status: "COMPLETED (WITH DELAY)" },
      { milestone: "10 Weeks", vaccines: ["Pentavalent-2", "PCV-2", "bOPV-2"], target: "70 days", status: "OVERDUE (CRITICAL)" },
      { milestone: "14 Weeks", vaccines: ["Pentavalent-3", "PCV-3", "bOPV-3", "fIPV-2"], target: "98 days", status: "PENDING" },
      { milestone: "9 Months", vaccines: ["MR-1"], target: "270 days", status: "PENDING" },
      { milestone: "15 Months", vaccines: ["MR-2"], target: "450 days", status: "PENDING" }
    ]
  };

  // Check speech synthesis support
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSynthSupported(false);
    }
  }, []);

  // Quick telecom ringback tone using Web Audio API
  const playRingTone = (ctx: AudioContext, durationMs = 700): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // 440Hz + 480Hz telecom standard ringtone
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

        osc1.start(now);
        osc2.start(now);

        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch {
            // ignore
          }
          resolve();
        }, durationMs);
      } catch {
        resolve();
      }
    });
  };

  // Fallback to Web Speech Synthesis if audio file fails
  const fallbackToSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = voiceLang === 'bn' ? BANGLA_IVR_SPEECH : ENGLISH_IVR_TRANSCRIPT;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceLang === 'bn' ? 'bn-BD' : 'en-US';
        utterance.rate = 0.9;

        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find((v) =>
          voiceLang === 'bn'
            ? v.lang.includes('bn') || v.lang.includes('ben')
            : v.lang.includes('en')
        );
        if (bnVoice) utterance.voice = bnVoice;

        utterance.onend = () => handleStopVoiceCall();
        utterance.onerror = () => handleStopVoiceCall();

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch {
        handleStopVoiceCall();
      }
    }
  };

  // Handle Play Voice Call with real audio
  const handlePlayVoiceCall = async () => {
    if (isPlayingAudio) {
      handleStopVoiceCall();
      return;
    }

    setCallActive(true);
    setIsPlayingAudio(true);
    setAudioProgress(0);
    setCallDuration(0);
    setCallPhase('ringing');

    // 1. Play realistic telecom ringback tone
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        await playRingTone(audioContextRef.current, 650);
      }
    } catch {
      // ignore
    }

    setCallPhase('connected');

    // 2. Select appropriate audio file
    let audioSrc = '/audio/ivr_tanvir.mp3';
    if (voiceLang === 'en') {
      audioSrc = '/audio/ivr_call_en.mp3';
    } else if (selectedChild?.id === 'child-2') {
      audioSrc = '/audio/ivr_fatima.mp3';
    } else if (selectedChild?.id === 'child-3') {
      audioSrc = '/audio/ivr_sabbir.mp3';
    }

    // Stop any existing instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    const audio = new Audio(audioSrc);
    audio.muted = isMuted;
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCallDuration(Math.floor(audio.currentTime));
        setAudioProgress(Math.round((audio.currentTime / audio.duration) * 100));
      }
    };

    audio.onended = () => {
      handleStopVoiceCall();
    };

    audio.onerror = () => {
      console.warn('Audio file error, falling back to Web Speech API');
      fallbackToSpeechSynthesis();
    };

    try {
      await audio.play();
    } catch (playErr) {
      console.warn('HTML5 Audio play interrupted, using Web Speech API fallback:', playErr);
      fallbackToSpeechSynthesis();
    }
  };

  const handleStopVoiceCall = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
      audioRef.current = null;
    }
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
      callIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsPlayingAudio(false);
    setCallActive(false);
    setCallPhase('idle');
    setAudioProgress(0);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-6">
      {/* Contextual Tour Hint */}
      {guidedTourStep === 5 && (
        <div className="bg-[#F0FDFA] border-2 border-[#0F766E] rounded-xl p-4 text-center shadow-md animate-bounce">
          <span className="text-[13px] font-bold text-[#0F766E] block">
            📍 {isBn ? 'ধাপ ৫: সময় এগিয়ে ড্রপআউট আইভিআর ও কোল্ড চেইন পরীক্ষা' : 'Step 5: Fast-Forward Time & Test IVR Audio Escalation'}
          </span>
          <p className="text-[12px] text-[#334155] mt-0.5">
            {isBn
              ? 'নিচের "+56 Days" বোতামে চাপুন। ৫৬ দিনের ড্রপআউট থ্রেশহোল্ডে স্বয়ংক্রিয় বাংলা আইভিআর কল প্লে করুন।'
              : 'Click "+56 Days" to jump past the dropout boundary. Trigger and listen to the Bangla speech IVR call.'}
          </p>
        </div>
      )}

      {/* 1. Header with Time Machine */}
      <div className="card-base p-6 bg-white border border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 stroke-[2]" />
              </div>
              <h2 className="font-heading font-bold text-[20px] text-[#0B2530]">
                {isBn ? 'ড্রপআউট প্রতিরোধ ইঞ্জিন ও আইভিআর সেন্টার' : 'Dropout Prevention & IVR Escalation'}
              </h2>
            </div>
            <p className="text-[14px] text-[#64748B]">
              {isBn
                ? 'নিয়ম-ভিত্তিক ঝুঁকি স্কোরিং (টিকার ব্যবধান, বাদ পড়া সেশন, ফোন স্ট্যাটাস) এবং অ্যালার্ট ফ্যাটিগ মুক্ত ৫৬-দিনের ভয়েস কল।'
                : 'Rule-based risk scoring with strictly timed notifications: 1 week before and 56 days post-missed dose.'}
            </p>
          </div>

          {/* Time Fast-Forward Buttons */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#CBD5E1]">
            <button
              onClick={() => advanceTime(7)}
              className="px-3.5 py-2 rounded-xl text-[13px] font-bold bg-white hover:bg-[#F1F5F9] text-[#0F766E] border border-[#CBD5E1] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FastForward className="w-4 h-4 text-[#0F766E]" />
              <span>+7 {isBn ? 'দিন' : 'Days'}</span>
            </button>

            <button
              onClick={() => advanceTime(56)}
              className="px-4 py-2 rounded-xl text-[13px] font-bold bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>+56 {isBn ? 'দিন (সীমা)' : 'Days (Threshold)'}</span>
            </button>

            {daysAdvanced > 0 && (
              <button
                onClick={resetTime}
                className="px-3 py-2 rounded-xl text-[12px] font-semibold text-[#64748B] hover:text-[#0B2530] transition-colors cursor-pointer"
                title="Reset simulation to initial date"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Current Simulated Timeline Bar */}
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0F766E]" />
            <span className="text-[#64748B]">{isBn ? 'সিমুলেটেড বর্তমান তারিখ:' : 'Current Simulated Date:'}</span>
            <span className="font-mono font-bold text-[#0B2530]">{currentDate}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]">
              Day +{daysAdvanced}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[12px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" /> Low Risk (0–34)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Moderate (35–69)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Critical Risk (70–100)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side: Risk Scoring Matrix & Interactive IVR Call Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Children Risk Scoring Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-base p-5 bg-white border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[16px] text-[#0B2530]">
                {isBn ? 'শিশুভিত্তিক ঝুঁকি স্কোরিং হিসাব' : 'Rule-Based Risk Score Engine'}
              </h3>
              <span className="text-[11px] text-[#64748B]">
                {childRecords.length} children evaluated
              </span>
            </div>

            <div className="space-y-3">
              {childRecords.map((child) => {
                const isSelected = child.id === selectedChild.id;
                const isCritical = child.riskLevel === 'critical';
                const isModerate = child.riskLevel === 'moderate';

                return (
                  <div
                    key={child.id}
                    onClick={() => selectChild(child.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 bg-[#F0FDFA]/50 shadow-sm'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[14px] text-[#0B2530]">
                            {child.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isCritical
                                ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                                : isModerate
                                ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                                : 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            }`}
                          >
                            {child.riskLevel}
                          </span>
                        </div>
                        <span className="text-[11.5px] text-[#64748B]">
                          Mother: {child.motherName} • Phone: {child.phone}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-[17px] ${
                            isCritical ? 'text-[#B91C1C]' : isModerate ? 'text-[#D97706]' : 'text-[#0F766E]'
                          }`}
                        >
                          {child.riskScore}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] block">/100 pts</span>
                      </div>
                    </div>

                    {/* Scoring Factor Breakdown */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] text-[11px]">
                      <div className="bg-[#F8FAFC] p-2 rounded-lg">
                        <span className="text-[#64748B] block">Days Since Dose:</span>
                        <span className="font-bold text-[#334155]">{child.daysSinceLastDose ?? child.daysOverdue} days</span>
                      </div>

                      <div className="bg-[#F8FAFC] p-2 rounded-lg">
                        <span className="text-[#64748B] block">Missed Sessions:</span>
                        <span className="font-bold text-[#334155]">{child.missedSessions} sessions</span>
                      </div>

                      <div className="bg-[#F8FAFC] p-2 rounded-lg">
                        <span className="text-[#64748B] block">Phone Status:</span>
                        <span
                          className={`font-bold ${
                            child.phoneActive ? 'text-[#15803D]' : 'text-[#B91C1C]'
                          }`}
                        >
                          {child.phoneActive ? 'Reachable' : 'Unreachable (+15)'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable: Why this score */}
                    <div className="pt-2 border-t border-[#E2E8F0]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedChildScoreId((prev) => (prev === child.id ? null : child.id));
                        }}
                        className="text-[11.5px] font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            expandedChildScoreId === child.id ? 'rotate-180 text-[#0F766E]' : ''
                          }`}
                        />
                        <span>{isBn ? 'এই স্কোরের কারণ দেখুন' : 'Why this score'}</span>
                      </button>

                      {expandedChildScoreId === child.id && (
                        <div className="mt-2 p-2.5 rounded-lg bg-[#F8FAFC] text-[11px] font-mono text-[#334155] border border-[#CBD5E1] space-y-1 animate-in fade-in duration-150">
                          <div className="font-sans font-semibold text-[#0F766E]">
                            {isBn ? 'স্কোর বিভাজন নিয়মাবলী:' : 'Scoring Breakdown Calculation:'}
                          </div>
                          <div>
                            • Overdue: +{child.scoreBreakdown?.overduePts ?? 0} ({child.daysSinceLastDose ?? child.daysOverdue}d overdue: {
                              (child.daysSinceLastDose ?? child.daysOverdue) >= 56 ? '56+ = 70pts' :
                              (child.daysSinceLastDose ?? child.daysOverdue) >= 28 ? '28-55 = 50pts' :
                              (child.daysSinceLastDose ?? child.daysOverdue) >= 14 ? '14-27 = 30pts' : '0-13 = 10pts'
                            })
                          </div>
                          <div>
                            • Missed Sessions: +{child.scoreBreakdown?.missedPts ?? 0} ({child.missedSessions} missed @ +10/session)
                          </div>
                          <div>
                            • Contactability: +{child.scoreBreakdown?.phonePts ?? 0} ({child.phoneActive ? 'reachable = +0' : 'unreachable = +15'})
                          </div>
                          <div className="mt-1 pt-1 border-t border-[#CBD5E1] font-bold text-[#0B2530] flex items-center justify-between">
                            <span>Total Score: {child.riskScore}/100 [{child.riskLevel.toUpperCase()}]</span>
                            {(child.daysSinceLastDose ?? child.daysOverdue) >= 56 && (
                              <span className="text-[#DC2626] text-[10px] font-sans font-bold">56+ Days = Mandatory Critical</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Auto Actions Triggered */}
                    {(child.daysSinceLastDose ?? child.daysOverdue) >= 56 && (
                      <div className="mt-2.5 p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between text-[11px]">
                        <span className="text-[#991B1B] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          56-Day Threshold Exceeded
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerIVRCall(child.id);
                          }}
                          className="px-2.5 py-0.5 rounded bg-[#B91C1C] text-white font-semibold text-[10.5px] hover:bg-[#991B1B] cursor-pointer"
                        >
                          {isBn ? 'আইভিআর পাঠান' : 'Dispatch IVR'}
                        </button>
                      </div>
                    )}

                    {/* Gemini AI Clinical Counselor Trigger */}
                    <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAiCounselor(child);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-[#F0FDFA] to-[#E0F2FE] hover:from-[#CCFBF1] hover:to-[#BAE6FD] text-[#0F766E] border border-[#99F6E4] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>{isBn ? '⚡ এআই ডায়াগনস্টিক ও মা-কে কাউন্সেলিং' : '⚡ AI Clinical Counselor & Catch-up Plan'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Simulated IVR Phone Call Card with Browser Speech */}
        <div className="lg:col-span-6 card-base p-6 bg-[#0B2530] text-white border border-[#1E3A47] flex flex-col justify-between shadow-xl">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E3A47] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-sm">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[16px] text-white">
                    {isBn ? 'সিমুলেটেড আইভিআর ভয়েস কল' : 'Simulated Bangla IVR Voice Call'}
                  </h3>
                  <span className="text-[11.5px] text-[#94A3B8]">
                    Target: {selectedChild.phone} ({selectedChild.motherName})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInteroperabilityModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#133240] hover:bg-[#1E3A47] text-[#2DD4BF] text-[11px] font-bold border border-[#2DD4BF]/30 hover:border-[#2DD4BF] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="View HL7 FHIR R4 & DHIS2 Tracker Standards"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{isBn ? 'HL7 FHIR ও DHIS2' : 'FHIR & DHIS2'}</span>
                </button>
                <span className="text-[11px] font-mono bg-[#133240] px-2.5 py-1 rounded text-[#2DD4BF] border border-[#1E3A47]">
                  Gateway: 16263
                </span>
              </div>
            </div>

            {/* Visual Phone Dial Card */}
            <div className="bg-[#133240] rounded-2xl p-5 border border-[#1E3A47] text-center space-y-3">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                isPlayingAudio
                  ? 'bg-[#0F766E] border-2 border-[#2DD4BF] text-white shadow-[0_0_20px_rgba(45,212,191,0.5)] scale-105'
                  : 'bg-[#0F766E]/30 border-2 border-[#2DD4BF] text-[#2DD4BF]'
              }`}>
                <Radio className={`w-8 h-8 ${isPlayingAudio ? 'animate-spin' : 'animate-pulse'}`} />
              </div>

              <div>
                <h4 className="font-bold text-[16px] text-white">{selectedChild.motherName}</h4>
                <p className="text-[12px] text-[#94A3B8]">
                  {selectedChild.phone} • {DIALECT_OPTIONS.find(d => d.key === selectedDialect)?.name} Node
                </p>
                
                {/* Live Call Phase Status */}
                <div className="mt-1 font-mono text-[13px] font-medium">
                  {callPhase === 'ringing' ? (
                    <span className="text-[#FBBF24] animate-pulse flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
                      {isBn ? '📞 ১৬২৬৩ গেটওয়েতে রিং হচ্ছে...' : '📞 Dialing 16263 Gateway (Connecting...)'}
                    </span>
                  ) : callPhase === 'connected' ? (
                    <span className="text-[#2DD4BF] flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping"></span>
                      {isBn ? '🔊 ভয়েস কল চলছে' : '🔊 Call Active'} (00:{callDuration < 10 ? '0' : ''}{callDuration}) • {DIALECT_OPTIONS.find(d => d.key === selectedDialect)?.nameBn}
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">{isBn ? 'স্ট্যান্ডবাই / প্রস্তুত' : 'Standby / Ready'}</span>
                  )}
                </div>
              </div>

              {/* Local Dialect Selector Pills */}
              <div className="pt-1">
                <span className="text-[11px] text-[#94A3B8] block mb-1.5 font-medium">
                  {isBn ? '🗣️ আঞ্চলিক উপভাষা নির্বাচন (DGHS লোকাল আইভিআর):' : '🗣️ Caregiver Dialect Adaptation (DGHS IVR):'}
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {DIALECT_OPTIONS.map((dialect) => {
                    const isSelected = selectedDialect === dialect.key;
                    return (
                      <button
                        key={dialect.key}
                        type="button"
                        onClick={() => {
                          if (isPlayingAudio) handleStopVoiceCall();
                          setSelectedDialect(dialect.key);
                          setCustomIvrMessage(null);
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-center ${
                          isSelected
                            ? 'bg-[#0F766E] border-[#2DD4BF] text-white shadow-xs font-bold ring-1 ring-[#2DD4BF]'
                            : 'bg-[#081B24] border-[#1E3A47] text-[#94A3B8] hover:text-white hover:border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{dialect.nameBn}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span>}
                        </div>
                        <span className="text-[9.5px] opacity-75 truncate">{dialect.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Audio Waveform Simulation */}
              <div className="flex items-center justify-center gap-1.5 h-7 py-1">
                {[12, 24, 18, 30, 20, 14, 28, 16, 22, 10, 26, 18].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isPlayingAudio ? 'bg-[#2DD4BF]' : 'bg-[#334155]'
                    }`}
                    style={{
                      height: isPlayingAudio
                        ? `${Math.max(6, (h * ((callDuration + i) % 4 + 1)) % 32)}px`
                        : '6px',
                    }}
                  />
                ))}
              </div>

              {/* Audio Track Progress Line */}
              {isPlayingAudio && (
                <div className="w-full bg-[#081B24] h-1.5 rounded-full overflow-hidden border border-[#1E3A47]">
                  <div
                    className="bg-[#2DD4BF] h-full transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.max(5, audioProgress))}%` }}
                  />
                </div>
              )}

              {/* Language Selector & Mute Toggle */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="inline-flex rounded-lg bg-[#081B24] p-0.5 border border-[#1E3A47] text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlayingAudio) handleStopVoiceCall();
                      setVoiceLang('bn');
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      voiceLang === 'bn'
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {DIALECT_OPTIONS.find(d => d.key === selectedDialect)?.nameBn || 'বাংলা'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlayingAudio) handleStopVoiceCall();
                      setVoiceLang('en');
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      voiceLang === 'en'
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    English Translation
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#FCA5A5]'
                      : 'bg-[#081B24] border-[#1E3A47] text-[#94A3B8] hover:text-[#2DD4BF]'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Call Action Button */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={handlePlayVoiceCall}
                  className={`h-11 px-6 rounded-xl font-bold text-[13.5px] flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-[#0F766E] hover:bg-[#14B8A6] text-white shadow-[0_4px_15px_rgba(15,118,110,0.4)]'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>{isBn ? 'কল শেষ করুন' : 'End Voice Call'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {voiceLang === 'bn'
                          ? `আইভিআর কল চালান (${DIALECT_OPTIONS.find(d => d.key === selectedDialect)?.nameBn})`
                          : 'Play IVR Voice Call (English)'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Spoken Text Transcript Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#081B24] border border-[#1E3A47] text-left space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span className="font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  🎙️ {voiceLang === 'bn' ? `স্থানীয় উপভাষা (${DIALECT_OPTIONS.find(d => d.key === selectedDialect)?.nameBn}):` : 'English Translation:'}
                </span>
                <span className="font-mono text-[10px] bg-[#0F766E]/30 text-[#5EEAD4] px-1.5 py-0.5 rounded border border-[#0F766E]/50">
                  {DIALECT_OPTIONS.find(d => d.key === selectedDialect)?.badge}
                </span>
              </div>

              {/* Native Bengali Phonetic Script */}
              <div className="p-2.5 rounded-lg bg-[#0B2530] border border-[#1E3A47]">
                <span className="text-[10px] font-mono text-[#2DD4BF] block mb-1">Native Bengali Script:</span>
                <p className="text-[13px] text-[#F1F5F9] font-bangla leading-relaxed">
                  &ldquo;{BANGLA_IVR_SPEECH}&rdquo;
                </p>
              </div>

              {/* English Translation */}
              <div className="p-2.5 rounded-lg bg-[#0B2530]/60 border border-[#1E3A47]">
                <span className="text-[10px] font-mono text-[#94A3B8] block mb-1">English Translation:</span>
                <p className="text-[11.5px] text-[#CBD5E1] italic leading-relaxed">
                  &ldquo;{ENGLISH_IVR_TRANSCRIPT}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Anti-Alert Fatigue Rule Confirmation */}
          <div className="mt-4 pt-3 border-t border-[#1E3A47] flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span className="text-[#2DD4BF] font-semibold">Strict Frequency:</span>
            <span>Only 1 week before & at 56-day boundary</span>
          </div>
        </div>
      </div>

      {/* 3. Anti-Alert Fatigue Policy Banner */}
      <div className="card-base p-5 bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E]">
        <div className="flex items-start gap-3">
          <BellRing className="w-5 h-5 shrink-0 mt-0.5 text-[#0F766E]" />
          <div>
            <h4 className="font-heading font-bold text-[14px] text-[#0B2530] mb-1">
              {isBn ? 'অ্যালার্ট ফ্যাটিগ (ক্লান্তি) প্রতিরোধ নীতিমালা' : 'Anti-Alert Fatigue Protocol: Zero Intermediate Noise'}
            </h4>
            <p className="text-[12.5px] text-[#334155] leading-relaxed">
              {isBn
                ? 'মাঠপর্যায়ের অভিজ্ঞতা থেকে দেখা গেছে অতিরিক্ত ঘন ঘন মেসেজ দিলে অভিভাবকেরা নোটিফিকেশন উপেক্ষা করেন। স্মার্টগার্ড শুধুমাত্র দুইটি সুনির্দিষ্ট বিন্দুতে বার্তা পাঠায়: (১) নির্ধারিত সেশনের ৭ দিন পূর্বে মৃদু অনুস্মারক এসএমএস এবং (২) ড্রপআউটের সংকটজনক সীমা ৫৬ তম দিনে ইন্টারেক্টিভ আইভিআর কল ও অফলাইন ডিউ তালিকায় স্বয়ংক্রিয় অন্তর্ভুক্তি।'
                : 'Frontline trials prove that repeated daily pings cause notification fatigue. SmartGuard triggers outreach at exactly two high-efficacy touchpoints: (1) A gentle SMS 1 week prior to the session, and (2) An automated dialect IVR call at the 56-day critical dropout threshold with immediate addition to the health worker’s offline Due List.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Gemini AI Clinical Counselor & Catch-up Plan Modal */}
      {isAiPlanModalOpen && aiPlanChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0B2530] via-[#0F394B] to-[#0F766E] text-white p-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#2DD4BF] border border-white/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-[16px] text-white">
                      {isBn ? 'স্মার্টগার্ড এআই ক্লিনিক্যাল ডায়াগনস্টিকস' : 'SmartGuard AI Clinical Counselor'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2DD4BF]/20 text-[#5EEAD4] border border-[#2DD4BF]/40">
                      ⚡ Gemini 3.8 Flash
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#CBD5E1]">
                    {isBn ? 'শিশু:' : 'Target:'} <span className="font-bold text-white">{aiPlanChild.name}</span> ({aiPlanChild.age}) • {aiPlanChild.motherName} • {aiPlanChild.location}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiPlanModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-[#334155]">
              {isAiPlanLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-3 border-[#0F766E]/20 border-t-[#0F766E] animate-spin" />
                  <p className="text-[13px] font-semibold text-[#0F766E]">
                    {isBn ? 'স্বাস্থ্য অধিদপ্তরের ইপিআই নির্দেশিকা অনুযায়ী বিশ্লেষণ তৈরি হচ্ছে...' : 'Generating clinical risk analysis and personalized counseling...'}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Processing socio-demographic factors, vaccine timeline, and cultural hesitations
                  </p>
                </div>
              ) : aiPlanData ? (
                <>
                  {/* Urgency & Child Risk Header Banner */}
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#E11D48]" />
                      <span className="text-[12px] font-bold text-[#0B2530]">
                        {isBn ? 'ঝুঁকি স্তর:' : 'Urgency Level:'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFE4E6] text-[#BE123C] border border-[#FDA4AF]">
                        {aiPlanData.urgencyLevel}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      {aiPlanChild.daysSinceLastDose ?? aiPlanChild.daysOverdue}d overdue • Score {aiPlanChild.riskScore}/100
                    </span>
                  </div>

                  {/* 1. Root Cause Analysis */}
                  <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertCircle className="w-4 h-4 text-[#D97706]" />
                      <h4 className="font-heading font-bold text-[13px] text-[#92400E]">
                        {isBn ? '১. ড্রপআউটের মূল কারণ ও ভৌগোলিক ঝুঁকি বিশ্লেষণ' : '1. Root Cause & Environmental Vulnerability'}
                      </h4>
                    </div>
                    <p className="text-[12.5px] text-[#78350F] leading-relaxed">
                      {aiPlanData.rootCauseAnalysis}
                    </p>
                  </div>

                  {/* 2. Mother Counseling Script */}
                  <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#0F766E]" />
                        <h4 className="font-heading font-bold text-[13px] text-[#0F766E]">
                          {isBn ? '২. স্বাস্থ্যকর্মীর মা-কে বোঝানোর স্ক্রিপ্ট (বাংলা)' : '2. Mother Counseling Script (Field Worker Dialect)'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSpeakCounselingScript(aiPlanData.motherCounselingScript)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isSpeakingCounseling
                              ? 'bg-[#E11D48] text-white'
                              : 'bg-white hover:bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]'
                          }`}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isSpeakingCounseling ? (isBn ? 'থামান' : 'Stop') : (isBn ? 'শুনুন' : 'Listen')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(aiPlanData.motherCounselingScript);
                            setCopiedScript(true);
                            setTimeout(() => setCopiedScript(false), 2000);
                          }}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-white hover:bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedScript ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedScript ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[12.5px] text-[#134E4A] font-bangla leading-relaxed bg-white/70 p-3 rounded-lg border border-[#99F6E4]/60">
                      &ldquo;{aiPlanData.motherCounselingScript}&rdquo;
                    </p>
                  </div>

                  {/* 3. Catch-Up Plan */}
                  <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="w-4 h-4 text-[#2563EB]" />
                      <h4 className="font-heading font-bold text-[13px] text-[#1E40AF]">
                        {isBn ? '৩. বাংলাদেশ ইপিআই ক্যাচ-আপ প্রটোকল' : '3. DGHS Catch-up Immunization Protocol'}
                      </h4>
                    </div>
                    <p className="text-[12.5px] text-[#1E3A8A] leading-relaxed">
                      {aiPlanData.catchUpPlan}
                    </p>
                  </div>

                  {/* 4. Tailored IVR Message */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-[#0B2530]" />
                        <h4 className="font-heading font-bold text-[13px] text-[#0B2530]">
                          {isBn ? '৪. কাস্টমাইজড আইভিআর স্বয়ংক্রিয় ভয়েস বার্তা' : '4. Personalized IVR Voice Message'}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomIvrMessage(aiPlanData.customIvrMessage);
                          selectChild(aiPlanChild.id);
                          setIsAiPlanModalOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{isBn ? 'আইভিআর কলে যুক্ত করুন' : 'Apply to IVR Call'}</span>
                      </button>
                    </div>
                    <p className="text-[12px] text-[#475569] font-bangla italic bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                      &ldquo;{aiPlanData.customIvrMessage}&rdquo;
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#64748B]">
                {isBn ? 'স্বাস্থ্য অধিদপ্তর (DGHS) বাংলাদেশ সম্প্রসারিত টিকাদান কর্মসূচি (EPI) ভিত্তিক' : 'Aligned with DGHS EPI Bangladesh protocols'}
              </span>
              <button
                type="button"
                onClick={() => setIsAiPlanModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] font-semibold text-[12px] transition-colors cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Standards & Interoperability Modal (HL7 FHIR R4 & DHIS2 Tracker Capture) */}
      {isInteroperabilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0B2530] via-[#0F394B] to-[#0F766E] text-white p-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#2DD4BF] border border-white/20">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-[16px] text-white">
                      {isBn ? 'মানক ও ইন্টারঅপারেবিলিটি (HL7 FHIR R4 ও DHIS2)' : 'Standards & Interoperability: HL7 FHIR R4 & DHIS2'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2DD4BF]/20 text-[#5EEAD4] border border-[#2DD4BF]/40">
                      DGHS Compliant
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#CBD5E1]">
                    Target Record: <span className="font-bold text-white">{selectedChild?.name || 'Tanvir Hasan'}</span> • BRN: {selectedChild?.brn || '20251910000000001'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInteroperabilityModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-[#CBD5E1] bg-[#F8FAFC] px-4 pt-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInteropTab('fhir')}
                  className={`px-3.5 py-2 text-[12.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    interopTab === 'fhir'
                      ? 'border-[#0F766E] text-[#0F766E] bg-white'
                      : 'border-transparent text-[#64748B] hover:text-[#0B2530]'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>HL7 FHIR R4 (Bundle)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInteropTab('dhis2')}
                  className={`px-3.5 py-2 text-[12.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    interopTab === 'dhis2'
                      ? 'border-[#0F766E] text-[#0F766E] bg-white'
                      : 'border-transparent text-[#64748B] hover:text-[#0B2530]'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>DHIS2 Tracker Capture</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInteropTab('timeline')}
                  className={`px-3.5 py-2 text-[12.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    interopTab === 'timeline'
                      ? 'border-[#0F766E] text-[#0F766E] bg-white'
                      : 'border-transparent text-[#64748B] hover:text-[#0B2530]'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>DGHS EPI Timeline Adherence</span>
                </button>
              </div>

              {/* Copy & Download Actions */}
              <div className="flex items-center gap-2 pb-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const content = interopTab === 'fhir'
                      ? JSON.stringify(fhirBundleSample, null, 2)
                      : interopTab === 'dhis2'
                      ? JSON.stringify(dhis2TrackerSample, null, 2)
                      : JSON.stringify(epiAdherenceSample, null, 2);
                    navigator.clipboard.writeText(content);
                    setCopiedInterop(true);
                    setTimeout(() => setCopiedInterop(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9] font-semibold text-[11.5px] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  {copiedInterop ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInterop ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি JSON' : 'Copy JSON')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const content = interopTab === 'fhir'
                      ? JSON.stringify(fhirBundleSample, null, 2)
                      : interopTab === 'dhis2'
                      ? JSON.stringify(dhis2TrackerSample, null, 2)
                      : JSON.stringify(epiAdherenceSample, null, 2);
                    const blob = new Blob([content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `smartguard_${interopTab}_${selectedChild?.id || 'record'}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0F766E] text-white hover:bg-[#115E59] font-semibold text-[11.5px] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ডাউনলোড' : 'Download'}</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 text-[#334155] font-mono text-[12px]">
              {interopTab === 'fhir' && (
                <div className="space-y-3">
                  <div className="bg-[#F0FDFA] border border-[#99F6E4] p-3 rounded-xl font-sans text-[12px] text-[#0F766E] flex items-center justify-between">
                    <span>
                      ✓ <strong>HL7 FHIR R4</strong> Standard: Mapped <code>Patient</code> & <code>Immunization</code> resources with SNOMED/CVX coding and NFC Token UIDs.
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#99F6E4]">
                      Bundle (Collection)
                    </span>
                  </div>
                  <pre className="p-4 bg-[#081B24] text-[#E2E8F0] rounded-xl overflow-x-auto text-[11.5px] leading-relaxed border border-[#1E3A47]">
                    {JSON.stringify(fhirBundleSample, null, 2)}
                  </pre>
                </div>
              )}

              {interopTab === 'dhis2' && (
                <div className="space-y-3">
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded-xl font-sans text-[12px] text-[#1E40AF] flex items-center justify-between">
                    <span>
                      ✓ <strong>DHIS2 Tracker Capture</strong>: Aligned with Directorate General of Health Services (DGHS) Tracker schema for Upazila Health Complexes.
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#BFDBFE]">
                      Tracker Entity Instance
                    </span>
                  </div>
                  <pre className="p-4 bg-[#081B24] text-[#E2E8F0] rounded-xl overflow-x-auto text-[11.5px] leading-relaxed border border-[#1E3A47]">
                    {JSON.stringify(dhis2TrackerSample, null, 2)}
                  </pre>
                </div>
              )}

              {interopTab === 'timeline' && (
                <div className="space-y-4 font-sans">
                  <div className="p-3 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl text-[12.5px] text-[#0F766E]">
                    <strong>বাংলাদেশ জাতীয় সম্প্রসারিত টিকাদান কর্মসূচি (EPI) সময়সীমা নীতি:</strong>
                    <p className="text-[12px] text-[#334155] mt-1">
                      Strict adherence to DGHS guidelines: BCG & bOPV-0 at birth, Pentavalent 1-3 & PCV 1-3 at 6, 10, 14 weeks with fIPV, MR-1 at 9 months, and MR-2 at 15 months.
                    </p>
                  </div>

                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-[12.5px]">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">EPI Milestone</th>
                          <th className="py-2.5 px-3">Target Vaccines</th>
                          <th className="py-2.5 px-3">Standard Interval</th>
                          <th className="py-2.5 px-3">Current Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        <tr className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#0B2530]">Birth</td>
                          <td className="py-2.5 px-3 text-[#334155]">BCG, bOPV-0</td>
                          <td className="py-2.5 px-3 text-[#64748B]">0-14 days post delivery</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#DCFCE7] text-[#15803D]">COMPLETED</span></td>
                        </tr>
                        <tr className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#0B2530]">6 Weeks</td>
                          <td className="py-2.5 px-3 text-[#334155]">Pentavalent-1, PCV-1, bOPV-1, fIPV-1</td>
                          <td className="py-2.5 px-3 text-[#64748B]">At least 42 days from birth</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF3C7] text-[#B45309]">COMPLETED (DELAY: 28d)</span></td>
                        </tr>
                        <tr className="hover:bg-[#F8FAFC] bg-[#FEF2F2]/50">
                          <td className="py-2.5 px-3 font-bold text-[#991B1B]">10 Weeks</td>
                          <td className="py-2.5 px-3 text-[#334155] font-semibold">Pentavalent-2, PCV-2, bOPV-2</td>
                          <td className="py-2.5 px-3 text-[#64748B]">Min 4 weeks after Dose 1</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C] animate-pulse">OVERDUE (CRITICAL)</span></td>
                        </tr>
                        <tr className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#0B2530]">14 Weeks</td>
                          <td className="py-2.5 px-3 text-[#334155]">Pentavalent-3, PCV-3, bOPV-3, fIPV-2</td>
                          <td className="py-2.5 px-3 text-[#64748B]">Min 4 weeks after Dose 2</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#64748B]">PENDING</span></td>
                        </tr>
                        <tr className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#0B2530]">9 Months</td>
                          <td className="py-2.5 px-3 text-[#334155]">MR-1 (Measles & Rubella)</td>
                          <td className="py-2.5 px-3 text-[#64748B]">270 days of age</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#64748B]">PENDING</span></td>
                        </tr>
                        <tr className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#0B2530]">15 Months</td>
                          <td className="py-2.5 px-3 text-[#334155]">MR-2 (Second Booster)</td>
                          <td className="py-2.5 px-3 text-[#64748B]">Min 6 months after MR-1</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#64748B]">PENDING</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#F8FAFC] border-t border-[#CBD5E1] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#64748B]">
                Compliant with HL7 FHIR Release 4 and DHIS2 Web API version 2.40
              </span>
              <button
                type="button"
                onClick={() => setIsInteroperabilityModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] font-semibold text-[12px] transition-colors cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
