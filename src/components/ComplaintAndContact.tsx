import React from 'react';
import { Globe, ExternalLink, MessageCircle, Mail, Edit3, MessageSquare } from 'lucide-react';
import { CONTACT_INFO } from '../data/menuData';
import { ContactInfo } from '../types';

interface ComplaintAndContactProps {
  onOpenComplaintModal: () => void;
  contactInfo?: ContactInfo;
  isAdmin?: boolean;
  onOpenEditContact?: () => void;
}

export const ComplaintAndContact: React.FC<ComplaintAndContactProps> = ({
  onOpenComplaintModal,
  contactInfo,
  isAdmin = false,
  onOpenEditContact,
}) => {
  const activeContact = contactInfo || CONTACT_INFO;

  const handleOpenWhatsApp = () => {
    const rawNumber = activeContact.whatsappNumber.replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;
    const message = encodeURIComponent(
      'Halo Admin SPPG Polewali Mandar Wonomulyo Sidodadi, saya ingin menyampaikan informasi/aduan terkait Program Makan Bergizi Gratis (MBG).'
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const handleOpenEmail = () => {
    window.open(`mailto:${activeContact.email}?subject=Aduan Layanan MBG SPPG Wonomulyo Sidodadi`, '_blank');
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 md:p-5 shadow-xs transition-colors duration-200">
      {/* Header with Title & Quick Update Button */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs shrink-0">
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
              KOTAK ADUAN & LAYANAN INFORMASI
            </h3>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Layanan aspirasi, kendala, dan evaluasi MBG
            </p>
          </div>
        </div>

        {isAdmin && onOpenEditContact && (
          <button
            onClick={onOpenEditContact}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
            title="Update Nomor WhatsApp & Email"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Update Kontak</span>
            <span className="sm:hidden">Edit</span>
          </button>
        )}
      </div>

      {/* Main Action Card: Website Pengaduan Online */}
      <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/30 p-3.5 sm:p-4 mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sky-50/50 dark:hover:bg-sky-950/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0070F3] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Globe className="w-5 h-5" />
          </div>

          <div className="text-left">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/60 uppercase tracking-wide mb-1">
              WEBSITE PENGADUAN ONLINE
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeContact.websiteUrl}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Klik untuk langsung masuk ke formulir dan menginput pengaduan layanan MBG
            </p>
          </div>
        </div>

        <button
          onClick={onOpenComplaintModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070F3] hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-95 shrink-0"
        >
          <span>Input Pengaduan</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: WhatsApp & Email Cards with Quick Edit Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
        {/* WhatsApp Card */}
        <div className="relative rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/30 p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/50 transition-all group">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 fill-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  WHATSAPP ADUAN
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {activeContact.whatsappDisplay || activeContact.whatsappNumber}
                </div>
              </div>
            </button>

            {isAdmin && onOpenEditContact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditContact();
                }}
                className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/80 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Edit Nomor WhatsApp"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Email Card */}
        <div className="relative rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/30 p-3 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all group">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleOpenEmail}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0066CC] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  EMAIL LAYANAN
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeContact.email}
                </div>
              </div>
            </button>

            {isAdmin && onOpenEditContact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditContact();
                }}
                className="p-1.5 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Edit Alamat Email"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Channels */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            MEDIA SOSIAL RESMI:
          </div>
          {isAdmin && onOpenEditContact && (
            <button
              onClick={onOpenEditContact}
              className="text-[10px] text-blue-600 hover:underline font-semibold"
            >
              Edit Link
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Facebook */}
          <a
            href={activeContact.socialMedia?.facebook || CONTACT_INFO.socialMedia.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700 text-[#1877F2] dark:text-blue-400 text-xs font-semibold transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="truncate">Facebook</span>
          </a>

          {/* Instagram */}
          <a
            href={activeContact.socialMedia?.instagram || CONTACT_INFO.socialMedia.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white dark:bg-slate-800 hover:bg-pink-50/50 dark:hover:bg-slate-700 text-[#E4405F] dark:text-pink-400 text-xs font-semibold transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="truncate">Instagram</span>
          </a>

          {/* TikTok */}
          <a
            href={activeContact.socialMedia?.tiktok || CONTACT_INFO.socialMedia.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
            <span className="truncate">TikTok</span>
          </a>
        </div>
      </div>
    </section>
  );
};
