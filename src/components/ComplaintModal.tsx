import React, { useState } from 'react';
import { X, Send, CheckCircle, Copy, Check, MessageCircle, AlertCircle, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TARGET_SCHOOLS, CONTACT_INFO } from '../data/menuData';
import { TargetSchool } from '../types';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSchools?: TargetSchool[];
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, targetSchools }) => {
  const schoolsList = targetSchools && targetSchools.length > 0 ? targetSchools : TARGET_SCHOOLS;
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Orang Tua');
  const [schoolName, setSchoolName] = useState(schoolsList[0]?.name || '');
  const [category, setCategory] = useState('Kualitas Rasa');
  const [description, setDescription] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !description) return;

    // Generate Ticket Number: TKT-MBG-2026-XXXX
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `MBG-SPPG-${randomCode}`;
    setSubmittedTicket(ticketId);

    // Fire Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  const handleCopyTicket = () => {
    if (submittedTicket) {
      navigator.clipboard.writeText(submittedTicket);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleForwardToWhatsApp = () => {
    if (!submittedTicket) return;
    const text = encodeURIComponent(
      `*PENGADUAN LAYANAN MBG*\n` +
      `No. Tiket: ${submittedTicket}\n` +
      `Nama: ${fullName}\n` +
      `Peran: ${role}\n` +
      `Sekolah/Unit: ${schoolName}\n` +
      `Kategori: ${category}\n` +
      `Aduan: ${description}\n\n` +
      `Mohon ditindaklanjuti oleh Tim SPPG Wonomulyo Sidodadi. Terima kasih.`
    );
    window.open(`https://wa.me/6283199450827?text=${text}`, '_blank');
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setFullName('');
    setPhoneNumber('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-linear-to-r from-blue-700 to-sky-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
              Portal Aduan MBG Sidodadi
            </span>
            <h3 className="text-base font-black">Formulir Pengaduan Layanan</h3>
          </div>
          <button
            onClick={resetForm}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedTicket ? (
          /* Submission Success View */
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Pengaduan Berhasil Terkirim!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
              Terima kasih atas laporan Anda. Tim Pengawas Mutu & Distribusi SPPG Wonomulyo Sidodadi akan segera menindaklanjuti.
            </p>

            {/* Ticket Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 mb-5 max-w-sm mx-auto">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Nomor Tiket Anda
              </span>
              <div className="text-xl font-black text-blue-700 dark:text-sky-400 tracking-wider my-1 font-mono">
                {submittedTicket}
              </div>
              <button
                onClick={handleCopyTicket}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-sky-400 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Nomor Tiket'}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 max-w-sm mx-auto">
              <button
                onClick={handleForwardToWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Teruskan ke WhatsApp Petugas</span>
              </button>

              <button
                onClick={resetForm}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Complaint Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pelapor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Pelapor
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="Orang Tua">Orang Tua / Wali Murid</option>
                  <option value="Guru / Sekolah">Guru / Pihak Sekolah</option>
                  <option value="Siswa">Siswa / Penerima MBG</option>
                  <option value="Petugas Posyandu">Petugas Posyandu / Kader</option>
                  <option value="Masyarakat Umum">Masyarakat Umum</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sekolah / Titik Sasaran
                </label>
                <select
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 truncate cursor-pointer"
                >
                  {schoolsList.map((school, i) => (
                    <option key={i} value={school.name}>
                      {school.name}
                    </option>
                  ))}
                  <option value="Lainnya">Lainnya / Luar Wilayah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Kendala / Masukan <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
              >
                <option value="Kualitas Rasa">Kualitas Rasa / Kematangan Makanan</option>
                <option value="Porsi Kurang">Jumlah Porsi Kurang dari Kuota</option>
                <option value="Keterlambatan Distribusi">Keterlambatan Waktu Distribusi</option>
                <option value="Kemasan Rusak">Kemasan / Tutup Ompreng Rusak</option>
                <option value="Kebersihan Makanan">Kebersihan / Temuan Benda Asing</option>
                <option value="Alergi / Khusus">Kebutuhan Menu Khusus / Alergi</option>
                <option value="Saran / Pertanyaan">Saran Perbaikan / Pertanyaan Umum</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rincian Pengaduan / Masukan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan secara jelas kendala atau saran Anda terkait sajian makanan hari ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none"
              ></textarea>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Camera className="w-4 h-4 text-slate-400" />
                Foto Bukti Fisik (opsional saat chat WA)
              </span>
              <span className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold">Tersedia via WA</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Aduan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
