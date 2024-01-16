import { app, BrowserWindow, shell, ipcMain, IpcMainEvent } from "electron";
import { release } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { update } from "./update";
import { closePort, getPorts, openPort } from "../functions/serialportSetup";
import { setupReconnectListener } from "../functions/reconnectListener";
import { logUserConnect } from "../functions/userConnectedWebhook";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

let window: BrowserWindow | null = null;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

logUserConnect();

// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.mjs");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createWindow() {
  window = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (url) {
    // electron-vite-vue#298
    window.loadURL(url);
    // Open devTool if the app is not packaged
    window.webContents.openDevTools();
  } else {
    window.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  window.webContents.on("did-finish-load", () => {
    window?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
    getPorts(window);
  });

  // Make all links open with the browser, not with the application
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(window);
  setupReconnectListener();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  window = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (window) {
    // Focus on the main window if the user tried to open another
    if (window.isMinimized()) window.restore();
    window.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

ipcMain.on("activatePort", (event: IpcMainEvent, path: any) => {
  console.log(path);
  openPort(path, window);
});

ipcMain.on("closePort", (event: IpcMainEvent, path: any) => {
  closePort();
});

ipcMain.on("getPorts", () => getPorts(window));

app.on("ready", () => getPorts(window));
