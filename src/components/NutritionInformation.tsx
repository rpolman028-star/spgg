import React, { useState } from 'react';
import { Flame, Info, CheckCircle2 } from 'lucide-react';
import { DailyMenuData, PortionNutrition } from '../types';

interface NutritionInformationProps {
  data: DailyMenuData;
}

export const NutritionInformation: React.FC<NutritionInformationProps> = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAkgInfo, setShowAkgInfo] = useState(false);

  const formatDecimal = (num: number) => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const categoriesToDisplay =
    selectedCategory === 'all'
      ? data.nutritionData
      : data.nutritionData.filter((item) => item.id === selectedCategory);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 md:p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
              INFORMASI NILAI GIZI
            </h3>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kandungan gizi per porsi standar AKG
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAkgInfo(!showAkgInfo)}
          className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 inline-flex items-center gap-1 hover:underline cursor-pointer shrink-0 mt-0.5"
          title="Tentang Standar AKG"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Standar</span> AKG
        </button>
      </div>

      {/* AKG Info Banner */}
      {showAkgInfo && (
        <div className="mb-4 p-3 bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 animate-in fade-in duration-150 text-left">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-sky-300">
                Kesesuaian Angka Kecukupan Gizi (AKG) Badan Gizi Nasional RI:
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Kandungan makronutrien dan mikronutrien dihitung presisi untuk mencukupi 30-35% kebutuhan energi harian anak sekolah, balita, serta ibu menyusui (busui) dan ibu hamil (bumil) per sekali makan sesuai standar Permenkes No. 28 Tahun 2019.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills - Berpusat rapi di tengah */}
      <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-1.5 mb-4 text-[10px] sm:text-xs">
        {data.nutritionData.map((cat) => {
          const isBumil = cat.id === 'bumil' || cat.label.toLowerCase().includes('busui');
          const displayLabel = isBumil ? 'PORSI BUSUI / BUMIL' : cat.label;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          SEMUA ({data.nutritionData.length})
        </button>
      </div>

      {/* Portion Categories Stacks */}
      <div className="space-y-6">
        {categoriesToDisplay.map((portion) => {
          const isBumil = portion.id === 'bumil' || portion.label.toLowerCase().includes('busui');
          const portionLabel = isBumil ? 'PORSI BUSUI / BUMIL' : portion.label;

          return (
            <div key={portion.id} className="pt-1 first:pt-0">
              {/* Category Header Badge */}
              <div className="mb-2.5 flex items-center flex-wrap gap-2">
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded-md border ${portion.badgeColor} tracking-wide uppercase whitespace-nowrap`}
                >
                  {portionLabel}
                </span>
                {isBumil && (
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                    Ibu Menyusui & Ibu Hamil
                  </span>
                )}
              </div>

            {/* Nutrients Cards (Row 1: 3 cards, Row 2: 2 cards) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
              {/* Energi Total - Yellow Card */}
              <div className="rounded-xl border border-amber-200/90 dark:border-amber-900/60 bg-[#FFFDF5] dark:bg-amber-950/30 p-2 sm:p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 dark:text-amber-400 tracking-tight">
                  Energi Total
                </span>
                <div className="mt-0.5 flex items-baseline justify-center gap-1">
                  <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-amber-200 tracking-tight">
                    {formatDecimal(portion.nutrients.energi)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Kcal
                  </span>
                </div>
              </div>

              {/* Protein - Blue Card */}
              <div className="rounded-xl border border-blue-200/90 dark:border-blue-900/60 bg-[#F6FAFF] dark:bg-blue-950/30 p-2 sm:p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-blue-800 dark:text-blue-400 tracking-tight">
                  Protein
                </span>
                <div className="mt-0.5 flex items-baseline justify-center gap-1">
                  <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-blue-200 tracking-tight">
                    {formatDecimal(portion.nutrients.protein)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    g
                  </span>
                </div>
              </div>

              {/* Lemak - Red/Pink Card */}
              <div className="rounded-xl border border-rose-200/90 dark:border-rose-900/60 bg-[#FFF7F7] dark:bg-rose-950/30 p-2 sm:p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-400 tracking-tight">
                  Lemak
                </span>
                <div className="mt-0.5 flex items-baseline justify-center gap-1">
                  <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-rose-200 tracking-tight">
                    {formatDecimal(portion.nutrients.lemak)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    g
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: 2 cards (Karbohidrat, Serat Pangan) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {/* Karbohidrat - Green Card */}
              <div className="rounded-xl border border-emerald-200/90 dark:border-emerald-900/60 bg-[#F4FBF7] dark:bg-emerald-950/30 p-2 sm:p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-400 tracking-tight">
                  Karbohidrat
                </span>
                <div className="mt-0.5 flex items-baseline justify-center gap-1">
                  <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-emerald-200 tracking-tight">
                    {formatDecimal(portion.nutrients.karbohidrat)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    g
                  </span>
                </div>
              </div>

              {/* Serat Pangan - Purple Card */}
              <div className="rounded-xl border border-purple-200/90 dark:border-purple-900/60 bg-[#FAF7FD] dark:bg-purple-950/30 p-2 sm:p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-purple-800 dark:text-purple-400 tracking-tight">
                  Serat Pangan
                </span>
                <div className="mt-0.5 flex items-baseline justify-center gap-1">
                  <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-purple-200 tracking-tight">
                    {formatDecimal(portion.nutrients.serat)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    g
                  </span>
                </div>
              </div>

              {/* Invisible 3rd slot placeholder to match visual rhythm from screenshot */}
              <div className="hidden sm:block" />
            </div>

            {/* Divider between categories */}
            <div className="mt-5 border-b border-slate-100 dark:border-slate-800 last:hidden" />
          </div>
        );
      })}
    </div>
    </section>
  );
};
