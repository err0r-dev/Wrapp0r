import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

// Type for window settings
interface WindowSettings {
  windowBounds: { width: number; height: number };
  isMaximized: boolean;
}

// Initialize electron store for window settings
const windowStore = new Store<WindowSettings>({
  name: 'wrapp0r-window',
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    isMaximized: false,
  },
});

// Separate store for user settings (flexible schema)
const userStore = new Store({
  name: 'wrapp0r-user',
});

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Get the path to the web app
function getWebAppPath(): string {
  if (isDev) {
    // In development, serve from the web package dist
    return path.join(__dirname, '../../web/dist/index.html');
  }
  // In production, serve from resources
  return path.join(process.resourcesPath, 'app/index.html');
}

function createWindow(): void {
  // Restore window bounds from store
  const { width, height } = windowStore.get('windowBounds');
  const isMaximized = windowStore.get('isMaximized');

  // Create the browser window
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset', // macOS native look
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Maximize if it was maximized before
  if (isMaximized) {
    mainWindow.maximize();
  }

  // Load the web app
  const webAppPath = getWebAppPath();

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    // In development with Vite dev server running
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else if (fs.existsSync(webAppPath)) {
    mainWindow.loadFile(webAppPath);
  } else {
    // Fallback: show error
    mainWindow.loadURL(`data:text/html,<html><body><h1>Error</h1><p>Web app not found at: ${webAppPath}</p></body></html>`);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Save window bounds on resize/move
  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      const { width, height } = mainWindow.getBounds();
      windowStore.set('windowBounds', { width, height });
    }
  });

  mainWindow.on('maximize', () => {
    windowStore.set('isMaximized', true);
  });

  mainWindow.on('unmaximize', () => {
    windowStore.set('isMaximized', false);
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] },
                { name: 'All Files', extensions: ['*'] },
              ],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow?.webContents.send('file-opened', result.filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
            ]
          : [{ role: 'delete' as const }, { type: 'separator' as const }, { role: 'selectAll' as const }]),
      ],
    },
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }, { type: 'separator' as const }, { role: 'window' as const }]
          : [{ role: 'close' as const }]),
      ],
    },
    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/your-username/wrapp0r');
          },
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/your-username/wrapp0r/issues');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
function setupIPC(): void {
  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Get platform info
  ipcMain.handle('get-platform', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      isPackaged: app.isPackaged,
    };
  });

  // Store operations (for user settings)
  ipcMain.handle('store-get', (_event, key: string) => {
    return userStore.get(key);
  });

  ipcMain.handle('store-set', (_event, key: string, value: unknown) => {
    userStore.set(key, value);
    return true;
  });

  ipcMain.handle('store-delete', (_event, key: string) => {
    userStore.delete(key);
    return true;
  });

  // File operations
  ipcMain.handle('show-save-dialog', async (_event, options: Electron.SaveDialogOptions) => {
    const result = await dialog.showSaveDialog(options);
    return result;
  });

  ipcMain.handle('show-open-dialog', async (_event, options: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  // Read file
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    try {
      const data = await fs.promises.readFile(filePath);
      return { success: true, data: data.toString('base64') };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Write file
  ipcMain.handle('write-file', async (_event, filePath: string, data: string) => {
    try {
      const buffer = Buffer.from(data, 'base64');
      await fs.promises.writeFile(filePath, buffer);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  createMenu();
  setupIPC();
  createWindow();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Only allow navigation to our app
    if (parsedUrl.protocol !== 'file:' && !navigationUrl.startsWith('data:')) {
      event.preventDefault();
    }
  });
});
