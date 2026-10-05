import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { HowItWorks } from './components/HowItWorks';
import { PendantDemo } from './components/PendantDemo';
import { LivePrototype } from './components/LivePrototype';
import { Architecture } from './components/Architecture';
import { ColdChain } from './components/ColdChain';
import { Impact } from './components/Impact';
import { BusinessModel } from './components/BusinessModel';
import { Adoption } from './components/Adoption';
import { Team } from './components/Team';
import { FaqChatWidget } from './components/FaqChatWidget';
import { CtaFooter } from './components/CtaFooter';
import { ContactModal } from './components/ContactModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ArrowUp } from 'lucide-react';

export default function App() {
  // In-memory language toggle (default: 'en')
  const [lang, setLang] = useState<Language>('en');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll for Back-to-Top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 380);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-white text-[#334155] ${
        lang === 'bn' ? 'font-bangla' : 'font-body'
      }`}
    >
      {/* 1. Header & Sticky Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Semantic Main Content Container with 12 Sections */}
      <main className="flex-1 w-full flex flex-col">
        {/* 1. HERO SECTION */}
        <Hero lang={lang} />

        {/* 2. THE PROBLEM */}
        <Problem lang={lang} />

        {/* 3. OUR SOLUTION */}
        <Solution lang={lang} />

        {/* 4. HOW IT WORKS */}
        <HowItWorks lang={lang} />

        {/* 5. THE NFC PENDANT (Kala Dhaga) + ANATOMY */}
        <PendantDemo lang={lang} />

        {/* 6. LIVE PROTOTYPE: WORKING MULTI-MODULE SIMULATION */}
        <LivePrototype lang={lang} />

        {/* 7. TECHNOLOGY ARCHITECTURE */}
        <Architecture lang={lang} />

        {/* 7. COLD CHAIN MONITORING */}
        <ColdChain lang={lang} />

        {/* 8. IMPACT AND KPIS */}
        <Impact lang={lang} />

        {/* 9. BUSINESS MODEL */}
        <BusinessModel lang={lang} />

        {/* 10. ADOPTION STRATEGY */}
        <Adoption lang={lang} />

        {/* 11. TEAM */}
        <Team lang={lang} onOpenContact={() => setIsContactOpen(true)} />
      </main>

      {/* 12. CTA BANNER + DARK NAVY FOOTER */}
      <CtaFooter lang={lang} onOpenContact={() => setIsContactOpen(true)} />

      {/* Contact Form Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        lang={lang}
      />

      {/* Floating FAQ & Help Chatbox on the Right Side */}
      <FaqChatWidget lang={lang} onOpenContactModal={() => setIsContactOpen(true)} />

      {/* Non-intrusive Offline / Online Status Indicator */}
      <OfflineIndicator lang={lang} />

      {/* Floating PWA Install button for mobile devices */}
      <PWAInstallButton lang={lang} variant="floating" />

      {/* Back to Top Floating Button (positioned comfortably above FAQ launcher) */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-30 w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-[#0B2530] border border-[#CBD5E1] shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}
