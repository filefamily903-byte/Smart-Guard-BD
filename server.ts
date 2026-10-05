import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const rootDir = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini with telemetry header
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Resilient generation with fallback across standard models
  async function generateWithFallback(params: {
    contents: any;
    config?: any;
  }) {
    const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;
    for (const model of models) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying fallback:`, err?.message || err);
      }
    }
    throw lastError;
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      aiConfigured: !!process.env.GEMINI_API_KEY,
      model: "gemini-3.8-flash",
    });
  });

  // 1. Shurakkha AI Smart Chatbot endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, lang = "bn", history = [] } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "Gemini API key is not configured",
        });
      }

      const isBn = lang === "bn";
      const systemInstruction = `You are 'Shurakkha AI' (সুরক্ষা এআই), the authoritative yet warm, reassuring digital health and immunization assistant for SmartGuard BD (স্মার্টগার্ড বিডি), working in alignment with the Directorate General of Health Services (DGHS) and the Expanded Programme on Immunization (EPI) in Bangladesh.

Key Knowledge Base:
- SmartGuard BD wearable: Cultural 'Kala Dhaga' (কালো সুতা / তাগা) amulet containing a 100% passive, battery-free NFC chip (NTAG 213, ISO 14443A).
- Zero PII on chip: Only contains a cryptographic tokenized ID (AES-128); actual sensitive names and records reside securely in DGHS VaxEPI servers.
- Physical safety: High-grade non-toxic medical silicone, choke-proof breakaway safety clasp (snaps at 4.2 kg tension), IP68 waterproof (survives daily river/pond bathing, cooking smoke).
- Offline First: Community Health Workers (Amena Khatun, etc.) use Android NFC phones to scan pendants in remote riverine chars and haors with zero internet. Syncs securely via HMAC-SHA256 queue when connectivity returns.
- Bangladesh EPI Schedule:
  * Birth: BCG (Tuberculosis) + bOPV-0
  * 6 Weeks: Pentavalent-1 (DTP-HepB-Hib) + PCV-1 + bOPV-1 + fIPV-1
  * 10 Weeks: Pentavalent-2 + PCV-2 + bOPV-2
  * 14 Weeks: Pentavalent-3 + PCV-3 + bOPV-3 + fIPV-2
  * 9 Months: MR-1 (Measles-Rubella)
  * 15 Months: MR-2
- Vaccine side effects: Normal mild fever or soreness is an expected immune response, manageable with cool compress or pediatrician-advised pediatric paracetamol drops. It is NEVER a reason to abandon vaccines.
- Dialect/Language: Respond primarily in ${isBn ? "clear, respectful, natural Bengali (বাংলা)" : "clear, professional, warm English"}.
- Formatting: Provide an easy-to-read, empathetic answer. If applicable, end with 2-3 concise bullet points under "Key Points:" or "মূল বিষয়সমূহ:".`;

      const formattedHistory = (Array.isArray(history) ? history : [])
        .slice(-4)
        .map((h: any) => `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`)
        .join("\n");

      const promptContent = formattedHistory
        ? `Previous conversation context:\n${formattedHistory}\n\nCurrent User Question: ${message}`
        : message;

      const response = await generateWithFallback({
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || (isBn ? "দুঃখিত, এই মুহূর্তে উত্তর তৈরি করা সম্ভব হয়নি।" : "I could not generate a response right now.");
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({
        error: error.message || "Failed to generate AI response",
      });
    }
  });

  // 2. AI Dropout Risk Diagnostics & Mother Counseling Plan
  app.post("/api/gemini/dropout-counseling", async (req, res) => {
    try {
      const { child, lang = "bn" } = req.body;
      if (!child) {
        return res.status(400).json({ error: "Child record is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "Gemini API key is not configured" });
      }

      const prompt = `Analyze this high-risk immunization dropout case from rural Bangladesh:
Child Name: ${child.name || "Unknown"}
Age: ${child.age || "Unknown"}
Mother: ${child.motherName || "Caregiver"}
Location: ${child.location || "Char Zone, Bangladesh"}
Days Overdue: ${child.daysOverdue ?? child.daysSinceLastDose ?? 30} days
Missed Vaccine: ${child.missedVaccine || child.pendingDose || "Pentavalent / PCV"}
Missed Sessions Count: ${child.missedSessions ?? 2}
Risk Score: ${child.riskScore ?? 80}/100
Primary Risk Factor: ${child.primaryRiskFactor || "River erosion displacement / Seasonal migration / Vaccine hesitancy"}
Phone Reachable: ${child.phoneActive ? "Yes" : "No"}

Provide a structured clinical intervention plan in JSON format:
1. rootCauseAnalysis: Clinical and socioeconomic analysis of why this child is dropping out (in ${lang === "bn" ? "Bengali (বাংলা)" : "English"}).
2. motherCounselingScript: Empathetic, culturally respectful script in Bengali (বাংলা) for the Health Worker (Amena Khatun) to speak directly to the mother, overcoming fear of vaccine fever or travel hurdles.
3. catchUpPlan: Specific immediate medical recommendation for catch-up doses according to Bangladesh EPI protocols.
4. customIvrMessage: A short, localized automated phone message script in Bengali (1-2 sentences) addressed by name to the mother reminding her gently to visit the clinic.
5. urgencyLevel: 'CRITICAL' | 'HIGH' | 'MODERATE'`;

      const response = await generateWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rootCauseAnalysis: { type: Type.STRING },
              motherCounselingScript: { type: Type.STRING },
              catchUpPlan: { type: Type.STRING },
              customIvrMessage: { type: Type.STRING },
              urgencyLevel: { type: Type.STRING },
            },
            required: ["rootCauseAnalysis", "motherCounselingScript", "catchUpPlan", "customIvrMessage", "urgencyLevel"],
          },
          systemInstruction: "You are the Senior Public Health & EPI Epidemiologist Consultant for DGHS Bangladesh & SmartGuard BD. Provide culturally grounded, medically accurate, high-empathy guidance.",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Dropout Counseling Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI counseling plan" });
    }
  });

  // 3. Field App Clinical Dose & AEFI Advisor for Community Health Workers
  app.post("/api/gemini/clinical-guidance", async (req, res) => {
    try {
      const { query, childName, vaccine, lang = "bn" } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "Gemini API key is not configured" });
      }

      const prompt = `As an expert Bangladesh EPI & DGHS Clinical Protocol Assistant for Community Health Workers:
Context: Child: ${childName || "Infant"}, Vaccine in question: ${vaccine || "General EPI"}
Worker Question: "${query}"

Provide a concise, practical, field-ready clinical protocol answer in ${lang === "bn" ? "Bengali (বাংলা)" : "English"}.
Keep it actionable for a health worker standing in a char clinic.`;

      const response = await generateWithFallback({
        contents: prompt,
        config: {
          systemInstruction: "You are the field-ready DGHS Immunization Clinical Guide for community health workers in Bangladesh. Be clear, accurate, reassuring, and concise.",
        },
      });

      res.json({ guidance: response.text });
    } catch (error: any) {
      console.error("Gemini Clinical Guidance Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate clinical guidance" });
    }
  });

  // 4. SmartGuard BD Core Health Intelligence Engine endpoint (Dropout Assessment, Dialect IVR, HL7 FHIR R4 & DHIS2)
  app.post("/api/gemini/health-intelligence", async (req, res) => {
    try {
      const {
        child = {
          name: "Tanvir Hasan",
          dob: "2025-11-15",
          gender: "male",
          motherName: "Rokeya Begum",
          phone: "+8801712345678",
          distanceToClinicKm: 6.5,
          maternalLiteracy: "none",
          priorDoseDelayDays: { bcg: 7, penta1: 28 },
          geographicalVulnerability: "Sylhet Haor flash flood basins",
          pendingDose: "Penta-2 / PCV-2",
        },
        dialect = "sylheti",
      } = req.body;

      const fallbackIntelligence = {
        engine: "SmartGuard BD Core Health Intelligence Engine",
        version: "1.0.0",
        guidelines: "DGHS Bangladesh EPI Clinical & Logistics Standard 2026",
        dropoutRiskAssessment: {
          probabilityScore: 84,
          riskCategory: "HIGH",
          rootDrivers: [
            `Geographical isolation in ${child.geographicalVulnerability || "Sylhet Haor flash flood basins"} (${child.distanceToClinicKm || 6.5}km from nearest EPI clinic)`,
            `Maternal literacy barrier (${child.maternalLiteracy || "none"}) with lack of awareness regarding multi-dose schedule intervals`,
            `Prior dose delay: Penta-1 delayed by ${child.priorDoseDelayDays?.penta1 || 28} days (early predictor of dropout cascade)`,
            "Seasonal disruption / monsoonal haor transport constraint"
          ],
          variablesAnalyzed: {
            distanceToClinicKm: child.distanceToClinicKm || 6.5,
            maternalLiteracy: child.maternalLiteracy || "none",
            priorDoseDelayDays: child.priorDoseDelayDays || { bcg: 7, penta1: 28 },
            geographicalVulnerability: child.geographicalVulnerability || "Sylhet Haor flash flood basins"
          }
        },
        dialectAwareIvr: {
          targetDialect: dialect,
          allDialects: {
            sylheti: {
              name: "Sylheti (সিলেটি)",
              region: "Haor Basin / Sylhet Division",
              scriptNative: `আসসালামু আলাইকুম। স্মার্টগার্ড বিডি আর স্বাস্থ্য অধিদপ্তর থাকি কইরাম। ${child.motherName || "রোকেয়া"} বইন, আফনার হুরুতা ${child.name || "তানভীর"}-এর টিকার দিন পার অই গেছে গা। হাওরের বাদল আর পানির ডরে টিকা বাদ দিবা না। সামনর সেশনে স্বাস্থ্যকেন্দ্রে আইয়া তানভীরে টিকা দিয়া যান। তানভীর ভালা থাকব।`,
              scriptEnglish: `Assalamu Alaikum. This is SmartGuard BD and DGHS health directorate calling. Sister ${child.motherName || "Rokeya"}, your child ${child.name || "Tanvir"}'s vaccination date has passed. Do not skip vaccination out of fear of haor rains and water. Please bring ${child.name || "Tanvir"} to the clinic during the upcoming session. ${child.name || "Tanvir"} will remain healthy.`
            },
            rangpuri: {
              name: "Rangpuri / Rajbongshi (রংপুরী)",
              region: "Kurigram / Brahmaputra Riverine Chars",
              scriptNative: `আসসালামু আলাইকুম বুজি। স্মার্টগার্ড আর স্বাস্থ্য অফিসের তকনে কবার ধরছি। ${child.motherName || "রোকেয়া"} বুজি, তোমার ছাওয়া ${child.name || "তানভীর"}-এর টিকার সময় পার হইয়া গেইচে। চরোত বান-পানির কষ্ট হইলেও ছাওয়াটার টিকা বাদ দেন না। সামনের টিকাদান ঘাটে আসিয়া তানভীরক সুঁইটা দিয়া যান।`,
              scriptEnglish: `Assalamu Alaikum sister. Calling from SmartGuard and the health office. Sister ${child.motherName || "Rokeya"}, your child ${child.name || "Tanvir"}'s immunization date has elapsed. Even with the hardships of river char floods, do not abandon the child's vaccine. Come to the upcoming immunization post and get ${child.name || "Tanvir"} vaccinated.`
            },
            chittagonian: {
              name: "Chittagonian (চাটগাঁইয়া)",
              region: "Southeastern Coastal / CHT Border",
              scriptNative: `আসসালামু আলাইকুম। স্বাস্থ্য অধিদপ্তর আর স্মার্টগার্ডত্তুন অঁনারে হদ্দে। ${child.motherName || "রোকেয়া"} বইন, অঁনার গুঁড়া ${child.name || "তানভীর"}-এর টিকার তারিক পার অই গেইয়েগৈ। পাহাড়ি পথ বা সাগরের বাদল্লে ডরাই টিকা ন ফেলাইবেন। অগ্গো সেশনত স্বাস্থ্যকেন্দ্রে আই তানভীরে টিকা দি ফেলাইবুন।`,
              scriptEnglish: `Assalamu Alaikum. Speaking to you from the Health Directorate and SmartGuard. Sister ${child.motherName || "Rokeya"}, your little one ${child.name || "Tanvir"}'s vaccination date has passed. Do not skip vaccines due to mountain terrain or coastal rain. Please bring ${child.name || "Tanvir"} to the upcoming session at the health clinic.`
            },
            standard_bengali: {
              name: "Standard Bengali (প্রমিত বাংলা)",
              region: "Institutional / DGHS 16263",
              scriptNative: `আসসালামু আলাইকুম। স্বাস্থ্য অধিদপ্তর ও স্মার্টগার্ড বিডি ১৬২৬৩ হেল্পলাইন থেকে জানানো যাচ্ছে। সম্মানিত অভিভাবক ${child.motherName || "রোকেয়া বেগম"}, আপনার শিশু ${child.name || "তানভীর হাসান"}-এর নির্ধারিত জীবনরক্ষাকারী টিকার সময় পার হয়ে গিয়েছে। শিশুর সুরক্ষায় আগামী সেশনেই নিকটস্থ স্বাস্থ্যকেন্দ্রে নিয়ে আসুন।`,
              scriptEnglish: `Assalamu Alaikum. Notification from the Directorate General of Health Services and SmartGuard BD 16263 Helpline. Respected caregiver ${child.motherName || "Rokeya Begum"}, the scheduled life-saving vaccination for your child ${child.name || "Tanvir Hasan"} is overdue. For your child's protection, please visit your nearest health clinic during the upcoming session.`
            }
          }
        },
        standardsAndInteroperability: {
          epiAdherence: {
            timelineAuthority: "DGHS Bangladesh National EPI Schedule",
            schedule: [
              { stage: "At Birth", vaccines: ["BCG", "bOPV-0"], status: "COMPLETED", delayDays: child.priorDoseDelayDays?.bcg ?? 7 },
              { stage: "6 Weeks", vaccines: ["Pentavalent-1", "PCV-1", "bOPV-1", "fIPV-1"], status: "COMPLETED_WITH_DELAY", delayDays: child.priorDoseDelayDays?.penta1 ?? 28 },
              { stage: "10 Weeks", vaccines: ["Pentavalent-2", "PCV-2", "bOPV-2"], status: "OVERDUE_CURRENT", delayDays: 42 },
              { stage: "14 Weeks", vaccines: ["Pentavalent-3", "PCV-3", "bOPV-3", "fIPV-2"], status: "PENDING", delayDays: 0 },
              { stage: "9 Months", vaccines: ["MR-1 (Measles-Rubella)"], status: "PENDING", delayDays: 0 },
              { stage: "15 Months", vaccines: ["MR-2"], status: "PENDING", delayDays: 0 }
            ]
          },
          hl7FhirR4: {
            resourceType: "Bundle",
            type: "collection",
            id: `sg-bundle-${Date.now()}`,
            entry: [
              {
                fullUrl: "urn:uuid:patient-001",
                resource: {
                  resourceType: "Patient",
                  id: "sg-child-tanvir-01",
                  identifier: [
                    {
                      system: "http://dghs.gov.bd/fhir/nid-brn",
                      value: "20251910000000001"
                    },
                    {
                      system: "http://smartguard.bd/nfc-pendant-uid",
                      value: "04:5A:8B:1A:9C:60:80"
                    }
                  ],
                  active: true,
                  name: [{ use: "official", text: child.name || "Tanvir Hasan" }],
                  gender: child.gender || "male",
                  birthDate: child.dob || "2025-11-15",
                  telecom: [{ system: "phone", value: child.phone || "+8801712345678", use: "mobile" }],
                  contact: [
                    {
                      relationship: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0131", code: "MTH", display: "Mother" }] }],
                      name: { text: child.motherName || "Rokeya Begum" }
                    }
                  ],
                  address: [{ text: child.geographicalVulnerability || "Sylhet Haor Flash Flood Basin, Sunamganj, Bangladesh" }]
                }
              },
              {
                fullUrl: "urn:uuid:immunization-001",
                resource: {
                  resourceType: "Immunization",
                  id: "sg-imm-penta1",
                  status: "completed",
                  vaccineCode: {
                    coding: [
                      {
                        system: "http://hl7.org/fhir/sid/cvx",
                        code: "198",
                        display: "DTP-hepB-Hib (Pentavalent)"
                      }
                    ],
                    text: "Pentavalent-1 (DTP-HepB-Hib)"
                  },
                  patient: { reference: "Patient/sg-child-tanvir-01" },
                  occurrenceDateTime: "2026-01-20T09:30:00+06:00",
                  location: { display: "Sunamganj Haor Upazila Health Complex / EPI Outreach Center" },
                  protocolApplied: [
                    {
                      series: "Bangladesh National EPI",
                      targetDisease: [{ text: "Diphtheria, Tetanus, Pertussis, Hepatitis B, Haemophilus influenzae b" }],
                      doseNumberPositiveInt: 1
                    }
                  ]
                }
              }
            ]
          },
          dhis2TrackerCapture: {
            trackedEntityType: "MCPHISS_CHILD_ENTITY",
            orgUnit: "dghs_org_sunamganj_haor_01",
            attributes: [
              { attribute: "ATTR_CHILD_NAME", value: child.name || "Tanvir Hasan" },
              { attribute: "ATTR_MOTHER_NAME", value: child.motherName || "Rokeya Begum" },
              { attribute: "ATTR_NFC_TOKEN_AES", value: "SG-NFC-7A8B9C0D1E2F" },
              { attribute: "ATTR_GEO_RISK", value: child.geographicalVulnerability || "Sylhet Haor basin" },
              { attribute: "ATTR_DROPOUT_PROBABILITY", value: "84%" }
            ],
            enrollments: [
              {
                program: "EPI_BANGLADESH_CHILD_TRACKER",
                status: "ACTIVE",
                enrollmentDate: child.dob || "2025-11-15",
                incidentDate: child.dob || "2025-11-15",
                events: [
                  {
                    programStage: "EPI_STAGE_PENTA_PCV",
                    status: "ACTIVE",
                    eventDate: "2026-02-15",
                    dataValues: [
                      { dataElement: "DE_VACCINE_MISSED", value: child.pendingDose || "Penta-2" },
                      { dataElement: "DE_DROPOUT_RISK_SCORE", value: "84" },
                      { dataElement: "DE_IVR_STATUS", value: "DIALECT_SCHEDULED" }
                    ]
                  }
                ]
              }
            ]
          }
        }
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackIntelligence);
      }

      // If Gemini API Key is available, enhance with AI
      try {
        const prompt = `You are the SmartGuard BD Core Health Intelligence Engine, supporting child immunization logistics and tracking across Bangladesh under DGHS guidelines.

Analyze this child immunization record:
Child: ${JSON.stringify(child)}
Target Dialect: ${dialect}

Output pure valid JSON conforming strictly to:
{
  "engine": "SmartGuard BD Core Health Intelligence Engine",
  "version": "1.0.0",
  "guidelines": "DGHS Bangladesh EPI Clinical & Logistics Standard 2026",
  "dropoutRiskAssessment": {
    "probabilityScore": <number 0-100>,
    "riskCategory": "LOW" | "MODERATE" | "HIGH",
    "rootDrivers": [<string array of specific root drivers including distance, literacy, delay, geography>],
    "variablesAnalyzed": {
      "distanceToClinicKm": <number>,
      "maternalLiteracy": <string>,
      "priorDoseDelayDays": <object>,
      "geographicalVulnerability": <string>
    }
  },
  "dialectAwareIvr": {
    "targetDialect": "${dialect}",
    "allDialects": {
      "sylheti": {
        "name": "Sylheti (সিলেটি)",
        "region": "Haor Basin / Sylhet Division",
        "scriptNative": "<Authentic Sylheti dialect Bengali script with haor idioms>",
        "scriptEnglish": "<English translation>"
      },
      "rangpuri": {
        "name": "Rangpuri / Rajbongshi (রংপুরী)",
        "region": "Kurigram / Brahmaputra Riverine Chars",
        "scriptNative": "<Authentic Rangpuri / Rajbongshi dialect Bengali script with riverine char idioms>",
        "scriptEnglish": "<English translation>"
      },
      "chittagonian": {
        "name": "Chittagonian (চাটগাঁইয়া)",
        "region": "Southeastern Coastal / CHT Border",
        "scriptNative": "<Authentic Chittagonian dialect Bengali script with coastal idioms>",
        "scriptEnglish": "<English translation>"
      },
      "standard_bengali": {
        "name": "Standard Bengali (প্রমিত বাংলা)",
        "region": "Institutional / DGHS 16263",
        "scriptNative": "<Formal DGHS Bangla script>",
        "scriptEnglish": "<English translation>"
      }
    }
  },
  "standardsAndInteroperability": {
    "epiAdherence": {
      "timelineAuthority": "DGHS Bangladesh National EPI Schedule",
      "schedule": [
        { "stage": "At Birth", "vaccines": ["BCG", "bOPV-0"], "status": "COMPLETED" },
        { "stage": "6 Weeks", "vaccines": ["Pentavalent-1", "PCV-1", "bOPV-1", "fIPV-1"], "status": "COMPLETED_WITH_DELAY" },
        { "stage": "10 Weeks", "vaccines": ["Pentavalent-2", "PCV-2", "bOPV-2"], "status": "OVERDUE_CURRENT" },
        { "stage": "14 Weeks", "vaccines": ["Pentavalent-3", "PCV-3", "bOPV-3", "fIPV-2"], "status": "PENDING" },
        { "stage": "9 Months", "vaccines": ["MR-1 (Measles-Rubella)"], "status": "PENDING" },
        { "stage": "15 Months", "vaccines": ["MR-2"], "status": "PENDING" }
      ]
    },
    "hl7FhirR4": {
      "resourceType": "Bundle",
      "type": "collection",
      "id": "sg-fhir-bundle-export",
      "entry": [...]
    },
    "dhis2TrackerCapture": {
      "trackedEntityType": "MCPHISS_CHILD_ENTITY",
      "orgUnit": "dghs_org_unit_bd",
      "attributes": [...],
      "enrollments": [...]
    }
  }
}`;

        const aiResponse = await generateWithFallback({
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are the SmartGuard BD Core Health Intelligence Engine. Respond strictly with valid JSON. Never output conversational filler.",
          },
        });

        const parsed = JSON.parse(aiResponse.text || "{}");
        return res.json(parsed);
      } catch (genErr) {
        console.warn("Gemini generation failed, returning robust fallback intelligence:", genErr);
        return res.json(fallbackIntelligence);
      }
    } catch (error: any) {
      console.error("Health Intelligence Engine Error:", error);
      res.status(500).json({ error: error.message || "Engine execution failed" });
    }
  });

  // Dedicated PWA routes ensuring correct MIME types across dev and prod
  app.get("/sw.js", (_req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Service-Worker-Allowed", "/");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(process.cwd(), "public", "sw.js"));
  });

  app.get(["/manifest.webmanifest", "/manifest.json"], (_req, res) => {
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(path.join(process.cwd(), "public", "manifest.webmanifest"));
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
