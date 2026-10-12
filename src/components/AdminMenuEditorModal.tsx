import React, { useState } from 'react';
import { X, Save, RotateCcw, Upload, Copy, Check, Sparkles, Loader2, RefreshCw, AlertCircle, Link as LinkIcon, CheckCircle2, School, Plus, Trash2, Download } from 'lucide-react';
import { DailyMenuData } from '../types';
import { DEFAULT_MENU, CONTACT_INFO, TARGET_SCHOOLS, DEFAULT_DISTRIBUTION_HISTORY } from '../data/menuData';
import { compressImageFile, estimateDataUrlSizeKb } from '../utils/imageCompressor';

interface AdminMenuEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMenu: DailyMenuData;
  onSaveMenu: (newMenu: DailyMenuData) => void;
  onResetMenu: () => void;
  initialTab?: 'info' | 'distribusi' | 'sekolah' | 'foto' | 'komposisi' | 'gizi' | 'waktu' | 'kontak';
}

export const AdminMenuEditorModal: React.FC<AdminMenuEditorModalProps> = ({
  isOpen,
  onClose,
  currentMenu,
  onSaveMenu,
  onResetMenu,
  initialTab = 'info',
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'distribusi' | 'sekolah' | 'foto' | 'komposisi' | 'gizi' | 'waktu' | 'kontak'>(initialTab);
  const [formData, setFormData] = useState<DailyMenuData>(() => {
    const clone = JSON.parse(JSON.stringify(currentMenu));
    if (!clone.targetSchools || clone.targetSchools.length === 0) {
      clone.targetSchools = JSON.parse(JSON.stringify(TARGET_SCHOOLS));
    }
    if (!clone.distributionHistory || clone.distributionHistory.length === 0) {
      clone.distributionHistory = JSON.parse(JSON.stringify(DEFAULT_DISTRIBUTION_HISTORY));
    }
    return clone;
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [exportedCsv, setExportedCsv] = useState(false);
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('custom_bgn_logo_url');
    } catch {
      return false;
    }
  });

  // Sync state when opened
  React.useEffect(() => {
    const clone = JSON.parse(JSON.stringify(currentMenu));
    if (!clone.targetSchools || clone.targetSchools.length === 0) {
      clone.targetSchools = JSON.parse(JSON.stringify(TARGET_SCHOOLS));
    }
    if (!clone.distributionHistory || clone.distributionHistory.length === 0) {
      clone.distributionHistory = JSON.parse(JSON.stringify(DEFAULT_DISTRIBUTION_HISTORY));
    }
    setFormData(clone);
    if (initialTab) setActiveTab(initialTab);
    setShowUrlInput(false);
  }, [currentMenu, isOpen, initialTab]);

  // Handle Image Upload with client-side canvas compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setImageUploadStatus('Mengompres & mengoptimalkan foto sajian...');

      // Compress to ~80-140KB sharp JPEG
      const compressedDataUrl = await compressImageFile(file, 1100, 0.8);
      const sizeKb = estimateDataUrlSizeKb(compressedDataUrl);

      setFormData((prev) => ({
        ...prev,
        dishImage: compressedDataUrl,
      }));

      setImageUploadStatus(`✓ Foto baru berhasil dipilih (~${sizeKb} KB)! Tekan tombol "Simpan Perubahan" di bawah.`);
    } catch (err: unknown) {
      console.error('Error compressing image:', err);
      // Fallback
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const res = loadEvt.target?.result as string;
        if (res) {
          setFormData((prev) => ({ ...prev, dishImage: res }));
          setImageUploadStatus('✓ Foto dipilih. Tekan tombol "Simpan Perubahan" di bawah.');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingImage(false);
      // Clear input value so same file can be selected again
      e.target.value = '';
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (loadEvt) => {
      const res = loadEvt.target?.result as string;
      if (res) {
        try {
          localStorage.setItem('custom_bgn_logo_url', res);
          setHasCustomLogo(true);
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('bgn-logo-updated', { detail: res }));
        } catch (err) {
          console.error('Error saving custom logo:', err);
        }

        try {
          await fetch('/api/logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: res }),
          });
        } catch (err) {
          console.error('Failed to sync logo to server:', err);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetLogo = async () => {
    try {
      localStorage.removeItem('custom_bgn_logo_url');
      setHasCustomLogo(false);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('bgn-logo-updated', { detail: null }));
      await fetch('/api/logo', { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    const history = formData.distributionHistory || DEFAULT_DISTRIBUTION_HISTORY;
    const sppgUnit = formData.sppgUnit || 'SPPG Polewali Mandar Wonomulyo Sidodadi';

    // CSV Header row
    const headers = [
      'Tanggal (YYYY-MM-DD)',
      'Hari',
      'Porsi Besar (SMP/SMA)',
      'Porsi Kecil (SD)',
      'Porsi Balita & Busui',
      'Total Porsi',
      'Status Validasi',
      'Catatan',
      'Unit SPPG'
    ];

    // Escape quotes and format rows safely
    const escapeCsv = (str: string | number | undefined | null) => {
      const val = str === null || str === undefined ? '' : String(str);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const rows = history.map((item) => [
      escapeCsv(item.dateKey),
      escapeCsv(item.dayLabel),
      escapeCsv(item.porsiBesar),
      escapeCsv(item.porsiKecil),
      escapeCsv(item.porsiBalita),
      escapeCsv(item.total),
      escapeCsv(item.status),
      escapeCsv(item.notes || '-'),
      escapeCsv(sppgUnit)
    ]);

    // Summary calculation row
    const totalSemua = history.reduce((sum, item) => sum + item.total, 0);
    const totalBesar = history.reduce((sum, item) => sum + item.porsiBesar, 0);
    const totalKecil = history.reduce((sum, item) => sum + item.porsiKecil, 0);
    const totalBalita = history.reduce((sum, item) => sum + item.porsiBalita, 0);

    const summaryRow = [
      'TOTAL 7 HARI',
      '-',
      escapeCsv(totalBesar),
      escapeCsv(totalKecil),
      escapeCsv(totalBalita),
      escapeCsv(totalSemua),
      'Akumulasi Pekan Aktif',
      '-',
      escapeCsv(sppgUnit)
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      summaryRow.join(',')
    ].join('\r\n');

    // Add UTF-8 BOM so Microsoft Excel & Google Sheets open Indonesian characters cleanly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Laporan_Distribusi_MBG_7Hari_${formData.dateKey || '2026'}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedCsv(true);
    setTimeout(() => setExportedCsv(false), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const sanitizedNutrition = formData.nutritionData.map((n) => {
        if (n.id === 'bumil' || n.label.toLowerCase().includes('busui')) {
          return { ...n, label: 'PORSI BUSUI / BUMIL' };
        }
        return n;
      });
      const toSave = { ...formData, nutritionData: sanitizedNutrition };
      await onSaveMenu(toSave);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSaving(false);
        onClose();
      }, 700);
    } catch {
      setIsSaving(false);
    }
  };

  const handleCopyCodeSnippet = () => {
    const codeString = `export const DEFAULT_MENU: DailyMenuData = ${JSON.stringify(formData, null, 2)};`;
    navigator.clipboard.writeText(codeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isDataUrl = formData.dishImage?.startsWith('data:image');
  const currentImageSizeKb = isDataUrl ? estimateDataUrlSizeKb(formData.dishImage) : null;
  const currentSchools = formData.targetSchools || TARGET_SCHOOLS;

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kelola & Update Menu Harian MBG</h3>
              <p className="text-[11px] text-slate-400">Panel Petugas SPPG Polewali Mandar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              title="Unduh Laporan Distribusi 7 Hari Format CSV"
              className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {exportedCsv ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{exportedCsv ? 'CSV Diunduh!' : 'Export as CSV'}</span>
              <span className="sm:hidden">{exportedCsv ? 'Unduh!' : 'CSV'}</span>
            </button>
            <button
              onClick={handleCopyCodeSnippet}
              title="Salin Kode TypeScript untuk menuData.ts"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin!' : 'Salin Kode TS'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation - Flex wrap ensures all tabs including Sekolah & Kontak are fully visible */}
        <div className="flex flex-wrap items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 gap-1.5 shrink-0 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Info & Tanggal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('distribusi')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'distribusi'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Distribusi Porsi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sekolah')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'sekolah'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Daftar Sekolah ({currentSchools.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('foto')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'foto'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Dokumentasi Foto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('komposisi')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'komposisi'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Komposisi Menu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gizi')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'gizi'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Nilai Gizi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('waktu')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'waktu'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Batas Waktu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kontak')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'kontak'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Kontak & Aduan
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: INFO & TANGGAL */}
          {activeTab === 'info' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                Ubah informasi umum tanggal penyajian dan nama satuan SPPG yang ditampilkan pada kop utama portal.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Format Tanggal Display:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dateFormatted}
                    onChange={(e) => setFormData({ ...formData, dateFormatted: e.target.value })}
                    placeholder="Contoh: Kamis, 24 September 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kunci Tanggal (YYYY-MM-DD):
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateKey}
                    onChange={(e) => setFormData({ ...formData, dateKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Satuan Pelayanan (SPPG):
                </label>
                <input
                  type="text"
                  required
                  value={formData.sppgUnit}
                  onChange={(e) => setFormData({ ...formData, sppgUnit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Ahli Gizi / Dapur SPPG:
                </label>
                <textarea
                  rows={2}
                  value={formData.chefNote || ''}
                  onChange={(e) => setFormData({ ...formData, chefNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DISTRIBUSI PORSI */}
          {activeTab === 'distribusi' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                Atur angka alokasi porsi harian. Angka akan otomatis terformat dengan titik pemisah ribuan (contoh: 3.601).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200">
                  <label className="block font-bold text-blue-800 mb-1">
                    TOTAL PORSI:
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.distribution.total}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distribution: { ...formData.distribution, total: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-blue-300 text-lg font-black text-blue-900"
                  />
                </div>

                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200">
                  <label className="block font-bold text-amber-800 mb-1">
                    PORSI KECIL:
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.distribution.porsiKecil}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distribution: { ...formData.distribution, porsiKecil: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-lg font-black text-amber-900"
                  />
                </div>

                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200">
                  <label className="block font-bold text-emerald-800 mb-1">
                    PORSI BESAR:
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.distribution.porsiBesar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distribution: { ...formData.distribution, porsiBesar: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-lg font-black text-emerald-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status Validasi:
                </label>
                <input
                  type="text"
                  value={formData.distribution.validationStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      distribution: { ...formData.distribution, validationStatus: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Daftar Sekolah & Titik Distribusi ({currentSchools.length} Titik)</span>
                  <p className="text-[11px] text-slate-500">Ubah nama-nama sekolah, kuota porsi dan jam antar.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('sekolah')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Buka Tab Sekolah →
                </button>
              </div>
            </div>
          )}

          {/* TAB: DAFTAR SEKOLAH & TITIK DISTRIBUSI */}
          {activeTab === 'sekolah' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-blue-900 leading-relaxed flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-blue-900">Kelola Titik Distribusi & Nama Sekolah Penerima MBG</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Ubah nama sekolah, jumlah alokasi porsi, jenjang pendidikan, dan estimasi waktu pengiriman makanan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSchool = {
                      name: 'Nama Sekolah Baru',
                      count: 100,
                      grade: 'SD (Porsi Kecil)',
                      time: '09.30 WIB',
                    };
                    setFormData({
                      ...formData,
                      targetSchools: [...(formData.targetSchools || TARGET_SCHOOLS), newSchool],
                    });
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sekolah</span>
                </button>
              </div>

              {/* List of Schools */}
              <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
                {(formData.targetSchools || TARGET_SCHOOLS).map((school, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {sIdx + 1}
                        </span>
                        Titik #{sIdx + 1}: <span className="text-blue-900">{school.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentList = [...(formData.targetSchools || TARGET_SCHOOLS)];
                          currentList.splice(sIdx, 1);
                          setFormData({
                            ...formData,
                            targetSchools: currentList,
                          });
                        }}
                        className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-md transition-colors cursor-pointer"
                        title="Hapus Titik Sekolah"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Nama Sekolah / Titik Distribusi:
                        </label>
                        <input
                          type="text"
                          required
                          value={school.name}
                          onChange={(e) => {
                            const updated = [...(formData.targetSchools || TARGET_SCHOOLS)];
                            updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                            setFormData({ ...formData, targetSchools: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Alokasi Jumlah Porsi:
                        </label>
                        <input
                          type="number"
                          required
                          value={school.count}
                          onChange={(e) => {
                            const updated = [...(formData.targetSchools || TARGET_SCHOOLS)];
                            updated[sIdx] = { ...updated[sIdx], count: Number(e.target.value) };
                            setFormData({ ...formData, targetSchools: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-blue-700 font-black text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Jenjang / Kategori Sasaran:
                        </label>
                        <input
                          type="text"
                          value={school.grade}
                          onChange={(e) => {
                            const updated = [...(formData.targetSchools || TARGET_SCHOOLS)];
                            updated[sIdx] = { ...updated[sIdx], grade: e.target.value };
                            setFormData({ ...formData, targetSchools: updated });
                          }}
                          placeholder="Contoh: SMP / MTs atau SD (Porsi Kecil)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Jadwal Pengiriman:
                        </label>
                        <input
                          type="text"
                          value={school.time}
                          onChange={(e) => {
                            const updated = [...(formData.targetSchools || TARGET_SCHOOLS)];
                            updated[sIdx] = { ...updated[sIdx], time: e.target.value };
                            setFormData({ ...formData, targetSchools: updated });
                          }}
                          placeholder="Contoh: 10.00 WIB"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary and Reset Button */}
              <div className="flex flex-wrap items-center justify-between p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] gap-2">
                <span className="font-semibold text-slate-700">
                  Total Alokasi Sekolah:{' '}
                  <strong className="text-blue-700 font-black">
                    {(formData.targetSchools || TARGET_SCHOOLS).reduce((acc, curr) => acc + (curr.count || 0), 0)} porsi
                  </strong>{' '}
                  di {(formData.targetSchools || TARGET_SCHOOLS).length} titik
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      targetSchools: JSON.parse(JSON.stringify(TARGET_SCHOOLS)),
                    });
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Kembalikan Daftar Asli</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOKUMENTASI SAJIAN MAKANAN (FOTO) */}
          {activeTab === 'foto' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                Unggah foto sajian makanan dari galeri/kamera. Foto otomatis dioptimalkan dan disimpan ke server portal sehingga <strong>langsung tampil untuk semua pengunjung</strong> saat dipublikasikan.
              </div>

              {/* Image Preview Box */}
              <div className="relative aspect-video max-w-sm mx-auto rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-inner flex items-center justify-center">
                {isProcessingImage ? (
                  <div className="flex flex-col items-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <span>Sedang mengompres & memproses foto...</span>
                  </div>
                ) : formData.dishImage ? (
                  <>
                    <img
                      key={formData.dishImage.slice(0, 50)}
                      src={formData.dishImage}
                      alt="Pratinjau Foto Makanan"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{isDataUrl ? `Foto Unggahan Baru (${currentImageSizeKb} KB)` : 'Foto Terpasang'}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-slate-400">Tidak ada gambar</span>
                )}
              </div>

              {/* Status Message */}
              {imageUploadStatus && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center font-semibold text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{imageUploadStatus}</span>
                </div>
              )}

              {/* Primary Upload Controls */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-blue-300 rounded-xl text-center space-y-3">
                <input
                  type="file"
                  id="dishUpload"
                  accept="image/*"
                  disabled={isProcessingImage}
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <div>
                  <label
                    htmlFor="dishUpload"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-all ${
                      isProcessingImage ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isProcessingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isProcessingImage ? 'Memproses...' : 'Pilih Foto dari Galeri / Kamera'}</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        dishImage: DEFAULT_MENU.dishImage,
                      }));
                      setShowUrlInput(false);
                      setImageUploadStatus('✓ Dikembalikan ke foto bawaan resmi!');
                      setTimeout(() => setImageUploadStatus(null), 3000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Pakai Foto Bawaan Asli SPPG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showUrlInput ? 'Tutup URL' : 'Gunakan URL Web'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-500">
                  Mendukung JPG, PNG, WebP dari HP/laptop. Jangan lupa klik <strong>"Simpan Perubahan"</strong> di bawah.
                </p>
              </div>

              {/* Optional Direct Image URL Input */}
              {showUrlInput && (
                <div className="p-3 bg-slate-100 rounded-xl space-y-1.5 border border-slate-200 animate-in fade-in">
                  <label className="block font-bold text-slate-700">
                    Masukkan URL Foto Web Eksternal:
                  </label>
                  <input
                    type="text"
                    value={isDataUrl ? '' : (formData.dishImage || '')}
                    onChange={(e) => setFormData({ ...formData, dishImage: e.target.value })}
                    placeholder="https://contoh.com/foto-makanan.jpg"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                  />
                  <p className="text-[10px] text-slate-500">
                    Bisa berupa tautan gambar publik HTTPS dari internet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DAFTAR KOMPOSISI MENU (5 ITEMS) */}
          {activeTab === 'komposisi' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 text-blue-900">
                Ubah 5 sajian makanan yang ditampilkan pada daftar bernomor dan label penunjuk foto baki ompreng.
              </div>

              {formData.menuItems.map((item, index) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      Komposisi #{index + 1} ({item.category})
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {item.portionGrams}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Nama Masakan:</label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...formData.menuItems];
                          updated[index] = { ...updated[index], name: e.target.value };
                          setFormData({ ...formData, menuItems: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Gramasi / Takaran Porsi:</label>
                      <input
                        type="text"
                        required
                        value={item.portionGrams}
                        onChange={(e) => {
                          const updated = [...formData.menuItems];
                          updated[index] = { ...updated[index], portionGrams: e.target.value };
                          setFormData({ ...formData, menuItems: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Deskripsi Mutu & Bahan:</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...formData.menuItems];
                        updated[index] = { ...updated[index], description: e.target.value };
                        setFormData({ ...formData, menuItems: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Perkiraan Kalori (Kkal):</label>
                      <input
                        type="number"
                        value={item.caloriesApprox}
                        onChange={(e) => {
                          const updated = [...formData.menuItems];
                          updated[index] = { ...updated[index], caloriesApprox: Number(e.target.value) };
                          setFormData({ ...formData, menuItems: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Keterangan Alergen:</label>
                      <input
                        type="text"
                        value={item.allergens || ''}
                        onChange={(e) => {
                          const updated = [...formData.menuItems];
                          updated[index] = { ...updated[index], allergens: e.target.value };
                          setFormData({ ...formData, menuItems: updated });
                        }}
                        placeholder="Contoh: Bebas alergen"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: NILAI GIZI */}
          {activeTab === 'gizi' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 text-blue-900">
                Ubah angka kandungan nutrisi (Energi, Protein, Lemak, Karbohidrat, Serat) untuk masing-masing porsi sasaran.
              </div>

              {formData.nutritionData.map((portion, pIdx) => (
                <div key={portion.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center flex-wrap gap-2">
                      {portion.id === 'bumil' || portion.label.toLowerCase().includes('busui')
                        ? 'PORSI BUSUI / BUMIL'
                        : portion.label}
                      {(portion.id === 'bumil' || portion.label.toLowerCase().includes('busui')) && (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                          Ibu Menyusui & Ibu Hamil
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <label className="block text-[9px] font-bold text-amber-800">Energi (kkal)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={portion.nutrients.energi}
                        onChange={(e) => {
                          const updated = [...formData.nutritionData];
                          updated[pIdx].nutrients.energi = Number(e.target.value);
                          setFormData({ ...formData, nutritionData: updated });
                        }}
                        className="w-full text-center font-bold text-amber-900 bg-white rounded border border-amber-300 mt-1"
                      />
                    </div>

                    <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                      <label className="block text-[9px] font-bold text-rose-800">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={portion.nutrients.protein}
                        onChange={(e) => {
                          const updated = [...formData.nutritionData];
                          updated[pIdx].nutrients.protein = Number(e.target.value);
                          setFormData({ ...formData, nutritionData: updated });
                        }}
                        className="w-full text-center font-bold text-rose-900 bg-white rounded border border-rose-300 mt-1"
                      />
                    </div>

                    <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <label className="block text-[9px] font-bold text-purple-800">Lemak (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={portion.nutrients.lemak}
                        onChange={(e) => {
                          const updated = [...formData.nutritionData];
                          updated[pIdx].nutrients.lemak = Number(e.target.value);
                          setFormData({ ...formData, nutritionData: updated });
                        }}
                        className="w-full text-center font-bold text-purple-900 bg-white rounded border border-purple-300 mt-1"
                      />
                    </div>

                    <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                      <label className="block text-[9px] font-bold text-cyan-800">Karbo (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={portion.nutrients.karbohidrat}
                        onChange={(e) => {
                          const updated = [...formData.nutritionData];
                          updated[pIdx].nutrients.karbohidrat = Number(e.target.value);
                          setFormData({ ...formData, nutritionData: updated });
                        }}
                        className="w-full text-center font-bold text-cyan-900 bg-white rounded border border-cyan-300 mt-1"
                      />
                    </div>

                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 col-span-2 sm:col-span-1">
                      <label className="block text-[9px] font-bold text-emerald-800">Serat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={portion.nutrients.serat}
                        onChange={(e) => {
                          const updated = [...formData.nutritionData];
                          updated[pIdx].nutrients.serat = Number(e.target.value);
                          setFormData({ ...formData, nutritionData: updated });
                        }}
                        className="w-full text-center font-bold text-emerald-900 bg-white rounded border border-emerald-300 mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: BATAS AMAN WAKTU KONSUMSI */}
          {activeTab === 'waktu' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 text-blue-900">
                Atur tenggat batas waktu aman santap untuk setiap jenjang sekolah dan sasaran penerima.
              </div>

              {formData.safeTimes.map((time, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Kelompok Sasaran:</label>
                    <input
                      type="text"
                      value={time.targetGroup}
                      onChange={(e) => {
                        const updated = [...formData.safeTimes];
                        updated[idx].targetGroup = e.target.value;
                        setFormData({ ...formData, safeTimes: updated });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Batas Jam Santap:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={time.deadlineTime}
                        onChange={(e) => {
                          const updated = [...formData.safeTimes];
                          updated[idx].deadlineTime = e.target.value;
                          setFormData({ ...formData, safeTimes: updated });
                        }}
                        placeholder="Contoh: 10.00"
                        className="w-2/3 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800 font-bold"
                      />
                      <input
                        type="text"
                        value={time.unit}
                        onChange={(e) => {
                          const updated = [...formData.safeTimes];
                          updated[idx].unit = e.target.value;
                          setFormData({ ...formData, safeTimes: updated });
                        }}
                        className="w-1/3 px-2 py-1 rounded-lg border border-slate-300 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Keterangan Sesi:</label>
                    <input
                      type="text"
                      value={time.notes}
                      onChange={(e) => {
                        const updated = [...formData.safeTimes];
                        updated[idx].notes = e.target.value;
                        setFormData({ ...formData, safeTimes: updated });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: KONTAK & ADUAN */}
          {activeTab === 'kontak' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 text-blue-900">
                Perbarui nomor WhatsApp Aduan, Website, Email dan Akun Sosial Media resmi SPPG.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Website Pengaduan:
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.websiteUrl || CONTACT_INFO.websiteUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: {
                          ...(formData.contactInfo || CONTACT_INFO),
                          websiteUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor WhatsApp Aduan:
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo?.whatsappNumber || CONTACT_INFO.whatsappNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...(formData.contactInfo || CONTACT_INFO),
                            whatsappNumber: e.target.value,
                            whatsappDisplay: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Layanan:
                    </label>
                    <input
                      type="email"
                      value={formData.contactInfo?.email || CONTACT_INFO.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...(formData.contactInfo || CONTACT_INFO),
                            email: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-700 text-xs">Media Sosial Resmi:</div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Link Facebook:
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo?.socialMedia?.facebook || CONTACT_INFO.socialMedia.facebook}
                      onChange={(e) => {
                        const current = formData.contactInfo || { ...CONTACT_INFO };
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...current,
                            socialMedia: {
                              ...current.socialMedia,
                              facebook: e.target.value,
                            },
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Link Instagram:
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo?.socialMedia?.instagram || CONTACT_INFO.socialMedia.instagram}
                      onChange={(e) => {
                        const current = formData.contactInfo || { ...CONTACT_INFO };
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...current,
                            socialMedia: {
                              ...current.socialMedia,
                              instagram: e.target.value,
                            },
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Link TikTok:
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo?.socialMedia?.tiktok || CONTACT_INFO.socialMedia.tiktok}
                      onChange={(e) => {
                        const current = formData.contactInfo || { ...CONTACT_INFO };
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...current,
                            socialMedia: {
                              ...current.socialMedia,
                              tiktok: e.target.value,
                            },
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan semua data ke setelan awal bawaan?')) {
                  onResetMenu();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Tersimpan!' : isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
