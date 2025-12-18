import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { StoredSettings, OpenAIModel, DataCategory } from '@wrapp0r/shared';

const STORAGE_KEY = 'wrapp0r-settings';

const DEFAULT_SETTINGS: StoredSettings = {
  apiKey: undefined,
  model: 'gpt-4o',
  preferredCategory: undefined,
  darkMode: false,
};

interface SettingsContextValue {
  settings: StoredSettings;
  isLoaded: boolean;
  hasApiKey: boolean;
  setApiKey: (apiKey: string | undefined) => void;
  setModel: (model: OpenAIModel) => void;
  setPreferredCategory: (category: DataCategory | undefined) => void;
  clearSettings: () => void;
  saveSettings: (newSettings: Partial<StoredSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // Invalid JSON, use defaults
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = useCallback((newSettings: Partial<StoredSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage full or unavailable
      }
      return updated;
    });
  }, []);

  const setApiKey = useCallback(
    (apiKey: string | undefined) => saveSettings({ apiKey }),
    [saveSettings]
  );

  const setModel = useCallback(
    (model: OpenAIModel) => saveSettings({ model }),
    [saveSettings]
  );

  const setPreferredCategory = useCallback(
    (preferredCategory: DataCategory | undefined) =>
      saveSettings({ preferredCategory }),
    [saveSettings]
  );

  const clearSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const hasApiKey = Boolean(settings.apiKey);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoaded,
        hasApiKey,
        setApiKey,
        setModel,
        setPreferredCategory,
        clearSettings,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
