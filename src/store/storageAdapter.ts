/**
 * Telegram CloudStorage and LocalStorage Bridge
 * Transparently stores keys across Telegram clients when available,
 * falling back to HTML5 localStorage.
 */

export const storageAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const cloud = window.Telegram?.WebApp?.CloudStorage;
    if (cloud) {
      return new Promise<string | null>((resolve) => {
        try {
          cloud.getItem(key, (err, value) => {
            if (!err && value) {
              resolve(value);
            } else {
              // Fallback to local storage if key not found in cloud
              resolve(window.localStorage.getItem(key));
            }
          });
        } catch {
          resolve(window.localStorage.getItem(key));
        }
      });
    }

    return window.localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    // Always mirror in localStorage for immediate sync & offline availability
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage setItem warning:', e);
    }

    const cloud = window.Telegram?.WebApp?.CloudStorage;
    if (cloud) {
      return new Promise<void>((resolve) => {
        try {
          cloud.setItem(key, value, (err) => {
            if (err) {
              console.warn('Telegram CloudStorage setItem error:', err);
            }
            resolve();
          });
        } catch {
          resolve();
        }
      });
    }
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
    } catch {}

    const cloud = window.Telegram?.WebApp?.CloudStorage;
    if (cloud) {
      return new Promise<void>((resolve) => {
        try {
          cloud.removeItem(key, () => resolve());
        } catch {
          resolve();
        }
      });
    }
  },
};
