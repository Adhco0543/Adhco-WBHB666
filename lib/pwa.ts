/**
 * Progressive Web App utilities
 * Enables offline support, installability, and service worker integration
 */

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
  screenshots: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
  startUrl: string;
  scope: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'landscape-primary';
  themeColor: string;
  backgroundColor: string;
  categories: string[];
  shortcuts: Array<{
    name: string;
    shortName: string;
    description: string;
    url: string;
    icons: Array<{
      src: string;
      sizes: string;
    }>;
  }>;
}

/**
 * Default PWA configuration for ADHCO
 */
export const DEFAULT_PWA_CONFIG: PWAConfig = {
  name: 'ADHCO - Construction Management',
  shortName: 'ADHCO',
  description: 'All-in-one construction management platform for invoicing, project tracking, and team collaboration',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/maskable-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  screenshots: [
    {
      src: '/screenshots/dashboard.png',
      sizes: '540x720',
      type: 'image/png',
      form_factor: 'narrow',
    },
    {
      src: '/screenshots/dashboard-wide.png',
      sizes: '1280x800',
      type: 'image/png',
      form_factor: 'wide',
    },
  ],
  startUrl: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  themeColor: '#0f172a',
  backgroundColor: '#ffffff',
  categories: ['business', 'productivity'],
  shortcuts: [
    {
      name: 'New Invoice',
      shortName: 'Invoice',
      description: 'Create a new invoice',
      url: '/invoices/new',
      icons: [
        {
          src: '/icons/invoice-96x96.png',
          sizes: '96x96',
        },
      ],
    },
    {
      name: 'New Project',
      shortName: 'Project',
      description: 'Create a new project',
      url: '/projects/new',
      icons: [
        {
          src: '/icons/project-96x96.png',
          sizes: '96x96',
        },
      ],
    },
    {
      name: 'Dashboard',
      shortName: 'Dashboard',
      description: 'View dashboard',
      url: '/dashboard',
      icons: [
        {
          src: '/icons/dashboard-96x96.png',
          sizes: '96x96',
        },
      ],
    },
  ],
};

/**
 * Check if PWA is installable
 */
export function isPWAInstallable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'beforeinstallprompt' in window;
}

/**
 * Check if running as PWA
 */
export function isRunningAsPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.navigator.standalone === true ||
    (window.matchMedia('(display-mode: standalone)').matches) ||
    (window.matchMedia('(display-mode: fullscreen)').matches)
  );
}

/**
 * Request PWA installation
 */
export async function requestPWAInstall(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // @ts-ignore
    const deferredPrompt = window.deferredPrompt;
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    // @ts-ignore
    window.deferredPrompt = null;

    return outcome === 'accepted';
  } catch (error) {
    console.error('Error requesting PWA install:', error);
    return false;
  }
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000);

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    return true;
  } catch (error) {
    console.error('Error unregistering service worker:', error);
    return false;
  }
}

/**
 * Store data for offline use
 */
export async function storeOfflineData(key: string, data: any): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    localStorage.setItem(`offline_${key}`, JSON.stringify(data));
    return;
  }

  try {
    const db = indexedDB.open('adhco-offline', 1);

    return new Promise((resolve, reject) => {
      db.onsuccess = () => {
        const transaction = db.result.transaction(['offline'], 'readwrite');
        const store = transaction.objectStore('offline');
        store.put({ key, data, timestamp: Date.now() });
        resolve();
      };

      db.onerror = () => reject(new Error('IndexedDB error'));
    });
  } catch (error) {
    console.error('Error storing offline data:', error);
    localStorage.setItem(`offline_${key}`, JSON.stringify(data));
  }
}

/**
 * Retrieve offline data
 */
export async function getOfflineData(key: string): Promise<any> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    const data = localStorage.getItem(`offline_${key}`);
    return data ? JSON.parse(data) : null;
  }

  try {
    const db = indexedDB.open('adhco-offline', 1);

    return new Promise((resolve, reject) => {
      db.onsuccess = () => {
        const transaction = db.result.transaction(['offline'], 'readonly');
        const store = transaction.objectStore('offline');
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result?.data);
        };

        request.onerror = () => reject(new Error('IndexedDB error'));
      };

      db.onerror = () => reject(new Error('IndexedDB error'));
    });
  } catch (error) {
    console.error('Error retrieving offline data:', error);
    const data = localStorage.getItem(`offline_${key}`);
    return data ? JSON.parse(data) : null;
  }
}

/**
 * Sync offline changes when back online
 */
export async function syncOfflineChanges(): Promise<void> {
  if (typeof navigator === 'undefined' || !('onLine' in navigator) || !navigator.onLine) {
    console.log('App is offline, skipping sync');
    return;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    // @ts-ignore
    await swRegistration.sync.register('sync-offline-data');
    console.log('Background sync registered');
  } catch (error) {
    console.error('Error registering background sync:', error);
  }
}

/**
 * Listen to online/offline events
 */
export function setupConnectivityListener(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    console.log('App is online');
    onOnline?.();
    syncOfflineChanges();
  };

  const handleOffline = () => {
    console.log('App is offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Check online status
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine ?? true;
}

/**
 * Get storage quota information
 */
export async function getStorageInfo(): Promise<StorageEstimate | null> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) {
    return null;
  }

  try {
    return await navigator.storage.estimate();
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) {
    return false;
  }

  try {
    const persistent = await navigator.storage.persisted();
    if (persistent) return true;

    return await navigator.storage.persist();
  } catch (error) {
    console.error('Error requesting persistent storage:', error);
    return false;
  }
}
