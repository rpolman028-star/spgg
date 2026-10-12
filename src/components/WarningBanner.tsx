import React from 'react';
import { AlertOctagon } from 'lucide-react';

export const WarningBanner: React.FC = () => {
  return (
    <div className="bg-[#D90429] dark:bg-red-950/90 dark:border dark:border-red-800/80 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 transition-colors duration-200">
      <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
        <AlertOctagon className="w-6 h-6 text-white stroke-[2.4]" />
      </div>

      <div className="max-w-md">
        <h4 className="text-xs sm:text-sm font-black tracking-wide uppercase text-white leading-tight">
          DILARANG MEMBAWA PULANG MAKANAN MBG
        </h4>
        <p className="text-[11px] sm:text-xs text-red-100 mt-1 leading-snug">
          Makanan program Makan Bergizi Gratis wajib dikonsumsi langsung di tempat demi menjaga kualitas dan keamanan pangan.
        </p>
      </div>
    </div>
  );
};
