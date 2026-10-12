import React, { useState } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal, Lock, LogOut } from 'lucide-react';
import { DailyMenuData } from '../types';
import { ALTERNATIVE_MENUS } from '../data/menuData';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentMenu: DailyMenuData;
  onSelectDate: (menu: DailyMenuData) => void;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
  onOpenLoginModal?: () => void;
  onLogoutAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMenu,
  onSelectDate,
  isAdmin = false,
  onOpenAdminModal,
  onOpenLoginModal,
  onLogoutAdmin,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const availableDates = Object.values(ALTERNATIVE_MENUS);

  return (
    <header className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
      {/* Top Colorful Accent Line (National & Nutrition Colors) */}
      <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-sky-500 to-emerald-500" />

      {/* Quick Action Top Bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-md text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          SPPG Aktif
        </span>

        <div className="flex items-center gap-2">
          {/* Theme Toggle (Light / Dark mode switcher) */}
          <ThemeToggle />

          {isAdmin && (
            <>
              {onOpenAdminModal && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenAdminModal();
                  }}
                  type="button"
                  title="Perbarui Data Menu, Distribusi & Gizi"
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 px-3 py-1 rounded-lg border border-amber-400 transition-all shadow-xs cursor-pointer active:scale-95 touch-manipulation"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-900" />
                  <span>Update Data</span>
                </button>
              )}

              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  title="Keluar dari Mode Admin"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-4 md:px-5 pb-5 pt-2 flex flex-col items-center text-center">
        {/* Subtitle */}
        <p className="text-xs md:text-sm font-extrabold tracking-wider text-blue-700 dark:text-sky-400 uppercase mb-1">
          PROGRAM MAKAN BERGIZI GRATIS
        </p>

        {/* SPPG Unit Title */}
        <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 max-w-md mb-1 leading-snug">
          {currentMenu.sppgUnit}
        </h2>

        {/* Main Title */}
        <h1 className="text-2xl md:text-3xl font-black text-[#0B1B3D] dark:text-white tracking-tight mb-3.5">
          Informasi Menu MBG
        </h1>

        {/* Date Selector Badge */}
        <div className="relative">
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-400 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs md:text-sm font-semibold transition-all shadow-2xs hover:shadow-sm cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Tanggal: {currentMenu.dateFormatted}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Date Picker Dropdown */}
          {isDatePickerOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-750 py-2 z-30 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Pilih Jadwal Menu
              </div>
              <div className="max-h-56 overflow-y-auto">
                {availableDates.map((item) => (
                  <button
                    key={item.dateKey}
                    onClick={() => {
                      onSelectDate(item);
                      setIsDatePickerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      item.dateKey === currentMenu.dateKey
                        ? 'bg-blue-50/70 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-semibold border-l-3 border-blue-600 dark:border-sky-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.dateFormatted}</span>
                    {item.dateKey === currentMenu.dateKey && (
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-sky-300 px-1.5 py-0.5 rounded-sm">
                        Terpilih
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
