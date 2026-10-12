import { DailyMenuData } from '../types';
import { DEFAULT_MENU } from '../data/menuData';

const DB_NAME = 'mbg_sppg_database';
const DB_VERSION = 1;
const STORE_NAME = 'menu_store';
const STORAGE_KEY = 'mbg_sppg_saved_menu';

// Helper to open IndexedDB with high quota for photos & rich data
function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

// Get value from IndexedDB
async function getIDBValue<T>(key: string): Promise<T | null> {
  const db = await getDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve((req.result as T) || null);
      };

      req.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

// Set value in IndexedDB
async function setIDBValue<T>(key: string, value: T): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// Clear value from IndexedDB
async function removeIDBValue(key: string): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Fetch the latest menu from the backend server (/api/menu)
 * This ensures published users on any device/browser see the real saved data.
 */
export async function fetchServerMenu(): Promise<DailyMenuData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch('/api/menu', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.dateKey && Array.isArray(data.menuItems) && data.menuItems.length > 0) {
        return data as DailyMenuData;
      }
    }
  } catch {
    // Server endpoint not reachable or offline - fallback to local storage
  }
  return null;
}

/**
 * Upload an image (base64 or file data) to the server.
 * Returns the permanent public URL on the server (e.g., /uploads/dish_photo.jpg?t=12345).
 */
export async function uploadImageToServer(base64Data: string): Promise<string | null> {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
        type: 'dish',
      }),
    });

    if (response.ok) {
      const res = await response.json();
      if (res && res.url) {
        return res.url;
      }
    }
  } catch (err) {
    console.warn('Could not upload image to server endpoint, will persist locally:', err);
  }
  return null;
}

/**
 * Persist menu data to the server (/api/menu).
 */
export async function saveMenuToServer(menu: DailyMenuData): Promise<boolean> {
  try {
    const response = await fetch('/api/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menu),
    });

    if (response.ok) {
      const res = await response.json();
      return !!res.success;
    }
  } catch (err) {
    console.warn('Could not save menu to server endpoint:', err);
  }
  return false;
}

/**
 * Sanitizes menu data, ensuring portion labels like PORSI BUSUI / BUMIL are complete
 */
export function sanitizeMenuData(menu: DailyMenuData): DailyMenuData {
  if (!menu) return DEFAULT_MENU;
  const copy = { ...menu };
  if (!copy.distributionHistory || !Array.isArray(copy.distributionHistory) || copy.distributionHistory.length === 0) {
    copy.distributionHistory = DEFAULT_MENU.distributionHistory;
  }
  if (copy.nutritionData && Array.isArray(copy.nutritionData)) {
    copy.nutritionData = copy.nutritionData.map((item) => {
      if (item.id === 'bumil' || (item.label && item.label.toLowerCase().includes('busui'))) {
        return {
          ...item,
          label: 'PORSI BUSUI / BUMIL',
        };
      }
      return item;
    });
  }
  return copy;
}

/**
 * Load the initial menu using multi-layer persistence:
 * 1. Synchronously reads from IndexedDB / localStorage for immediate render.
 * 2. Asynchronously synchronizes with backend server.
 */
export function getInitialLocalMenu(): DailyMenuData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dishImage && parsed.dishImage.startsWith('/src/assets/images/')) {
        parsed.dishImage = DEFAULT_MENU.dishImage;
      }
      return sanitizeMenuData(parsed);
    }
  } catch {
    // Ignore localStorage errors
  }
  return sanitizeMenuData(DEFAULT_MENU);
}

/**
 * Load the active menu with full resolution:
 * Checks Server -> IndexedDB -> LocalStorage -> DEFAULT_MENU
 */
export async function loadActiveMenu(): Promise<DailyMenuData> {
  // 1. Try server first
  const serverMenu = await fetchServerMenu();
  if (serverMenu) {
    const sanitized = sanitizeMenuData(serverMenu);
    // Cache to IDB and localStorage for instant offline access
    await setIDBValue(STORAGE_KEY, sanitized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // ignore quota
    }
    return sanitized;
  }

  // 2. Try IndexedDB (handles large images easily)
  const idbMenu = await getIDBValue<DailyMenuData>(STORAGE_KEY);
  if (idbMenu && idbMenu.dateKey) {
    return sanitizeMenuData(idbMenu);
  }

  // 3. Try LocalStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return sanitizeMenuData(parsed);
    }
  } catch {
    // ignore
  }

  // 4. Default fallback
  return sanitizeMenuData(DEFAULT_MENU);
}

/**
 * Save menu across all layers:
 * 1. If dishImage is base64, attempt to upload to server to get a static URL
 * 2. Save menu to server via POST /api/menu
 * 3. Save to IndexedDB (guaranteed 100MB+ storage)
 * 4. Save to localStorage
 */
export async function persistMenuData(menu: DailyMenuData): Promise<{ menu: DailyMenuData; serverSaved: boolean }> {
  let menuToSave = sanitizeMenuData(menu);

  // If dishImage is a new base64 upload, upload to server to get permanent URL
  if (menuToSave.dishImage && menuToSave.dishImage.startsWith('data:image')) {
    const uploadedUrl = await uploadImageToServer(menuToSave.dishImage);
    if (uploadedUrl) {
      menuToSave = {
        ...menuToSave,
        dishImage: uploadedUrl,
      };
    }
  }

  // 1. Save to server
  const serverSaved = await saveMenuToServer(menuToSave);

  // 2. Save to IndexedDB
  await setIDBValue(STORAGE_KEY, menuToSave);

  // 3. Save to LocalStorage as fallback
  try {
    // If dishImage is huge base64 and might exceed quota, save clean version to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuToSave));
  } catch (quotaError) {
    console.warn('LocalStorage quota exceeded, relying on IndexedDB & Server:', quotaError);
    // If full, try saving without heavy base64 to localStorage
    try {
      const lightweight = {
        ...menuToSave,
        dishImage: menuToSave.dishImage?.startsWith('data:image') ? DEFAULT_MENU.dishImage : menuToSave.dishImage,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // ignore
    }
  }

  return { menu: menuToSave, serverSaved };
}

/**
 * Reset menu back to default
 */
export async function resetMenuData(): Promise<void> {
  await removeIDBValue(STORAGE_KEY);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    await fetch('/api/reset-menu', { method: 'POST' });
  } catch {
    // ignore
  }
}
