import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer
const electronAPI = {
  // App info
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  getPlatform: (): Promise<{
    platform: NodeJS.Platform;
    arch: string;
    isPackaged: boolean;
  }> => ipcRenderer.invoke('get-platform'),

  // Persistent storage
  store: {
    get: (key: string): Promise<unknown> => ipcRenderer.invoke('store-get', key),
    set: (key: string, value: unknown): Promise<boolean> =>
      ipcRenderer.invoke('store-set', key, value),
    delete: (key: string): Promise<boolean> => ipcRenderer.invoke('store-delete', key),
  },

  // File dialogs
  showSaveDialog: (
    options: Electron.SaveDialogOptions
  ): Promise<Electron.SaveDialogReturnValue> =>
    ipcRenderer.invoke('show-save-dialog', options),

  showOpenDialog: (
    options: Electron.OpenDialogOptions
  ): Promise<Electron.OpenDialogReturnValue> =>
    ipcRenderer.invoke('show-open-dialog', options),

  // File operations
  readFile: (
    filePath: string
  ): Promise<{ success: boolean; data?: string; error?: string }> =>
    ipcRenderer.invoke('read-file', filePath),

  writeFile: (
    filePath: string,
    data: string
  ): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('write-file', filePath, data),

  // Event listeners
  onFileOpened: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, filePath: string) => {
      callback(filePath);
    };
    ipcRenderer.on('file-opened', handler);
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('file-opened', handler);
    };
  },

  // Check if running in Electron
  isElectron: true,
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
