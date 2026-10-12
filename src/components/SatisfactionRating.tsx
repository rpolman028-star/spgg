import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  School,
  Heart,
  TrendingUp,
  ChevronDown,
  Send,
  User,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TargetSchool, ReviewSubmission } from '../types';
import { TARGET_SCHOOLS } from '../data/menuData';

const RATING_STORAGE_KEY = 'mbg_satisfaction_reviews_v1';

// Tag pilihan cepat untuk penilaian rasa & penyajian
export const QUICK_TAGS = [
  '🍗 Lauk Gurih & Matang',
  '🥗 Sayur Segar',
  '🍚 Porsi Pas & Kenyang',
  '🍎 Buah Manis & Segar',
  '🍱 Kemasan Higienis & Rapi',
  '🔥 Makanan Hangat',
  '⏱️ Distribusi Tepat Waktu',
  '🧂 Bumbu Pas & Ramah Anak',
];

// Data ulasan awal yang realistis dari siswa & wali murid SPPG Wonomulyo
const INITIAL_REVIEWS: ReviewSubmission[] = [
  {
    id: 'rev-1',
    rating: 5,
    role: 'Wali Murid',
    schoolName: 'SDN 001 Sidodadi Wonomulyo',
    name: 'Ibu Rahmawati (Kelas 3B)',
    tags: ['🍗 Lauk Gurih & Matang', '🍚 Porsi Pas & Kenyang', '🍎 Buah Manis & Segar'],
    comment: 'Alhamdulillah anak saya sangat lahap makannya. Ayamnya empuk dan sayurnya tidak langu, porsinya juga pas sekali untuk anak SD.',
    createdAt: 'Hari ini, 10.15 WITA',
    likes: 18,
  },
  {
    id: 'rev-2',
    rating: 5,
    role: 'Guru / Sekolah',
    schoolName: 'SMP Negeri 1 Wonomulyo',
    name: 'Pak Faisal, S.Pd',
    tags: ['🍱 Kemasan Higienis & Rapi', '⏱️ Distribusi Tepat Waktu', '🔥 Makanan Hangat'],
    comment: 'Pengantaran tiba tepat jam 09.45 sebelum jam istirahat. Kemasan tertutup rapat dan makanan masih hangat saat dibagikan ke siswa.',
    createdAt: 'Hari ini, 09.50 WITA',
    likes: 14,
  },
  {
    id: 'rev-3',
    rating: 5,
    role: 'Siswa',
    schoolName: 'SMA Negeri 1 Wonomulyo',
    name: 'Dimas (Kelas XI)',
    tags: ['🍗 Lauk Gurih & Matang', '🧂 Bumbu Pas & Ramah Anak'],
    comment: 'Enak banget menu hari ini! Lauknya banyak protein, kenyang sampai sore pas kegiatan ekskul sekolah.',
    createdAt: 'Hari ini, 13.20 WITA',
    likes: 9,
  },
  {
    id: 'rev-4',
    rating: 4,
    role: 'Wali Murid',
    schoolName: 'TK Negeri Pembina Wonomulyo',
    name: 'Bunda Aisyah',
    tags: ['🥗 Sayur Segar', '🍱 Kemasan Higienis & Rapi'],
    comment: 'Potongan sayurnya lembut cocok untuk anak balita/TK. Terima kasih tim SPPG atas komitmen gizinya.',
    createdAt: 'Kemarin, 11.00 WITA',
    likes: 7,
  },
];

interface SatisfactionRatingProps {
  targetSchools?: TargetSchool[];
}

