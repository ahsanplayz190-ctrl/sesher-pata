import { SiteSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SETTINGS_STORAGE_KEY = 'shesher_pata_site_settings_v1';
const SETTINGS_CHANGED_EVENT = 'shesher_pata_settings_changed';

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default_settings',
  meta_pixel_id: '',
  meta_pixel_enabled: false,
  updated_at: new Date().toISOString(),
};

type SettingsListener = (settings: SiteSettings) => void;
const listeners = new Set<SettingsListener>();

export const settingsService = {
  /**
   * Synchronously get the cached settings (from localStorage if available).
   * Ensures zero latency rendering.
   */
  getCachedSettings(): SiteSettings {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }
    try {
      const item = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      }
    } catch {
      // Ignore localStorage read errors
    }
    return DEFAULT_SETTINGS;
  },

  /**
   * Asynchronously fetch current settings from Supabase if connected,
   * falling back to local storage cache.
   */
  async fetchSettings(): Promise<SiteSettings> {
    const cached = this.getCachedSettings();

    if (!isSupabaseConfigured() || !supabase) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default_settings')
        .maybeSingle();

      if (error) {
        console.warn('[Settings] Supabase fetch error, using cache:', error.message);
        return cached;
      }

      if (data) {
        const settings: SiteSettings = {
          id: data.id || 'default_settings',
          meta_pixel_id: data.meta_pixel_id || '',
          meta_pixel_enabled: Boolean(data.meta_pixel_enabled),
          updated_at: data.updated_at || new Date().toISOString(),
        };
        this.saveToLocalCache(settings);
        this.notifyListeners(settings);
        return settings;
      }
    } catch (err) {
      console.warn('[Settings] Error querying Supabase:', err);
    }

    return cached;
  },

  /**
   * Save settings via secure server-side API (which validates admin session and updates Supabase).
   * Normal unauthorized users will receive a 401 response and cannot alter settings.
   */
  async saveSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = this.getCachedSettings();
    const updatedSettings: SiteSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // 1. Send update to secure server-side admin endpoint
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta_pixel_id: updatedSettings.meta_pixel_id,
          meta_pixel_enabled: updatedSettings.meta_pixel_enabled,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('অননুমোদিত অ্যাক্সেস: শুধুমাত্র অনুমোদিত অ্যাডমিন পিক্সেল সেটিংস পরিবর্তন করতে পারবেন।');
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `সার্ভার ত্রুটি: ${response.statusText}`);
      }

      const resData = await response.json();
      if (resData.settings) {
        Object.assign(updatedSettings, resData.settings);
      }
    } catch (err: any) {
      // If unauthorized, rethrow to alert the user/caller
      if (err.message && err.message.includes('অননুমোদিত')) {
        throw err;
      }
      console.warn('[Settings] Server API failed, falling back to local cache update:', err.message);
    }

    // 2. Update local cache and broadcast
    this.saveToLocalCache(updatedSettings);
    this.notifyListeners(updatedSettings);

    return updatedSettings;
  },

  /**
   * Write to localStorage and dispatch custom window event for inter-tab / component sync.
   */
  saveToLocalCache(settings: SiteSettings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(
        new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: settings })
      );
    } catch (e) {
      console.error('[Settings] Failed to save settings to localStorage:', e);
    }
  },

  /**
   * Register a listener for real-time settings updates.
   */
  subscribe(listener: SettingsListener): () => void {
    listeners.add(listener);

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        listener(customEvent.detail);
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          listener(parsed);
        } catch {
          // Ignore parse errors
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(SETTINGS_CHANGED_EVENT, handleCustomEvent);
      window.addEventListener('storage', handleStorageEvent);
    }

    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') {
        window.removeEventListener(SETTINGS_CHANGED_EVENT, handleCustomEvent);
        window.removeEventListener('storage', handleStorageEvent);
      }
    };
  },

  notifyListeners(settings: SiteSettings) {
    listeners.forEach((fn) => {
      try {
        fn(settings);
      } catch (e) {
        console.error('[Settings] Listener error:', e);
      }
    });
  },
};
