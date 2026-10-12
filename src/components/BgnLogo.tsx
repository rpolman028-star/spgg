import React, { useState, useEffect, useRef } from 'react';
import { Upload, Check, RotateCcw, Camera } from 'lucide-react';

interface BgnLogoProps {
  className?: string;
  size?: number;
  showUploadTrigger?: boolean;
  alt?: string;
}

export const BgnLogo: React.FC<BgnLogoProps> = ({
  className = '',
  size = 96,
  showUploadTrigger = false,
  alt = 'Logo Resmi Badan Gizi Nasional (BGN) Republik Indonesia',
}) => {
  const [logoSrc, setLogoSrc] = useState<string>('/images/bgn_logo_bw.png');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize logo across components, localStorage, and server API
  useEffect(() => {
    // 1. Immediate local storage check for fastest render
    try {
      const stored = localStorage.getItem('custom_bgn_logo_url');
      if (stored) {
        setLogoSrc(stored);
        setIsCustom(true);
      }
    } catch {
      // ignore
    }

    // 2. Query persistent server endpoint
    fetch('/api/logo')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.exists && data.url) {
          setLogoSrc(data.url);
          setIsCustom(true);
          try {
            localStorage.setItem('custom_bgn_logo_url', data.url);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // ignore
      });

    // 3. Listen to live updates from other components
    const handleLogoUpdate = (e: any) => {
      if (e?.detail) {
        setLogoSrc(e.detail);
        setIsCustom(true);
      } else {
        const stored = localStorage.getItem('custom_bgn_logo_url');
        if (stored) {
          setLogoSrc(stored);
          setIsCustom(true);
        } else {
          setLogoSrc('/images/bgn_logo_bw.png');
          setIsCustom(false);
        }
      }
    };

    window.addEventListener('storage', handleLogoUpdate);
    window.addEventListener('bgn-logo-updated', handleLogoUpdate);
    return () => {
      window.removeEventListener('storage', handleLogoUpdate);
      window.removeEventListener('bgn-logo-updated', handleLogoUpdate);
    };
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (PNG, JPG, SVG, WebP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        // Immediate local application: 100% exact, no alteration or re-encoding
        setLogoSrc(dataUrl);
        setIsCustom(true);

        try {
          localStorage.setItem('custom_bgn_logo_url', dataUrl);
          window.dispatchEvent(new CustomEvent('bgn-logo-updated', { detail: dataUrl }));
        } catch (err) {
          console.warn('LocalStorage error:', err);
        }

        // Sync to server storage
        try {
          const res = await fetch('/api/logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl }),
          });
          const result = await res.json();
          if (result && result.url) {
            setLogoSrc(result.url);
          }
        } catch (err) {
          console.error('Failed to sync logo to server:', err);
        }

        setShowToast('Logo asli berhasil dipasang 100% tanpa perubahan!');
        setTimeout(() => setShowToast(null), 4000);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem('custom_bgn_logo_url');
      await fetch('/api/logo', { method: 'DELETE' });
    } catch {
      // ignore
    }
    setLogoSrc('/images/bgn_logo_bw.png');
    setIsCustom(false);
    window.dispatchEvent(new CustomEvent('bgn-logo-updated', { detail: null }));
    setShowToast('Logo dikembalikan ke default.');
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Logo container */}
      <div
        style={{ width: size, height: size }}
        onDragOver={(e) => {
          if (showUploadTrigger) {
            e.preventDefault();
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative shrink-0 select-none inline-flex items-center justify-center group ${
          isDragging ? 'ring-4 ring-blue-500 rounded-full scale-105' : ''
        } ${className}`}
      >
        <img
          src={logoSrc}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-contain filter drop-shadow-sm select-none transition-transform duration-200"
          referrerPolicy="no-referrer"
          onError={() => {
            if (logoSrc !== '/images/bgn_logo_official.png') {
              setLogoSrc('/images/bgn_logo_official.png');
            }
          }}
        />

        {showUploadTrigger && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Hover Camera Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Pasang / Ganti file logo asli Anda (BGN_LOGO_BW_B.png)"
              className="absolute inset-0 bg-slate-900/60 hover:bg-slate-900/75 opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center text-white transition-all duration-150 cursor-pointer p-2 shadow-inner"
            >
              <Camera className="w-6 h-6 mb-1 text-white" />
              <span className="text-[10px] font-bold tracking-tight text-center leading-tight">
                {isUploading ? 'Menyimpan...' : 'Ganti Logo Asli'}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Prominent Quick-Action Button below the logo if showUploadTrigger is enabled */}
      {showUploadTrigger && (
        <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-800 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/90 hover:border-blue-300 rounded-full px-3 py-1 transition-all shadow-2xs hover:shadow-xs active:scale-95"
            title="Pilih file logo asli (BGN_LOGO_BW_B.png) dari perangkat Anda agar tampil 100% persis"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              {isCustom ? 'Ganti File Logo Asli' : 'Pasang Logo Asli (BGN_LOGO_BW_B.png)'}
            </span>
          </button>

          {isCustom && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-full px-2 py-1 transition-colors"
              title="Kembalikan ke logo awal"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
