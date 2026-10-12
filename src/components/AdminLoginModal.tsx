import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim();

    // Password resmi petugas: ihs.ac.id, admin, mbg2026, sppg2026
    const validPasswords = ['ihs.ac.id', 'admin', 'mbg2026', 'sppg2026'];
    if (validPasswords.includes(cleanPassword.toLowerCase())) {
      setError(false);
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Login Petugas / Admin SPPG</h3>
              <p className="text-[10px] text-slate-400">Verifikasi hak akses pengelolaan portal</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(false);
              setPassword('');
              onClose();
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Masukkan Password Admin:
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Masukkan password admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm tracking-wider pr-10"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 mt-2 text-[11px] font-semibold animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Password salah! Periksa kembali password Anda.</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-white block mb-0.5">Akses Khusus Petugas:</span>
            Hanya petugas SPPG berwenang yang dapat mengakses panel <strong>Update Data</strong> dan pengelolaan menu.
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setError(false);
                setPassword('');
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Masuk Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
