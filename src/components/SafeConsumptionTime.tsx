import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DailyMenuData } from '../types';

interface SafeConsumptionTimeProps {
  data: DailyMenuData;
}

export const SafeConsumptionTime: React.FC<SafeConsumptionTimeProps> = ({ data }) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/90 dark:border-rose-900/60 p-4 md:p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs shrink-0">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
              BATAS AMAN WAKTU KONSUMSI MAKANAN
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Wajib dikonsumsi sebelum batas jam sesuai jenjang sasaran
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-[11px] font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Kualitas Terjamin</span>
          <span className="sm:hidden">Higienis</span>
        </div>
      </div>

      {/* Red Highlight Callout Bar */}
      <div className="bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 rounded-lg py-1.5 px-3 text-center mb-3">
        <span className="text-[11px] sm:text-xs font-black tracking-wider text-rose-700 dark:text-rose-300 uppercase">
          WAJIB DIKONSUMSI SEBELUM
        </span>
      </div>

      {/* 3 Deadline Cards Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3.5">
        {data.safeTimes.map((rule, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/30 p-2.5 sm:p-3 text-center flex flex-col items-center justify-center hover:bg-rose-50/40 dark:hover:bg-rose-950/50 transition-colors"
          >
            <div className="flex items-baseline justify-center gap-1 mb-1.5">
              <span className="text-lg sm:text-2xl md:text-3xl font-black text-[#D90429] dark:text-rose-400 tracking-tight">
                {rule.deadlineTime}
              </span>
              <span className="text-[9px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-300">
                {rule.unit}
              </span>
            </div>

            <div className="w-full">
              <span className="inline-block w-full py-1 px-1 text-[9px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-rose-100/60 dark:bg-rose-900/40 rounded-md border border-rose-200/60 dark:border-rose-800/50 truncate">
                {rule.targetGroup}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Notice Bar */}
      <div className="flex items-start gap-2 pt-1 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/60">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Makanan wajib dikonsumsi langsung</strong> sebelum batas waktu demi menjaga mutu, gizi, dan higienitas.
        </p>
      </div>

      {/* Real-time Clock subline */}
      <div className="mt-2 text-right text-[10px] text-slate-400 dark:text-slate-500">
        Waktu lokal SPPG: <span className="font-semibold text-slate-600 dark:text-slate-300">{currentTimeStr || '08:30:00 WITA'}</span>
      </div>
    </section>
  );
};
