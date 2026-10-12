import React, { useState } from 'react';
import { Package, ShieldCheck, ChevronRight, School, Users, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { DailyMenuData } from '../types';
import { TARGET_SCHOOLS } from '../data/menuData';

interface DistributionPortionsProps {
  data: DailyMenuData;
  isAdmin?: boolean;
  onOpenEditSchools?: () => void;
}

export const DistributionPortions: React.FC<DistributionPortionsProps> = ({
  data,
  isAdmin = false,
  onOpenEditSchools,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const schools = data.targetSchools && data.targetSchools.length > 0 ? data.targetSchools : TARGET_SCHOOLS;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 md:p-5 shadow-xs transition-colors duration-200">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs shrink-0">
            <Package className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
              JUMLAH DISTRIBUSI PORSI HARIAN
            </h3>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Alokasi porsi makanan bergizi gratis yang disalurkan hari ini
            </p>
          </div>
        </div>

        {/* Validation Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">{data.distribution.validationStatus}</span>
          <span className="sm:hidden">Tervalidasi</span>
        </div>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-3.5">
        {/* TOTAL PORSI */}
        <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/40 p-2.5 sm:p-3 text-center flex flex-col justify-center transition-all hover:bg-blue-50/60 dark:hover:bg-blue-950/60">
          <span className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-0.5">
            TOTAL PORSI
          </span>
          <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#0047AB] dark:text-sky-300 tracking-tight">
            {formatNumber(data.distribution.total)}
          </span>
        </div>

        {/* PORSI KECIL */}
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/40 p-2.5 sm:p-3 text-center flex flex-col justify-center transition-all hover:bg-amber-50/60 dark:hover:bg-amber-950/60">
          <span className="text-[10px] sm:text-xs font-bold text-[#b45309] dark:text-amber-400 uppercase tracking-wider mb-0.5">
            PORSI KECIL
          </span>
          <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#78350F] dark:text-amber-300 tracking-tight">
            {formatNumber(data.distribution.porsiKecil)}
          </span>
        </div>

        {/* PORSI BESAR */}
        <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/40 p-2.5 sm:p-3 text-center flex flex-col justify-center transition-all hover:bg-emerald-50/60 dark:hover:bg-emerald-950/60">
          <span className="text-[10px] sm:text-xs font-bold text-[#059669] dark:text-emerald-400 uppercase tracking-wider mb-0.5">
            PORSI BESAR
          </span>
          <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#065F46] dark:text-emerald-300 tracking-tight">
            {formatNumber(data.distribution.porsiBesar)}
          </span>
        </div>
      </div>

      {/* Footer Info & Interactive School Quota Toggle */}
      <div className="pt-1">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
          Distribusi makanan bergizi disiapkan dan disalurkan sesuai standar kuota sasaran SPPG Wonomulyo Sidodadi.
        </p>

        <div className="mt-2.5 flex justify-center">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 flex items-center gap-1 px-3 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>{showBreakdown ? 'Tutup Rincian Sekolah' : 'Lihat Rincian Sasaran Sekolah Penerima'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Breakdown Drawer */}
        {showBreakdown && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Daftar Sekolah & Titik Distribusi ({schools.length} Titik)
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Kecamatan Wonomulyo</span>
                {isAdmin && onOpenEditSchools && (
                  <button
                    onClick={onOpenEditSchools}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-400/90 dark:hover:bg-amber-300 dark:text-amber-950 px-2 py-0.5 rounded-md border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                    title="Edit Nama & Kuota Sekolah"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-amber-700 dark:text-amber-950" />
                    <span>Edit Sekolah</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {schools.map((school, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{school.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{school.grade} • Pengiriman: {school.time}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-blue-700 dark:text-sky-400">{school.count}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">porsi</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/40 p-2 rounded-lg border border-transparent dark:border-blue-900/50">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Termasuk kuota balita, busui & bumil terdaftar
              </span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">Validasi Dinas Kesehatan</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
