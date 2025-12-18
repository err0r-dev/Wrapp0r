import { useCallback, useEffect, useState } from 'react';

// Platform types (subset of NodeJS.Platform)
type Platform = 'aix' | 'android' | 'darwin' | 'freebsd' | 'haiku' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd';

// Type definition for the Electron API exposed via preload
interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<{
    platform: Platform;
    arch: string;
    isPackaged: boolean;
  }>;
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
  };
  showSaveDialog: (options: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{ canceled: boolean; filePath?: string }>;
  showOpenDialog: (options: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
    properties?: ('openFile' | 'openDirectory' | 'multiSelections')[];
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
  onFileOpened: (callback: (filePath: string) => void) => () => void;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

interface UseElectronReturn {
  isElectron: boolean;
  isReady: boolean;
  appVersion: string | null;
  platform: {
    platform: string;
    arch: string;
    isPackaged: boolean;
  } | null;
  // File operations
  saveFile: (
    data: Blob,
    defaultName: string,
    filters?: { name: string; extensions: string[] }[]
  ) => Promise<boolean>;
  openFile: (
    filters?: { name: string; extensions: string[] }[]
  ) => Promise<{ data: ArrayBuffer; path: string } | null>;
  // Store operations
  getStoreValue: <T>(key: string) => Promise<T | null>;
  setStoreValue: (key: string, value: unknown) => Promise<boolean>;
  deleteStoreValue: (key: string) => Promise<boolean>;
}

export function useElectron(): UseElectronReturn {
  const [isReady, setIsReady] = useState(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [platform, setPlatform] = useState<UseElectronReturn['platform']>(null);

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

  // Initialize on mount
  useEffect(() => {
    async function init() {
      if (!isElectron || !window.electronAPI) {
        setIsReady(true);
        return;
      }

      try {
        const [version, platformInfo] = await Promise.all([
          window.electronAPI.getAppVersion(),
          window.electronAPI.getPlatform(),
        ]);

        setAppVersion(version);
        setPlatform(platformInfo);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Electron API:', error);
        setIsReady(true);
      }
    }

    init();
  }, [isElectron]);

  // Save file using native dialog
  const saveFile = useCallback(
    async (
      data: Blob,
      defaultName: string,
      filters: { name: string; extensions: string[] }[] = [{ name: 'All Files', extensions: ['*'] }]
    ): Promise<boolean> => {
      if (!isElectron || !window.electronAPI) {
        // Fallback to browser download
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
      }

      try {
        const result = await window.electronAPI.showSaveDialog({
          title: 'Save File',
          defaultPath: defaultName,
          filters,
        });

        if (result.canceled || !result.filePath) {
          return false;
        }

        // Convert blob to base64
        const arrayBuffer = await data.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const writeResult = await window.electronAPI.writeFile(result.filePath, base64);
        return writeResult.success;
      } catch (error) {
        console.error('Failed to save file:', error);
        return false;
      }
    },
    [isElectron]
  );

  // Open file using native dialog
  const openFile = useCallback(
    async (
      filters: { name: string; extensions: string[] }[] = [{ name: 'All Files', extensions: ['*'] }]
    ): Promise<{ data: ArrayBuffer; path: string } | null> => {
      if (!isElectron || !window.electronAPI) {
        // Fallback to browser file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = filters.map((f) => f.extensions.map((e) => `.${e}`).join(',')).join(',');

          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              const data = await file.arrayBuffer();
              resolve({ data, path: file.name });
            } else {
              resolve(null);
            }
          };

          input.click();
        });
      }

      try {
        const result = await window.electronAPI.showOpenDialog({
          title: 'Open File',
          filters,
          properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return null;
        }

        const filePath = result.filePaths[0];
        const readResult = await window.electronAPI.readFile(filePath);

        if (!readResult.success || !readResult.data) {
          console.error('Failed to read file:', readResult.error);
          return null;
        }

        // Convert base64 to ArrayBuffer
        const binary = atob(readResult.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        return { data: bytes.buffer, path: filePath };
      } catch (error) {
        console.error('Failed to open file:', error);
        return null;
      }
    },
    [isElectron]
  );

  // Store operations
  const getStoreValue = useCallback(
    async <T>(key: string): Promise<T | null> => {
      if (!isElectron || !window.electronAPI) {
        // Fallback to localStorage
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }

      try {
        const value = await window.electronAPI.store.get(key);
        return value as T | null;
      } catch (error) {
        console.error('Failed to get store value:', error);
        return null;
      }
    },
    [isElectron]
  );

  const setStoreValue = useCallback(
    async (key: string, value: unknown): Promise<boolean> => {
      if (!isElectron || !window.electronAPI) {
        // Fallback to localStorage
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      }

      try {
        return await window.electronAPI.store.set(key, value);
      } catch (error) {
        console.error('Failed to set store value:', error);
        return false;
      }
    },
    [isElectron]
  );

  const deleteStoreValue = useCallback(
    async (key: string): Promise<boolean> => {
      if (!isElectron || !window.electronAPI) {
        // Fallback to localStorage
        localStorage.removeItem(key);
        return true;
      }

      try {
        return await window.electronAPI.store.delete(key);
      } catch (error) {
        console.error('Failed to delete store value:', error);
        return false;
      }
    },
    [isElectron]
  );

  return {
    isElectron,
    isReady,
    appVersion,
    platform,
    saveFile,
    openFile,
    getStoreValue,
    setStoreValue,
    deleteStoreValue,
  };
}
