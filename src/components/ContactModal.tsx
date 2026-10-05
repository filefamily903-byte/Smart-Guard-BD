import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { X, Send, CheckCircle2, Shield, Loader2, Mail, ExternalLink } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const TARGET_EMAIL = 'fk361542@gmail.com';

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, lang }) => {
  const t = translations[lang].team;
  const isBn = lang === 'bn';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; email: string; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    const payload = { name, email, message };

    try {
      // 1. Try sending via FormSubmit endpoint to fk361542@gmail.com
      const res = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          message: payload.message,
          _subject: `SmartGuard BD Inquiry: ${payload.name}`,
          _template: 'table',
        }),
      });

      if (!res.ok) {
        // If external gateway rate-limits or blocks, trigger fallback mailto
        triggerMailto(payload.name, payload.email, payload.message);
      }
    } catch {
      // If network or adblocker interrupts fetch, trigger mailto directly
      triggerMailto(payload.name, payload.email, payload.message);
    } finally {
      setIsSubmitting(false);
      setSubmittedData(payload);
      setIsSubmitted(true);
    }
  };

  const triggerMailto = (senderName: string, senderEmail: string, msg: string) => {
    const subject = encodeURIComponent(`SmartGuard BD Inquiry from ${senderName}`);
    const body = encodeURIComponent(
      `Sender Name: ${senderName}\nSender Email: ${senderEmail}\n\nMessage:\n${msg}\n\n---\nSent via SmartGuard BD Portal`
    );
    window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2530]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-[520px] w-full p-6 md:p-8 shadow-2xl relative border border-[#E2E8F0]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#64748B] hover:text-[#0B2530] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-4 ring-8 ring-[#F0FDF4]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-bold text-[22px] text-[#0B2530] mb-2">
              {isBn ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Dispatched!'}
            </h3>
            <p className="text-[14.5px] text-[#64748B] max-w-[420px] mb-4">
              {t.modalSuccess}
            </p>

            <div className="w-full p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-[13px] text-[#475569] mb-5 space-y-1">
              <div className="flex items-center justify-between text-[#0F766E] font-semibold">
                <span>{isBn ? 'প্রেরিত ঠিকানা:' : 'Delivered to:'}</span>
                <span className="font-mono">{TARGET_EMAIL}</span>
              </div>
              <div className="truncate text-[#64748B]">
                <span className="font-medium">{isBn ? 'প্রেরক:' : 'From:'}</span> {submittedData?.name} ({submittedData?.email})
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              {submittedData && (
                <button
                  type="button"
                  onClick={() => triggerMailto(submittedData.name, submittedData.email, submittedData.message)}
                  className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isBn ? 'মেইল অ্যাপে ব্যাকআপ খুলুন' : 'Open in Mail App'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-[13px] font-bold flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              >
                {isBn ? 'বন্ধ করুন' : 'Done / Close'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-3 text-[12px] text-[#64748B] hover:text-[#0B2530] underline cursor-pointer"
            >
              {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send another message'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-[20px] text-[#0B2530]">
                {t.modalTitle}
              </h3>
            </div>
            <p className="text-[13.5px] text-[#64748B] mb-5">
              {isBn
                ? 'সরাসরি আমাদের উদ্ভাবক ও গবেষক দলের ইনবক্সে বার্তা পাঠান (' + TARGET_EMAIL + ')'
                : 'Directly reaches our development team inbox at ' + TARGET_EMAIL}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#334155] block mb-1">
                  {t.modalName}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBn ? 'আপনার নাম ও পদবী' : 'e.g. Dr. M. Rahman / Health Officer'}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0B2530] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#334155] block mb-1">
                  {t.modalEmail}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0B2530] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#334155] block mb-1">
                  {t.modalMsg}
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isBn
                      ? 'পাইলট কর্মসূচি, প্রযুক্তিগত তথ্য বা সহযোগিতার বিষয়ে আপনার মতামত...'
                      : 'Inquiry regarding pilot feasibility, technical whitepaper, or collaboration...'
                  }
                  className="w-full p-3 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0B2530] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent resize-none bg-white"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isBn ? 'বার্তা পাঠানো হচ্ছে...' : 'Sending to ' + TARGET_EMAIL + '...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.modalSend}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11.5px] text-[#94A3B8]">
                {isBn
                  ? 'বার্তাটি সরাসরি ' + TARGET_EMAIL + ' এ পৌঁছে যাবে।'
                  : 'Delivered directly to ' + TARGET_EMAIL}
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
