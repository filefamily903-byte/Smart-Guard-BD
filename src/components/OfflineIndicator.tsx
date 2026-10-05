import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface OfflineIndicatorProps {
  lang?: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang = 'en' }) => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const isBn = lang === 'bn';

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-[#0B2530] text-white px-3.5 py-2.5 shadow-xl border border-[#E11D48]/40 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300 max-w-sm"
      >
        <div className="w-8 h-8 rounded-lg bg-[#E11D48]/20 flex items-center justify-center shrink-0 text-[#FB7185]">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white flex items-center gap-1.5 leading-tight">
            <span>{isBn ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active'}</span>
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping" />
          </p>
          <p className="text-[11px] text-[#CBD5E1] truncate">
            {isBn ? 'ক্যাশ করা ডাটা ও এনএফসি স্ক্যানার প্রস্তুত' : 'Cached records & NFC ready for field use'}
          </p>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-[#0F766E] text-white px-3.5 py-2.5 shadow-xl border border-[#2DD4BF]/40 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300 max-w-sm"
      >
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white">
          <Wifi className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white flex items-center gap-1.5 leading-tight">
            <span>{isBn ? 'ইন্টারনেট পুনঃসংযুক্ত' : 'Back Online'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5EEAD4]" />
          </p>
          <p className="text-[11px] text-[#E0F2FE] truncate">
            {isBn ? 'সকল অফলাইন ডাটা স্বয়ংক্রিয়ভাবে সিঙ্ক হচ্ছে' : 'Field records automatically synced to cloud'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
