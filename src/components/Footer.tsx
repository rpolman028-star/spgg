import React from 'react';
import { Lock, LogOut } from 'lucide-react';
import { CONTACT_INFO } from '../data/menuData';
import { ThemeToggle } from './ThemeToggle';

interface FooterProps {
  isAdmin?: boolean;
  onOpenLoginModal?: () => void;
  onLogoutAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isAdmin = false,
  onOpenLoginModal,
  onLogoutAdmin,
}) => {
  return (
    <footer className="mt-8 pb-8 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col items-center justify-center gap-1.5 mb-3">
        <div className="font-bold text-slate-700 dark:text-slate-200 text-xs tracking-wide">
          SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONOMULYO SIDODADI
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md px-4 leading-relaxed">
          {CONTACT_INFO.address}
        </p>
      </div>

      <div className="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800 pt-3 max-w-sm mx-auto flex flex-col items-center gap-2">
        {/* Secondary Theme Toggle in Footer */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Tampilan Portal:</span>
          <ThemeToggle showLabel={true} />
        </div>

        <div>Badan Gizi Nasional (BGN) Republik Indonesia • Seluruh Hak Dilindungi.</div>

        {/* Discrete Admin Link */}
        {isAdmin ? (
          <button
            onClick={onLogoutAdmin}
            className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors mt-0.5 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Mode Petugas SPPG Aktif (Klik untuk Keluar)</span>
          </button>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mt-0.5 cursor-pointer"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>Akses Petugas SPPG</span>
          </button>
        )}
      </div>
    </footer>
  );
};