export const SatisfactionRating: React.FC<SatisfactionRatingProps> = ({ targetSchools }) => {
  const schools = targetSchools && targetSchools.length > 0 ? targetSchools : TARGET_SCHOOLS;

  const [reviews, setReviews] = useState<ReviewSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(RATING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [role, setRole] = useState<'Siswa' | 'Wali Murid' | 'Guru / Sekolah' | 'Masyarakat Umum'>('Wali Murid');
  const [schoolName, setSchoolName] = useState<string>(schools[0]?.name || 'SDN 001 Sidodadi Wonomulyo');
  const [name, setName] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([QUICK_TAGS[0], QUICK_TAGS[2]]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | '5' | 'Wali Murid' | 'Siswa' | 'Guru / Sekolah'>('all');

  // Save to local storage whenever reviews change
  useEffect(() => {
    try {
      localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    percentage:
      totalReviews > 0
        ? Math.round((reviews.filter((r) => r.rating === s).length / totalReviews) * 100)
        : 0,
  }));

  const ratingDescriptions: Record<number, { text: string; emoji: string }> = {
    1: { text: 'Sangat Kurang', emoji: '😞' },
    2: { text: 'Kurang Pas', emoji: '🙁' },
    3: { text: 'Cukup Baik', emoji: '😐' },
    4: { text: 'Enak & Puas', emoji: '😊' },
    5: { text: 'Sangat Lezat & Bergizi!', emoji: '🤩' },
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newReview: ReviewSubmission = {
      id: `rev-${Date.now()}`,
      rating,
      role,
      schoolName,
      name: name.trim() || `${role} ${schoolName.split(' ')[0] || ''}`,
      tags: selectedTags,
      comment: comment.trim(),
      createdAt: 'Baru saja',
      likes: 1,
    };

    setTimeout(() => {
      setReviews((prev) => [newReview, ...prev]);
      setIsSubmitting(false);
      setHasSubmitted(true);
      setShowForm(false);
      setComment('');

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }, 400);
  };

  const handleLikeReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === '5') return r.rating === 5;
    return r.role === activeFilter;
  });

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 md:p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
              RATING & ULASAN KEPUASAN SISWA / WALI MURID
            </h3>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluasi mutu rasa, kesegaran porsi & pelayanan SPPG hari ini
            </p>
          </div>
        </div>

        {/* Action Button: Beri Penilaian */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            setHasSubmitted(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showForm ? 'Tutup Form' : 'Beri Rating'}</span>
        </button>
      </div>

      {/* RATING SUMMARY CARD (Rating Nilai & Bar Chart) */}
      <div className="rounded-2xl border border-amber-100 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-3.5 sm:p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          {/* Big Score Block */}
          <div className="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left justify-center sm:border-r border-amber-200/60 dark:border-amber-900/50 sm:pr-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {averageRating}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ 5.0</span>
            </div>

            {/* Stars row */}
            <div className="flex items-center gap-1 my-1">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <Star
                  key={starVal}
                  className={`w-4 h-4 ${
                    starVal <= Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Berdasarkan <strong>{totalReviews} ulasan</strong> dari siswa, wali murid & guru.
            </p>
          </div>

          {/* Breakdown Bars */}
          <div className="sm:col-span-7 space-y-1 text-xs">
            {starCounts.map((item) => (
              <div key={item.star} className="flex items-center gap-2 text-[11px]">
                <div className="flex items-center gap-0.5 w-7 shrink-0 text-slate-600 dark:text-slate-300 font-bold">
                  <span>{item.star}</span>
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="w-9 text-right text-[10px] text-slate-400 font-mono">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {hasSubmitted && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Terima kasih atas ulasan & penilaian Anda!</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              Masukan Anda telah diteruskan ke tim pengawas mutu dapur SPPG Wonomulyo Sidodadi.
            </p>
          </div>
        </div>
      )}

      {/* INTERACTIVE FORM INPUT (Beri Penilaian Cepat) */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-4 p-4 rounded-2xl border border-amber-300/80 dark:border-amber-800 bg-amber-50/40 dark:bg-slate-800/80 space-y-3.5 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1 border-b border-amber-200/60 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Formulir Penilaian Rasa & Mutu
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Proses Cepat (1 Menit)</span>
          </div>

          {/* 1. Rating Bintang Interaktif */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-center sm:text-left">
              Pilih Skor Bintang Menu Hari Ini:
            </label>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isFilled = val <= (hoverRating || rating);
                  return (
                    <button
                      key={val}
                      type="button"
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(val)}
                      className="p-1 rounded-lg transition-transform active:scale-90 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 filter drop-shadow-2xs'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Label Deskripsi Rasa */}
              <div className="text-left pl-2">
                <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>{ratingDescriptions[hoverRating || rating].emoji}</span>
                  <span className="leading-tight">{ratingDescriptions[hoverRating || rating].text}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Nilai: {hoverRating || rating} dari 5 bintang</div>
              </div>
            </div>
          </div>

          {/* 2. Pilihan Peran & Sekolah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Peran Anda:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Wali Murid', 'Siswa', 'Guru / Sekolah', 'Masyarakat Umum'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 rounded-xl text-center font-bold text-[11px] transition-colors cursor-pointer ${
                      role === r
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sasaran Sekolah / Unit Terkait:
              </label>
              <div className="relative">
                <select
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium appearance-none pr-8 cursor-pointer text-xs"
                >
                  {schools.map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name} ({s.grade})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. Nama Pengulas (Opsional) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Anda (Opsional, kosongkan jika ingin anonim):
            </label>
            <input
              type="text"
              placeholder="Contoh: Ibu Fatimah / Siswa Kelas 8A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs"
            />
          </div>

          {/* 4. Tag Aspek Penilaian Cepat */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Aspek yang Paling Anda Sukai / Perhatikan (Klik untuk memilih):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-2xs scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Komentar Singkat */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pesan atau Ulasan untuk Juru Masak Dapur SPPG:
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman rasa makanan, tekstur lauk, kesegaran buah, atau saran porsi..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}</span>
            </button>
          </div>
        </form>
      )}

      {/* FILTER TABS & DAFTAR ULASAN */}
      <div className="space-y-3">
        {/* Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ulasan Terbaru ({filteredReviews.length})</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] flex-wrap">
            <span className="text-slate-400 hidden sm:inline">Filter:</span>
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: '5', label: '5 Bintang ⭐' },
                { id: 'Wali Murid', label: 'Wali Murid' },
                { id: 'Siswa', label: 'Siswa' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Review Cards List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs"
            >
              {/* Card Top Row: Name, Role, Rating & Date */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {rev.name || 'Pengulas MBG'}
                    </span>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                      {rev.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <School className="w-3 h-3" />
                    <span>{rev.schoolName}</span>
                    <span>• {rev.createdAt}</span>
                  </div>
                </div>

                {/* Stars in Card */}
                <div className="flex items-center gap-0.5 shrink-0 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                    {rev.rating}.0
                  </span>
                </div>
              </div>

              {/* Tags Badges */}
              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 my-1.5">
                  {rev.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment Content */}
              {rev.comment && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                  "{rev.comment}"
                </p>
              )}

              {/* Card Footer: Like Button */}
              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Ulasan Terverifikasi
                </span>

                <button
                  onClick={() => handleLikeReview(rev.id)}
                  className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700"
                  title="Tandai ulasan ini bermanfaat"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Membantu ({rev.likes})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
