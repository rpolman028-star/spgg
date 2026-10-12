import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DistributionPortions } from './components/DistributionPortions';
import { FoodDocumentation } from './components/FoodDocumentation';
import { MenuComposition } from './components/MenuComposition';
import { NutritionInformation } from './components/NutritionInformation';
import { SafeConsumptionTime } from './components/SafeConsumptionTime';
import { WarningBanner } from './components/WarningBanner';
import { SatisfactionRating } from './components/SatisfactionRating';
import { ComplaintAndContact } from './components/ComplaintAndContact';
import { ComplaintModal } from './components/ComplaintModal';
import { AdminMenuEditorModal } from './components/AdminMenuEditorModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import { DEFAULT_MENU } from './data/menuData';
import { DailyMenuData, MenuItem } from './types';
import { getInitialLocalMenu, loadActiveMenu, persistMenuData, resetMenuData } from './utils/storage';

const ADMIN_AUTH_KEY = 'mbg_admin_logged_in';

export default function App() {
  const [currentMenu, setCurrentMenu] = useState<DailyMenuData>(() => getInitialLocalMenu());

  // Admin authentication state - defaults to false so public visitors see view-only portal
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_AUTH_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'info' | 'distribusi' | 'sekolah' | 'foto' | 'komposisi' | 'gizi' | 'waktu' | 'kontak'>('info');

  // Load the active menu from Server or IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    loadActiveMenu().then((loadedMenu) => {
      if (isMounted && loadedMenu) {
        setCurrentMenu(loadedMenu);
      }
    });

    // Check if admin login requested via URL (?admin=login or ?admin=1)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'login' || params.get('admin') === '1') {
        setIsLoginModalOpen(true);
      }
    } catch {
      // ignore
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {
      // ignore
    }
  };

  // Save menu across Server API, IndexedDB, and LocalStorage
  const handleSaveMenu = async (newMenu: DailyMenuData) => {
    // 1. Immediate UI update for instant feedback
    setCurrentMenu(newMenu);

    try {
      // 2. Persist to Server + IndexedDB + LocalStorage
      const { menu: savedResult } = await persistMenuData(newMenu);
      // If server generated a permanent static URL (/uploads/...), update state with it
      if (savedResult && savedResult.dishImage !== newMenu.dishImage) {
        setCurrentMenu(savedResult);
      }
    } catch (err) {
      console.error('Error persisting menu data:', err);
    }
  };

  const handleResetMenu = async () => {
    setCurrentMenu(DEFAULT_MENU);
    await resetMenuData();
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 py-3 sm:py-6 px-3 sm:px-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Centered mobile-optimized container, matching the official portal layout */}
      <main className="max-w-md sm:max-w-xl mx-auto space-y-3 sm:space-y-3.5 print:space-y-4">
        {/* Header with BGN Emblem, Title, & Action Buttons */}
        <Header
          currentMenu={currentMenu}
          onSelectDate={(menu) => {
            // If selecting the active date, keep current edited state
            if (menu.dateKey === currentMenu.dateKey) {
              return;
            }
            setCurrentMenu(menu);
          }}
          isAdmin={isAdmin}
          onOpenAdminModal={() => {
            setAdminInitialTab('info');
            setIsAdminModalOpen(true);
          }}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogoutAdmin={handleLogoutAdmin}
        />

        {/* Section 1: Jumlah Distribusi Porsi Harian */}
        <DistributionPortions
          data={currentMenu}
          isAdmin={isAdmin}
          onOpenEditSchools={() => {
            setAdminInitialTab('sekolah');
            setIsAdminModalOpen(true);
          }}
        />

        {/* Section 2: Dokumentasi Sajian Makanan */}
        <FoodDocumentation data={currentMenu} />

        {/* Section 3: Daftar Komposisi Menu (5 Item bernomor) */}
        <MenuComposition
          data={currentMenu}
          selectedItem={selectedMenuItem}
          onSelectItem={(item) => setSelectedMenuItem(item)}
        />

        {/* Section 4: Informasi Nilai Gizi (Porsi Besar, Porsi Kecil, Porsi Balita, Porsi Busui/Bumil) */}
        <NutritionInformation data={currentMenu} />

        {/* Section 5: Batas Aman Waktu Konsumsi Makanan (09.00, 10.00, 13.00) */}
        <SafeConsumptionTime data={currentMenu} />

        {/* Section 6: Larangan Membawa Pulang Makanan MBG */}
        <WarningBanner />

        {/* Section 7: Rating & Ulasan Kepuasan Siswa / Wali Murid */}
        <SatisfactionRating targetSchools={currentMenu.targetSchools} />

        {/* Section 8: Kotak Aduan & Layanan Informasi */}
        <ComplaintAndContact
          onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
          contactInfo={currentMenu.contactInfo}
          isAdmin={isAdmin}
          onOpenEditContact={() => {
            setAdminInitialTab('kontak');
            setIsAdminModalOpen(true);
          }}
        />

        {/* Footer */}
        <Footer
          isAdmin={isAdmin}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogoutAdmin={handleLogoutAdmin}
        />
      </main>

      {/* Interactive Admin / Edit Menu Modal */}
      {isAdminModalOpen && (
        <AdminMenuEditorModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          currentMenu={currentMenu}
          onSaveMenu={handleSaveMenu}
          onResetMenu={handleResetMenu}
          initialTab={adminInitialTab}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Interactive Complaint Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        targetSchools={currentMenu.targetSchools}
      />

      {/* Background Music Player with Switchable Playlist */}
      <MusicPlayer />
    </div>
  );
}
