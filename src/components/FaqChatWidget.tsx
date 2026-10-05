import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { FAQ_DATA, FAQItem } from '../data/faqData';
import { Avatar3D } from './Avatar3D';
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Mail,
  Loader2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Bot,
} from 'lucide-react';

interface FaqChatWidgetProps {
  lang: Language;
  onOpenContactModal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  category?: string;
  bullets?: string[];
  actionPrompt?: 'contact' | 'none';
}

const TARGET_EMAIL = 'fk361542@gmail.com';

export const FaqChatWidget: React.FC<FaqChatWidgetProps> = ({ lang, onOpenContactModal }) => {
  const isBn = lang === 'bn';
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'contact'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Contact tab state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const aiNameBn = 'সুরক্ষা এআই';
  const aiNameEn = 'Shurakkha AI';
  const aiName = isBn ? aiNameBn : aiNameEn;

  // Default welcome message introducing Shurakkha AI
  const initialMessages: ChatMessage[] = [
    {
      id: 'welcome-1',
      sender: 'bot',
      text: isBn
        ? `আসসালামু আলাইকুম! 👋 আমি সুরক্ষা এআই (${aiNameEn}) — স্মার্টগার্ড বিডি-এর সার্বক্ষণিক স্বাস্থ্য ও টিকাদান সহকারী। স্মার্ট লকেটের ব্যাটারি, এনএফসি প্রযুক্তি, শিশুর স্বাস্থ্যতথ্য সুরক্ষা বা চরাঞ্চলের অফলাইন কার্যক্রম সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।`
        : `Hello! 👋 I am ${aiNameEn}, your SmartGuard 24/7 digital health assistant. Ask me anything about our 100% battery-free NFC pendant, zero-PII data privacy, infant safety, or offline char operations.`,
      timestamp: 'Just now',
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Suggested questions for quick clicks
  const quickQuestions = [
    {
      id: 'q-battery',
      labelEn: '🔋 Does it have a battery?',
      labelBn: '🔋 লকেটে কি ব্যাটারি আছে?',
      faqId: 'faq-battery-1',
    },
    {
      id: 'q-privacy',
      labelEn: '🔒 What data is stored on chip?',
      labelBn: '🔒 চিপে কী কী তথ্য থাকে?',
      faqId: 'faq-privacy-1',
    },
    {
      id: 'q-safety',
      labelEn: '👶 Is it safe for newborns?',
      labelBn: '👶 নবজাতকের জন্য কতটা নিরাপদ?',
      faqId: 'faq-pendant-1',
    },
    {
      id: 'q-water',
      labelEn: '🌊 Is it waterproof during baths?',
      labelBn: '🌊 গোসলের সময় নষ্ট হবে কি?',
      faqId: 'faq-pendant-2',
    },
    {
      id: 'q-offline',
      labelEn: '📶 Does it work without internet?',
      labelBn: '📶 ইন্টারনেট ছাড়া চরে কীভাবে চলবে?',
      faqId: 'faq-offline-1',
    },
    {
      id: 'q-contact',
      labelEn: '✉️ Contact team directly',
      labelBn: '✉️ সরাসরি টিমের সাথে যোগাযোগ',
      action: 'switch-contact',
    },
  ];

  const handleSelectQuickQuestion = (item: (typeof quickQuestions)[0]) => {
    if (item.action === 'switch-contact') {
      setActiveTab('contact');
      return;
    }

    const matchedFaq = FAQ_DATA.find((f) => f.id === item.faqId);
    if (!matchedFaq) return;

    const userText = isBn ? item.labelBn : item.labelEn;
    triggerBotAnswer(userText, matchedFaq);
  };

  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const query = inputQuery.trim();
    setInputQuery('');

    const userMsgId = 'u-' + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      // Call server-side Gemini endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          lang: isBn ? 'bn' : 'en',
          history: messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actionPrompt: 'none',
            },
          ]);
          return;
        }
      }
      throw new Error('Fallback to local database');
    } catch {
      // Graceful fallback to local FAQ matching
      const lower = query.toLowerCase();
      const match = FAQ_DATA.find((item) => {
        const qEn = item.questionEn.toLowerCase();
        const aEn = item.answerEn.toLowerCase();
        const qBn = item.questionBn.toLowerCase();
        const aBn = item.answerBn.toLowerCase();
        const cat = item.category.toLowerCase();

        return (
          qEn.includes(lower) ||
          aEn.includes(lower) ||
          qBn.includes(lower) ||
          aBn.includes(lower) ||
          cat.includes(lower)
        );
      });

      setIsTyping(false);
      if (match) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: isBn ? match.answerBn : match.answerEn,
            bullets: isBn ? match.keyTakeawaysBn : match.keyTakeawaysEn,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionPrompt: 'none',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: isBn
              ? `আপনার প্রশ্নের সরাসরি উত্তরটি আমাদের অফলাইন ডাটাবেজে পাওয়া যায়নি। আমাদের দল (${TARGET_EMAIL}) এ যোগাযোগ করলে বিস্তারিত তথ্য জানিয়ে দেওয়া হবে। আপনি নিচের ফর্ম দিয়ে সরাসরি বার্তা পাঠাতে পারেন।`
              : `I don't have an exact match for "${query}" right now, but our engineering team can help! You can send an inquiry directly to ${TARGET_EMAIL} using the Contact Team tab.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionPrompt: 'contact',
          },
        ]);
      }
    }
  };

  const triggerBotAnswer = (userQueryText: string, faq: FAQItem) => {
    const userMsgId = 'u-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: userQueryText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: isBn ? faq.answerBn : faq.answerEn,
          bullets: isBn ? faq.keyTakeawaysBn : faq.keyTakeawaysEn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionPrompt: 'none',
        },
      ]);
    }, 500);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;

    setContactSending(true);

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMsg,
          _subject: `SmartGuard BD FAQ Chat Inquiry: ${contactName}`,
          _template: 'table',
        }),
      });

      if (!res.ok) {
        triggerMailto(contactName, contactEmail, contactMsg);
      }
    } catch {
      triggerMailto(contactName, contactEmail, contactMsg);
    } finally {
      setContactSending(false);
      setContactSuccess(true);
    }
  };

  const triggerMailto = (senderName: string, senderEmail: string, msg: string) => {
    const subject = encodeURIComponent(`SmartGuard BD Inquiry from ${senderName}`);
    const body = encodeURIComponent(
      `Sender Name: ${senderName}\nSender Email: ${senderEmail}\n\nMessage:\n${msg}\n\n---\nSent via SmartGuard Shurakkha AI Chatbox`
    );
    window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
  };

  const resetContactForm = () => {
    setContactSuccess(false);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
  };

  return (
    <>
      {/* Sleek Compact Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center animate-in fade-in slide-in-from-bottom-2 duration-250">
          <button
            id="shurakkha-ai-launcher-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative h-11 px-3 sm:px-3.5 rounded-full bg-gradient-to-r from-[#0B2530] via-[#0F394B] to-[#0F766E] hover:from-[#0F394B] hover:to-[#115E59] text-white shadow-[0_6px_20px_rgba(15,118,110,0.38)] hover:shadow-[0_8px_25px_rgba(15,118,110,0.5)] border border-[#2DD4BF]/40 flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Open Shurakkha AI Chat"
            title={`${aiName} - SmartGuard Assistant`}
          >
            {/* 3D Avatar in launcher */}
            <div className="relative -ml-0.5 shrink-0">
              <Avatar3D size="xs" showOnlineStatus />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-[13px] tracking-wide text-white whitespace-nowrap">
                {aiName}
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#2DD4BF]/20 text-[#5EEAD4] border border-[#2DD4BF]/30">
                AI
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chatbox Window */}
      {isOpen && (
        <div
          id="shurakkha-ai-window"
          className="fixed bottom-3 sm:bottom-5 right-3 sm:right-5 w-[calc(100vw-24px)] sm:w-[400px] max-h-[620px] h-[84vh] bg-white rounded-2xl shadow-[0_20px_50px_rgba(11,37,48,0.38)] border border-[#CBD5E1] flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-3 duration-200"
        >
          {/* Top Header with 3D Avatar */}
          <div className="bg-gradient-to-r from-[#0B2530] via-[#0F394B] to-[#0F766E] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-white/10 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              {/* 3D Avatar in header */}
              <div className="relative shrink-0">
                <Avatar3D size="md" showOnlineStatus isAnimated />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-bold text-[15px] leading-tight text-white">
                    {aiName}
                  </h3>
                  <span className="text-[10px] font-mono bg-[#2DD4BF]/25 text-[#5EEAD4] px-1.5 py-0.2 rounded border border-[#2DD4BF]/30">
                    ⚡ Gemini AI
                  </span>
                </div>
                <p className="text-[11.5px] text-[#CBD5E1] leading-tight mt-0.5">
                  {isBn
                    ? 'স্মার্টগার্ড স্বাস্থ্য ও টিকাদান সহকারী'
                    : 'SmartGuard Digital Health Companion'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Close chat"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs (Chat vs Contact) */}
          <div className="flex items-center bg-[#F1F5F9] border-b border-[#E2E8F0] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-[#0F766E] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B2530]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রশ্নোত্তর (FAQ)' : 'FAQ Assistant'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-white text-[#0F766E] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B2530]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isBn ? 'সরাসরি ইমেইল' : 'Contact Team'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
            </button>
          </div>

          {/* Tab 1: Interactive FAQ Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
                {messages.map((msg) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                    >
                      {/* Sender label for bot */}
                      {isBot && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <Avatar3D size="xs" />
                          <span className="text-[11px] font-bold text-[#0F766E]">
                            {aiName}
                          </span>
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] rounded-2xl p-3 text-[13px] leading-relaxed shadow-xs ${
                          isBot
                            ? 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-tl-xs'
                            : 'bg-[#0F766E] text-white rounded-tr-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {/* Bullet takeaways */}
                        {msg.bullets && msg.bullets.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/70 space-y-1">
                            <span className="text-[10.5px] font-bold text-[#0F766E] uppercase tracking-wider block">
                              {isBn ? 'মূল বিষয়সমূহ:' : 'Key Highlights:'}
                            </span>
                            {msg.bullets.map((b, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[11.5px] text-[#475569]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action prompt */}
                        {msg.actionPrompt === 'contact' && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('contact')}
                            className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                          >
                            <span>{isBn ? 'টিমকে ইমেইল পাঠান' : 'Dispatch direct email'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span className="text-[9.5px] text-[#94A3B8] px-1 mt-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Typing animation indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] w-fit shadow-xs">
                    <Avatar3D size="xs" />
                    <span className="text-[11px] text-[#64748B] font-medium">{aiName} চিন্তা করছে...</span>
                    <span className="flex gap-1 items-center ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Horizontal Carousel */}
              <div className="p-2.5 bg-white border-t border-[#E2E8F0] shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5 px-1">
                  {isBn ? 'সচরাচর জিজ্ঞাসিত প্রশ্ন (ক্লিক করুন):' : 'Suggested Questions:'}
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSelectQuickQuestion(q)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-[11.5px] font-medium whitespace-nowrap transition-colors border border-[#CBD5E1]/60 cursor-pointer shrink-0"
                    >
                      {isBn ? q.labelBn : q.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={handleSendText}
                className="p-2.5 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    isBn
                      ? 'টিকা, পার্শ্বপ্রতিক্রিয়া বা প্রযুক্তি নিয়ে এআই-কে জিজ্ঞাসা করুন...'
                      : 'Ask AI anything on vaccines, fever, or NFC tech...'
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[12.5px] text-[#0B2530] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="w-9 h-9 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
                  aria-label="Send query"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Direct Contact Form (Directly to fk361542@gmail.com) */}
          {activeTab === 'contact' && (
            <div className="flex-1 flex flex-col min-h-0 bg-white p-4 overflow-y-auto">
              {contactSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-5">
                  <div className="w-13 h-13 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3 ring-8 ring-[#F0FDF4]">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h4 className="font-heading font-bold text-[17px] text-[#0B2530] mb-1">
                    {isBn ? 'বার্তা সরাসরি পাঠানো হয়েছে!' : 'Inquiry Dispatched Directly!'}
                  </h4>
                  <p className="text-[12.5px] text-[#64748B] mb-3.5 max-w-[290px]">
                    {isBn
                      ? `আপনার বার্তাটি সরাসরি ${TARGET_EMAIL} ঠিকানায় পৌঁছেছে। আমাদের দল দ্রুত সাড়া দেবে।`
                      : `Your message reached ${TARGET_EMAIL}. Our research and engineering team will reply shortly.`}
                  </p>

                  <div className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-[11.5px] text-[#475569] mb-3.5">
                    <span className="font-semibold text-[#0F766E] block">
                      {isBn ? 'প্রেরিত ঠিকানা:' : 'Delivered to:'}
                    </span>
                    <span className="font-mono">{TARGET_EMAIL}</span>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => triggerMailto(contactName, contactEmail, contactMsg)}
                      className="w-full py-2 px-3 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isBn ? 'মেইল অ্যাপে ব্যাকআপ কপি খুলুন' : 'Open in Mail App'}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>

                    <button
                      type="button"
                      onClick={resetContactForm}
                      className="w-full py-2 px-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Inquiry'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar3D size="sm" />
                    <div>
                      <h4 className="font-heading font-bold text-[15px] text-[#0B2530]">
                        {isBn ? 'টিমকে সরাসরি ইমেইল' : 'Direct Team Inquiry'}
                      </h4>
                      <span className="text-[11px] text-[#0F766E] font-medium font-mono">
                        {TARGET_EMAIL}
                      </span>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#64748B] mb-3 leading-relaxed">
                    {isBn
                      ? 'লকেট পাইলট, কারিগরি ডাটাশিট বা অংশীদারিত্বের জন্য লিখুন। এটি সরাসরি আমাদের ইনবক্সে পৌঁছাবে।'
                      : 'Inquire about hardware specs, field pilots, or collaboration. Direct to team inbox.'}
                  </p>

                  <form onSubmit={handleContactSubmit} className="space-y-2.5">
                    <div>
                      <label className="text-[11.5px] font-semibold text-[#334155] block mb-0.5">
                        {isBn ? 'আপনার নাম' : 'Your Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder={isBn ? 'উদাঃ ডা. এম. রহমান' : 'e.g. Dr. M. Rahman'}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-[12.5px] text-[#0B2530] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold text-[#334155] block mb-0.5">
                        {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="name@organization.org"
                        className="w-full px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-[12.5px] text-[#0B2530] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold text-[#334155] block mb-0.5">
                        {isBn ? 'আপনার বার্তা বা জিজ্ঞাসা' : 'Your Inquiry'}
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder={
                          isBn
                            ? 'প্রকল্প বা লকেট সম্পর্কিত আপনার প্রশ্ন...'
                            : 'Inquiry regarding pilot feasibility, technical paper...'
                        }
                        className="w-full p-2.5 rounded-xl border border-[#CBD5E1] text-[12.5px] text-[#0B2530] focus:outline-none focus:ring-1 focus:ring-[#0F766E] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactSending}
                      className="w-full py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {contactSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending to ' + TARGET_EMAIL + '...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সরাসরি পাঠান' : 'Send Directly'}</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10.5px] text-[#94A3B8]">
                      {isBn
                        ? 'বার্তাটি সরাসরি ' + TARGET_EMAIL + ' এ চলে যাবে।'
                        : 'Routes directly to ' + TARGET_EMAIL}
                    </p>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
