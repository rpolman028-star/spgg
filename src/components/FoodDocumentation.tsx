import React, { useState, useEffect } from 'react';
import { Maximize2, Check, Camera } from 'lucide-react';
import { DailyMenuData } from '../types';
import mealTrayAsset from '../assets/images/mbg_menu_tray_1791302159830.jpg';

interface FoodDocumentationProps {
  data: DailyMenuData;
}

export const FoodDocumentation: React.FC<FoodDocumentationProps> = ({ data }) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // Reset error state whenever the image prop changes
  useEffect(() => {
    setHasImageError(false);
  }, [data.dishImage]);

  // Resolve image URL safely - handles base64 data URLs, uploaded server files, and static assets
  const getDisplayImage = () => {
    if (hasImageError || !data.dishImage) {
      return mealTrayAsset;
    }
    const src = data.dishImage;
    if (src.startsWith('data:image')) return src;
    if (src.startsWith('/src/assets/images/')) return mealTrayAsset;
    return src;
  };

  const imageSrc = getDisplayImage();
  const imageKey = data.dishImage
    ? data.dishImage.startsWith('data:')
      ? `data-img-${data.dishImage.length}-${data.dishImage.slice(25, 45)}`
      : data.dishImage
    : 'default-tray';

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 md:p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Camera className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
              DOKUMENTASI SAJIAN MAKANAN
            </h3>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Foto autentik porsi hidangan dari dapur SPPG
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsZoomOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 mt-0.5"
          title="Lihat Foto Penuh"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Perbesar Foto</span>
          <span className="sm:hidden">Perbesar</span>
        </button>
      </div>

      {/* Main Photographic Card - Clean View Without Floating Buttons */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-inner bg-slate-900 group aspect-[4/5] sm:aspect-square md:aspect-[4/4.5] select-none">
        {/* Real Food / Uploaded Photography Background */}
        <img
          key={imageKey}
          src={imageSrc}
          onError={() => setHasImageError(true)}
          alt={`Dokumentasi Sajian MBG - ${data.dateFormatted}`}
          className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.03] transition-transform duration-500 group-hover:scale-[1.01]"
        />

        {/* Soft Vignette / Ambient Shadow for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />

        {/* Top Header Information Overlay (Clean & Non-obstructive) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Top Left: Badan Gizi Nasional Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white shadow-sm">
            <div className="text-left leading-none">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300">Badan Gizi</div>
              <div className="text-[8px] font-semibold text-slate-200">Nasional RI</div>
            </div>
          </div>

          {/* Top Right: Sertifikasi Mutu & Halal */}
          <div className="flex items-center gap-1.5">
            <div className="bg-white/90 backdrop-blur-md text-[#B45309] border border-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-xs">
              ★ BNSP
            </div>
            <div className="bg-emerald-900/85 backdrop-blur-md text-emerald-200 border border-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <span>حلال</span>
              <span className="text-[8px]">Halal</span>
            </div>
          </div>
        </div>

        {/* Bottom Information Pill Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white shadow-lg">
            <div className="text-[11px] font-bold text-white leading-tight">
              {data.sppgUnit}
            </div>
            <div className="text-[10px] text-amber-300 font-semibold">
              {data.dateFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* Under-photo guarantee bar */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          Ompreng Stainless Food Grade SNI
        </span>
        <span className="text-slate-400">Porsi Standar BGN RI</span>
      </div>

      {/* Fullscreen Photo Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-800 text-white flex justify-between items-center text-xs border-b border-slate-700">
              <span className="font-bold">Foto Sajian Menu: {data.dateFormatted}</span>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white font-medium cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="relative aspect-square sm:aspect-[4/3] bg-black">
              <img
                src={imageSrc}
                onError={() => setHasImageError(true)}
                alt="Dokumentasi Fullsize"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3 bg-slate-900 text-slate-300 text-xs">
              <p className="font-medium">
                {data.sppgUnit} • {data.dateFormatted}
              </p>
              {data.chefNote && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {data.chefNote}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
