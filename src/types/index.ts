export interface MenuItem {
  id: number;
  name: string;
  category: 'Karbohidrat' | 'Protein Hewani' | 'Protein Nabati' | 'Sayuran & Serat' | 'Buah & Vitamin';
  portionGrams: string;
  description: string;
  caloriesApprox: number;
  allergens?: string;
}

export interface NutrientValues {
  energi: number; // Kcal
  protein: number; // g
  lemak: number; // g
  karbohidrat: number; // g
  serat: number; // g
}

export interface PortionNutrition {
  id: string;
  label: string;
  portionCountLabel?: string;
  badgeColor: string;
  nutrients: NutrientValues;
}

export interface SafeTimeRule {
  targetGroup: string;
  deadlineTime: string; // e.g. "09.00"
  unit: string;
  notes: string;
}

export interface ContactInfo {
  websiteUrl: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  address?: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
}

export interface TargetSchool {
  name: string;
  count: number;
  grade: string;
  time: string;
}

export interface DailyDistributionHistoryItem {
  dateKey: string;
  dayLabel: string;
  total: number;
  porsiBesar: number;
  porsiKecil: number;
  porsiBalita: number;
  status: 'Tervalidasi' | 'Dalam Proses' | 'Terjadwal';
  notes?: string;
}

export interface DailyMenuData {
  dateKey: string; // e.g. "2026-09-24"
  dateFormatted: string; // "Kamis, 24 September 2026"
  sppgUnit: string;
  distribution: {
    total: number;
    porsiKecil: number;
    porsiBesar: number;
    balitaCount?: number;
    bumilBusuiCount?: number;
    validationStatus: string;
  };
  distributionHistory?: DailyDistributionHistoryItem[];
  menuItems: MenuItem[];
  nutritionData: PortionNutrition[];
  safeTimes: SafeTimeRule[];
  targetSchools?: TargetSchool[];
  dishImage: string;
  chefNote?: string;
  contactInfo?: ContactInfo;
}

export interface ComplaintSubmission {
  id: string;
  ticketNumber: string;
  fullName: string;
  phoneNumber: string;
  role: 'Siswa' | 'Guru / Sekolah' | 'Orang Tua' | 'Masyarakat Umum' | 'Petugas Posyandu';
  schoolName: string;
  category: 'Kualitas Rasa' | 'Porsi Kurang' | 'Keterlambatan Distribusi' | 'Kemasan Rusak' | 'Kebersihan Makanan' | 'Saran / Pertanyaan';
  description: string;
  createdAt: string;
  status: 'Diterima' | 'Diproses' | 'Selesai';
}

export interface ReviewSubmission {
  id: string;
  rating: number; // 1 to 5
  role: 'Siswa' | 'Wali Murid' | 'Guru / Sekolah' | 'Masyarakat Umum';
  schoolName: string;
  name?: string;
  tags: string[];
  comment: string;
  createdAt: string;
  likes: number;
}

