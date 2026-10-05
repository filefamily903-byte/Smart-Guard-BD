import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Menu, X, Globe, Shield, ArrowRight } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, onToggleLang, onOpenContact }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['hero', 'problem', 'solution', 'how-it-works', 'pendant', 'demo', 'impact', 'business', 'team'];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#hero', id: 'hero', label: t.about },
    { href: '#problem', id: 'problem', label: t.problem },
    { href: '#solution', id: 'solution', label: t.solution },
    { href: '#how-it-works', id: 'how-it-works', label: t.howItWorks },
    { href: '#pendant', id: 'pendant', label: t.pendant },
    { href: '#demo', id: 'demo', label: lang === 'bn' ? 'লাইভ প্রোটোটাইপ' : 'Live Prototype' },
    { href: '#impact', id: 'impact', label: t.impact },
    { href: '#business', id: 'business', label: t.business },
    { href: '#team', id: 'team', label: t.team },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-b border-[#E2E8F0]'
          : 'bg-white/90 backdrop-blur-sm border-b border-[#E2E8F0]'
      }`}
      style={{ height: '72px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] rounded-lg p-1">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0F766E] text-white shadow-sm overflow-hidden">
            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Shield Shape */}
              <path d="M16 3L6 7v8c0 7.5 4.3 12 10 14 5.7-2 10-6.5 10-14V7L16 3z" fill="#0F766E" stroke="#FFFFFF" />
              {/* Kala Dhaga black thread curve with red knot */}
              <path d="M10 13c2.5 3.5 9.5 3.5 12 0" stroke="#0B2530" strokeWidth="2.5" />
              <circle cx="16" cy="15.5" r="2" fill="#B91C1C" />
              {/* Center Lock / Keyhole */}
              <path d="M16 19v3" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-[19px] tracking-tight text-[#0B2530] whitespace-nowrap">
                SmartGuard<span className="text-[#0F766E] ml-0.5">BD</span>
              </span>
            </div>
            <span className="text-[11px] text-[#64748B] tracking-wide -mt-0.5 whitespace-nowrap">
              Child Immunization & IoT
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-[13px] xl:text-[14px] font-medium transition-colors whitespace-nowrap ${
                activeSection === link.id
                  ? 'text-[#0F766E] bg-[#F0FDFA] font-semibold'
                  : 'text-[#334155] hover:text-[#0F766E] hover:bg-[#F8FAFC]'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions (PWA Install + Language Toggle + Demo Button) */}
        <div className="hidden md:flex items-center gap-2.5 xl:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton lang={lang} variant="nav" />

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#0B2530] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] whitespace-nowrap cursor-pointer"
            aria-label={`Switch language. Current: ${lang === 'en' ? 'English' : 'Bangla'}`}
          >
            <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
            <span className={lang === 'en' ? 'font-bold text-[#0F766E]' : 'text-[#64748B]'}>EN</span>
            <span className="text-[#CBD5E1]">|</span>
            <span className={lang === 'bn' ? 'font-bold text-[#0F766E]' : 'text-[#64748B]'}>বাং</span>
          </button>

          {/* View Demo Button */}
          <a
            href="#demo"
            className="h-[42px] xl:h-[44px] px-4 xl:px-5 rounded-[12px] text-[13.5px] xl:text-[14px] font-semibold bg-[#0F766E] text-white hover:bg-[#115E59] flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E] whitespace-nowrap"
          >
            <span className="whitespace-nowrap">{t.viewDemo}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onToggleLang}
            type="button"
            className="px-2.5 py-1.5 text-[12px] font-bold text-[#0B2530] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
            aria-label="Toggle language"
          >
            {lang === 'en' ? 'বাং' : 'EN'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="p-2 rounded-lg text-[#334155] hover:bg-[#F8FAFC] border border-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  activeSection === link.id
                    ? 'text-[#0F766E] bg-[#F0FDFA] font-semibold'
                    : 'text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-[#E2E8F0] flex flex-col gap-2">
              <PWAInstallButton lang={lang} variant="hero" />
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] text-white font-semibold text-[15px] shadow-sm"
              >
                <span>{t.viewDemo}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
