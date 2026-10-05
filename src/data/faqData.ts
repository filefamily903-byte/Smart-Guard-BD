import { Language } from '../types';

export interface FAQItem {
  id: string;
  category: 'pendant' | 'battery' | 'privacy' | 'offline';
  categoryLabelEn: string;
  categoryLabelBn: string;
  questionEn: string;
  questionBn: string;
  answerEn: string;
  answerBn: string;
  keyTakeawaysEn?: string[];
  keyTakeawaysBn?: string[];
}

export const FAQ_DATA: FAQItem[] = [
  // -------------------------------------------------------------
  // 1. BATTERY & HARDWARE
  // -------------------------------------------------------------
  {
    id: 'faq-battery-1',
    category: 'battery',
    categoryLabelEn: 'Battery & Power',
    categoryLabelBn: 'ব্যাটারি ও পাওয়ার',
    questionEn: 'Does the pendant have a battery or require regular charging?',
    questionBn: 'স্মার্ট লকেটে কি কোনো ব্যাটারি আছে বা এটি কি চার্জ দিতে হয়?',
    answerEn:
      'No. The SmartGuard pendant contains ZERO batteries and never needs to be recharged or plugged in. It operates using 100% passive NFC (Near Field Communication) silicon. It remains inert until a health worker’s smartphone comes within 2–4 cm, instantly harvesting a minute burst of electromagnetic energy via magnetic induction to transmit and record immunization data in under 2 seconds.',
    answerBn:
      'না। স্মার্টগার্ড লকেটে কোনো ব্যাটারি নেই এবং এটি কখনোই চার্জ দেওয়ার প্রয়োজন হয় না। এটি শতভাগ প্যাসিভ এনএফসি (Near Field Communication) প্রযুক্তিতে চলে। স্বাস্থ্যকর্মীর ফোন ২-৪ সেমি কাছে আনলে ফোন থেকে সূক্ষ্ম তড়িৎ-চৌম্বকীয় শক্তি সংগ্রহ করে মাত্র ২ সেকেন্ডের মধ্যে টিকার তথ্য আদান-প্রদান সম্পন্ন করে।',
    keyTakeawaysEn: [
      '100% passive NFC — zero charging cords, zero batteries',
      'Lifespan of 10+ years covering all routine EPI doses and childhood boosters',
      'Unaffected by village power cuts, load shedding, or rural off-grid environments',
    ],
    keyTakeawaysBn: [
      'শতভাগ প্যাসিভ এনএফসি — চার্জার বা ব্যাটারির ঝামেলামুক্ত',
      '১০+ বছরের কর্মক্ষমতা যা শিশুর সম্পূর্ণ টিকাদান মেয়াদের চেয়েও দীর্ঘ',
      'বিদ্যুৎহীন চরাঞ্চল বা গ্রামীণ লোডশেডিংয়েও নির্বিঘ্নে সচল',
    ],
  },
  {
    id: 'faq-battery-2',
    category: 'battery',
    categoryLabelEn: 'Battery & Power',
    categoryLabelBn: 'ব্যাটারি ও পাওয়ার',
    questionEn: 'How can the device last through all 18+ months of childhood vaccinations without maintenance?',
    questionBn: 'কোনো রক্ষণাবেক্ষণ ছাড়াই লকেটটি শিশুর ১৮+ মাসের টিকাদান সময় কীভাবে সচল থাকে?',
    answerEn:
      'Because passive NFC microchips have no moving mechanical components, chemical battery fluids, or degradation cycles, the solid-state silicon chip encased inside medical-grade resin is rated for over 100,000 read/write operations and 10+ years of retention. It comfortably outlasts the entire national 18-month EPI timeline.',
    answerBn:
      'প্যাসিভ এনএফসি মাইক্রোচিপে কোনো তরল কেমিক্যাল বা ক্ষয়শীল উপাদান নেই। মেডিকেল-গ্রেড রজনের ভেতর সুরক্ষিত এই সিলিকন চিপ ১,০০,০০০ বারের বেশি রিড/রাইট এবং ১০ বছরের বেশি ডেটা সুরক্ষার নিশ্চয়তা দেয়, যা শিশুর পুরো টিকাদান সময়কালের জন্য যথেষ্ট।',
    keyTakeawaysEn: [
      'Rated for >100,000 field scan cycles',
      'Industrial solid-state construction with no chemical battery decay',
    ],
    keyTakeawaysBn: [
      '১ লক্ষাধিকবার স্ক্যান ও তথ্য লেখার সক্ষমতা',
      'ব্যাটারি ক্ষয় বা লিকেজের কোনো ঝুঁকি নেই',
    ],
  },

  // -------------------------------------------------------------
  // 2. NFC PENDANT USAGE & WEARABILITY
  // -------------------------------------------------------------
  {
    id: 'faq-pendant-1',
    category: 'pendant',
    categoryLabelEn: 'Pendant & Wearability',
    categoryLabelBn: 'লকেট ও পরিধান',
    questionEn: 'How is the pendant worn, and is it physically safe for newborn babies?',
    questionBn: 'লকেটটি শিশু কীভাবে পরিধান করবে এবং এটি নবজাতকের জন্য কতটা নিরাপদ?',
    answerEn:
      'The pendant is worn either around the infant’s neck or wrist, modeled intentionally after the cultural tradition of the protective black thread ("Kala Dhaga" / কালো সুতা). It is crafted from baby-safe, hypoallergenic, BPA-free medical silicone with smooth rounded edges. Crucially, it incorporates a safety breakaway clasp that unlocks automatically if snagged with greater than 1.5 kg of force, eliminating any risk of choking or strangulation.',
    answerBn:
      'লকেটটি ঐতিহ্যবাহী কালা সুতা (কালো তাগা)-র আদলে শিশুর গলায় বা কবজিতে পরানো হয়। এটি শতভাগ হাইপোঅ্যালার্জেনিক ও বিপিএ-মুক্ত নরম মেডিকেল সিলিকন দিয়ে তৈরি, যার কোনো ধারালো কোণা নেই। এছাড়া এতে রয়েছে বিশেষ "ব্রেকঅ্যাওয়ে সেফটি ক্ল্যাপস", যা ১.৫ কেজির বেশি টানে নিজে থেকেই খুলে যায়—ফলে শিশুর গলায় ফাঁস লাগার কোনো ঝুঁকি থাকে না।',
    keyTakeawaysEn: [
      'Breakaway safety clasp pops open under tension (>1.5 kg force)',
      'Baby-safe, skin-friendly, non-toxic hypoallergenic silicone',
      'Embraces maternal cultural familiarity rather than feeling like a clinical tracking tag',
    ],
    keyTakeawaysBn: [
      'টান লাগলে স্বয়ংক্রিয়ভাবে খুলে যাওয়ার নিরাপদ লকিং সিস্টেম',
      'শিশুর সংবেদনশীল ত্বকের জন্য শতভাগ নিরাপদ ও নন-টক্সিক সিলিকন',
      'অপরিচিত কোনো মেডিকেল ট্যাগের মতো না হয়ে পারিবারিক কালা সুতার মতোই স্বাভাবিক',
    ],
  },
  {
    id: 'faq-pendant-2',
    category: 'pendant',
    categoryLabelEn: 'Pendant & Wearability',
    categoryLabelBn: 'লকেট ও পরিধান',
    questionEn: 'Is the pendant waterproof during baby baths, rain, and river flooding?',
    questionBn: 'গোসল, বৃষ্টি বা বন্যার পানিতে লকেটটি কি নষ্ট হয়ে যাবে?',
    answerEn:
      'The SmartGuard pendant is IP68 hermetically sealed and 100% waterproof. It can be immersed in water, washed with baby soap, soaked during daily baths, and withstand humid monsoon downpours or river crossings without damaging the internal antenna or microchip.',
    answerBn:
      'স্মার্টগার্ড লকেট শতভাগ আইপি৬৮ (IP68) ওয়াটারপ্রুফ ও সীলগালা করা। প্রতিদিনের গোসল, সাবান পানি, বর্ষার মুষলধারে বৃষ্টি কিংবা চরাঞ্চলের নদী পারাপারেও এর ভেতরের এনএফসি চিপ ও অ্যান্টেনার কোনো ক্ষতি হয় না।',
    keyTakeawaysEn: [
      'IP68 certified: completely dust-tight and submersible',
      'Withstands baby soaps, river water, and tropical monsoon moisture',
    ],
    keyTakeawaysBn: [
      'আইপি৬৮ সনদপ্রাপ্ত: সম্পূর্ণ ধুলো ও পানিনিরোধক',
      'শিশুর গোসলের সাবান ও বর্ষার পানিতেও স্থায়ী সুরক্ষা',
    ],
  },
  {
    id: 'faq-pendant-3',
    category: 'pendant',
    categoryLabelEn: 'Pendant & Wearability',
    categoryLabelBn: 'লকেট ও পরিধান',
    questionEn: 'What happens if the pendant is lost or physically damaged?',
    questionBn: 'লকেটটি হারিয়ে গেলে বা ক্ষতিগ্রস্ত হলে শিশুর আগের টিকার তথ্য কি মুছে যাবে?',
    answerEn:
      'No vaccination records are ever lost. The physical pendant only holds an encrypted pointer token and local backup hashes; the permanent, immutable master immunization history resides in the frontline health worker’s offline database and synchronizes with national VaxEPI/DHIS2. If lost, the mother simply provides the child’s Birth Registration Number (BRN) or phone number, and the health worker pairs a brand-new sub-$1 pendant in under 15 seconds.',
    answerBn:
      'না, শিশুর কোনো টিকার তথ্য কখনোই হারাবে না। লকেটে মূলত একটি এনক্রিপ্টেড টোকেন সংরক্ষিত থাকে; মূল টিকা ইতিহাস স্বাস্থ্যকর্মীর ডিজিটাল রেজিস্টার এবং কেন্দ্রীয় VaxEPI/DHIS2 সিস্টেমে সুরক্ষিত থাকে। লকেট হারিয়ে গেলে মা শুধু জন্ম নিবন্ধন নম্বর বা ফোন নম্বর জানালেই মাত্র ১৫ সেকেন্ডে নতুন একটি লকেট পুনরায় যুক্ত করে দেওয়া যায়।',
    keyTakeawaysEn: [
      'Records are permanently saved in DGHS-interoperable master storage',
      'Rapid 15-second re-pairing by health workers at any EPI clinic',
      'Affordable sub-$1 unit replacement cost',
    ],
    keyTakeawaysBn: [
      'সরকারি কেন্দ্রীয় ও অফলাইন ডেটাবেসে স্থায়ীভাবে তথ্য সংরক্ষিত',
      'যেকোনো টিকাদান কেন্দ্রে ১৫ সেকেন্ডে নতুন লকেট সংযোজন',
      'এক ডলারেরও কম খরচে নতুন লকেট প্রতিস্থাপনের সুবিধা',
    ],
  },
  {
    id: 'faq-pendant-4',
    category: 'pendant',
    categoryLabelEn: 'Pendant & Wearability',
    categoryLabelBn: 'লকেট ও পরিধান',
    questionEn: 'What if a health worker only has a smartphone without built-in NFC?',
    questionBn: 'স্বাস্থ্যকর্মীর স্মার্টফোনে যদি এনএফসি স্ক্যানার না থাকে তবে কীভাবে কাজ করবে?',
    answerEn:
      'Every SmartGuard pendant includes a high-contrast, laser-etched QR code on the back as a universal optical fallback. Any basic camera phone or tablet running the SmartGuard app can scan the encrypted QR code in under one second, ensuring zero children are turned away.',
    answerBn:
      'প্রতিটি লকেটের পেছনে একটি উচ্চ-রেজ্যুলেশনের লেজার-প্রিন্ট করা সুরক্ষিত কিউআর কোড রয়েছে। স্বাস্থ্যকর্মীর ফোনে এনএফসি না থাকলেও সাধারণ ক্যামেরার সাহায্যে মাত্র এক সেকেন্ডে কিউআর কোড স্ক্যান করে তথ্য দেখা ও হালনাগাদ করা যায়।',
  },

  // -------------------------------------------------------------
  // 3. DATA PRIVACY & INFORMATION SECURITY
  // -------------------------------------------------------------
  {
    id: 'faq-privacy-1',
    category: 'privacy',
    categoryLabelEn: 'Data Privacy & Security',
    categoryLabelBn: 'তথ্য সুরক্ষা ও গোপনীয়তা',
    questionEn: 'What personal information is stored on the physical pendant chip?',
    questionBn: 'লকেটের চিপের ভেতর শিশুর ব্যক্তিগত কী কী তথ্য সংরক্ষিত থাকে?',
    answerEn:
      'ZERO plain-text Personally Identifiable Information (PII) is stored on the chip. The child’s name, mother’s name, home address, and telephone number are NEVER written to the wearable. Instead, the chip contains only an encrypted Shared Health Record (SHR) pseudonymized token, a public hardware Tag ID (e.g., SG-NFC-0101), and a cryptographic digital signature of completed vaccine doses.',
    answerBn:
      'চিপের ভেতর শিশুর বা পরিবারের কোনো সরাসরি ব্যক্তিগত তথ্য (নাম, ঠিকানা বা ফোন নম্বর) থাকে না। এতে থাকে শুধুমাত্র একটি সুরক্ষিত ক্রিপ্টোগ্রাফিক টোকেন এবং সম্পন্ন হওয়া টিকার এনক্রিপ্ট করা কোড। ফলে অন্য কেউ স্ক্যান করলেও কোনো ব্যক্তিগত তথ্য দেখতে পাবে না।',
    keyTakeawaysEn: [
      'Zero plain-text PII on chip — impossible to skim names or phone numbers',
      'Pseudonymized SHA-256 cryptographic signatures',
      'Complies with national health data governance and WHO patient privacy standards',
    ],
    keyTakeawaysBn: [
      'চিপে কোনো নাম বা ফোন নম্বর নেই — স্কিম বা চুরির সুযোগ নেই',
      'এসএইচএ-২৫৬ ক্রিপ্টোগ্রাফিক সুরক্ষায় টোকেনাইজড',
      'জাতীয় ডিজিটাল স্বাস্থ্য নীতিমালা ও বিশ্ব স্বাস্থ্য সংস্থার গোপনীয়তা নীতিমালার সাথে সংগতিপূর্ণ',
    ],
  },
  {
    id: 'faq-privacy-2',
    category: 'privacy',
    categoryLabelEn: 'Data Privacy & Security',
    categoryLabelBn: 'তথ্য সুরক্ষা ও গোপনীয়তা',
    questionEn: 'Can an unauthorized stranger or commercial app read the child’s data with their phone?',
    questionBn: 'অপরিচিত কোনো ব্যক্তি বা বাণিজ্যিক অ্যাপ কি স্ক্যান করে শিশুর তথ্য দেখতে পারবে?',
    answerEn:
      'No. If an unauthorized smartphone scans the pendant using a standard NFC reader app, they will only see an incomprehensible encrypted binary string. Only the authenticated SmartGuard mobile app, possessing cryptographically verified health-worker credentials registered with the DGHS EPI network, has the decryption key to resolve the token against the official clinical registry.',
    answerBn:
      'একেবারেই না। সাধারণ কোনো ফোন দিয়ে স্ক্যান করলে শুধু অপাঠ্য এনক্রিপ্ট করা কোড দেখা যাবে। শুধুমাত্র সরকারি স্বাস্থ্য অধিদপ্তর অনুমোদিত স্বাস্থ্যকর্মীর স্মার্টগার্ড অ্যাপ ও ডিজিটাল চাবি থাকলেই কেবল আসল টিকার তথ্য পড়া ও হালনাগাদ করা সম্ভব।',
  },
  {
    id: 'faq-privacy-3',
    category: 'privacy',
    categoryLabelEn: 'Data Privacy & Security',
    categoryLabelBn: 'তথ্য সুরক্ষা ও গোপনীয়তা',
    questionEn: 'How does SmartGuard prevent data manipulation or fake vaccine records?',
    questionBn: 'কেউ কি ভুয়া টিকার তথ্য যোগ করতে বা রেকর্ড পরিবর্তন করতে পারবে?',
    answerEn:
      'Every dose administration logged by a frontline worker is digitally signed with the provider’s credential, timestamp, cold-box batch number, and GPS verification stamp. Any offline write back to the pendant updates an immutable cryptographic hash. If a tampered chip is scanned, the app flags a cryptographic mismatch instantly and alerts supervisory health managers.',
    answerBn:
      'প্রতিটি টিকার রেকর্ডে স্বাস্থ্যকর্মীর ডিজিটাল স্বাক্ষর, সময়, কোল্ড বক্সের ব্যাচ নম্বর এবং অবস্থান সংযুক্ত থাকে। লকেটে কোনো অসঙ্গত পরিবর্তন হলে অ্যাপ তা সঙ্গে সঙ্গে শনাক্ত করে সতর্কবার্তা জারি করে।',
  },

  // -------------------------------------------------------------
  // 4. FIELD OPERATIONS & CULTURAL TRUST
  // -------------------------------------------------------------
  {
    id: 'faq-offline-1',
    category: 'offline',
    categoryLabelEn: 'Field Operations & Trust',
    categoryLabelBn: 'মাঠপর্যায়ে ব্যবহার ও বিশ্বাসযোগ্যতা',
    questionEn: 'How does SmartGuard work in remote river chars and haors with zero internet?',
    questionBn: 'ইন্টারনেটবিহীন প্রত্যন্ত চরাঞ্চল বা হাওরে এটি কীভাবে কাজ করে?',
    answerEn:
      'SmartGuard BD is architected offline-first. Frontline health workers can register new infants, scan existing pendants, record administered doses, check due lists, and write updated vaccination statuses back to the pendant 100% offline. All transactions are queued locally in an encrypted SQLite database. When the worker returns to an area with mobile coverage (even low-bandwidth 2G), the app automatically executes deterministic conflict-free background sync.',
    answerBn:
      'স্মার্টগার্ড সম্পূর্ণ অফলাইন-ফার্স্ট প্রযুক্তিতে নির্মিত। দুর্গম চরাঞ্চলে ইন্টারনেট না থাকলেও স্বাস্থ্যকর্মী সম্পূর্ণ অফলাইনে শিশুর লকেট স্ক্যান করতে, নতুন টিকা এন্ট্রি দিতে এবং তথ্য লকেটে লিখে দিতে পারেন। পরবর্তীতে নেটওয়ার্ক পেলে অ্যাপ নিজে থেকেই স্বয়ংক্রিয়ভাবে কেন্দ্রীয় সিস্টেমে সব তথ্য সিঙ্ক করে নেয়।',
    keyTakeawaysEn: [
      '100% functional without cellular signal or internet',
      'Deterministic sync rule: Most recent authenticated timestamp wins',
      'Encrypted local SQLite vault on frontline mobile devices',
    ],
    keyTakeawaysBn: [
      'ইন্টারনেট বা মোবাইল নেটওয়ার্ক ছাড়াই শতভাগ কার্যকর',
      'সর্বাধুনিক যাচাইকৃত টাইমস্ট্যাম্প অনুযায়ী স্বয়ংক্রিয় সিঙ্ক',
      'ফোনের ভেতর সংরক্ষিত এনক্রিপ্ট করা অফলাইন ডেটাবেস',
    ],
  },
  {
    id: 'faq-offline-2',
    category: 'offline',
    categoryLabelEn: 'Field Operations & Trust',
    categoryLabelBn: 'মাঠপর্যায়ে ব্যবহার ও বিশ্বাসযোগ্যতা',
    questionEn: 'Why do rural mothers and communities trust and adopt the pendant so readily?',
    questionBn: 'গ্রামীণ মা ও অভিভাবকরা কেন এই লকেটটি সহজে গ্রহণ ও বিশ্বাস করবেন?',
    answerEn:
      'In Bangladesh, over 90% of newborns already wear a traditional black thread ("Kala Dhaga" / কালো সুতা) tied by mothers or grandmothers as cultural protection against the "evil eye" (নজর দোষ). Rather than imposing an alien plastic hospital tag that families discard, SmartGuard embeds micro-technology within this beloved maternal practice. Mothers proudly keep it on their babies, transforming an ancient symbol of care into a digital shield for child survival.',
    answerBn:
      'বাংলাদেশে ৯০ শতাংশেরও বেশি নবজাতকের শরীরে নজর দোষ থেকে বাঁচাতে মায়েরা পরম স্নেহে কালো সুতা বা তাগা পরিয়ে দেন। কোনো অপরিচিত প্লাস্টিক ট্যাগ না দিয়ে আমাদের লকেটটি সেই ঐতিহ্যবাহী কালা সুতার রূপ ধারণ করেছে। মায়েরা এটিকে আপন মনে গ্রহণ করেন এবং শিশু বড় হওয়া পর্যন্ত পরম যত্নে পরিয়ে রাখেন।',
    keyTakeawaysEn: [
      'Builds on 90%+ existing maternal cultural adoption',
      'Eliminates social stigma or fear of clinical tracking devices',
      'Supported by local dialect IVR voice reminders in Sylheti, Chittagonian, and coastal tones',
    ],
    keyTakeawaysBn: [
      'শত বছরের মাতৃকালীন ঐতিহ্যের প্রতি সম্মান প্রদর্শন',
      'হাসপাতালের শীতল ট্যাগের বদলে মমতাময়ী অনুভূতির ছোঁয়া',
      'সিলেটি ও চাটগাঁইয়া আঞ্চলিক ভাষায় অভিভাবকদের সাথে শ্রদ্ধাপূর্ণ যোগাযোগ',
    ],
  },
];
