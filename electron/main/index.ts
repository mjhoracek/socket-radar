import { app, BrowserWindow, shell, ipcMain, IpcMainEvent } from "electron";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { release } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { update } from "./update";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SERIAL_PORT = "COM3"; // Update with your COM port
const BAUD_RATE = 9600; // Set to your device's baud rate

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

let openPortStatus: string = "";

let window: BrowserWindow | null = null;

const serialPortSettings = {
  path: SERIAL_PORT,
  autoOpen: false,
  baudRate: BAUD_RATE,
  dataBits: 8,
  stopBits: 1,
};

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let port: SerialPort | null = null;
let parser: ReadlineParser | null = null;

function openPort(path: string) {
  if (port) {
    port.close((err) => {
      if (err) {
        console.error("Error closing port:", err);
      }
    });
  }

  port = new SerialPort({ ...serialPortSettings, path } as any);

  port.open(function (err: any) {
    if (err) {
      window?.webContents.send("error", err.message);
      if (err.message === "Port is already open") {
        openPortStatus = "alreadyOpen";
        return;
      }
    } else {
      console.log("Port opened!");
    }
  });

  parser = port.pipe(new ReadlineParser({ delimiter: "\r" }));

  parser.on("data", function (data: any) {
    console.log("Data:", data);
    window?.webContents.send("error", "Port Open");
    // Send data to the renderer process
    if (window) {
      window.webContents.send("ping", data);
    }
  });
}

ipcMain.on("reconnect", () => {
  console.log("reconnect called");
  getPorts();
});

// ipcMain.on("getPorts", () => {
//   console.log("getPorts called");
//   SerialPort.list()
//     .then((ports) => {
//       console.log("Serial ports:", ports);
//       window?.webContents.send("ports", ports);
//     })
//     .catch((error) => {
//       console.error("Error listing serial ports:", error);
//     });
// });

// if (port) {
//   const parser = port.pipe(new ReadlineParser({ delimiter: "\r" }));

//   parser.on("data", function (data: any) {
//     console.log("Data:", data);
//     window?.webContents.send("error", "Port Open");
//     // Send data to the renderer process
//     if (window) {
//       window.webContents.send("ping", data);
//     }
//   });
// }

// Error handling
// port.on("error", (err: any) => {
//   console.error(`Error: ${err.message}`);
//   window?.webContents.send("error", err.message);
// });

const retryInterval = 1000; // 1 second
let shouldRetry = true;

// function retryOpenPort() {
//   if (shouldRetry === false) {
//     console.log("no need to retry::::::");
//     return;
//   }

//   setTimeout(() => {
//     // openPort();
//     console.log("openPortstatus?", openPortStatus);
//     if (openPortStatus === "alreadyOpen") {
//       shouldRetry = false;
//       return;
//     }
//     console.log(`Retrying to open port`);
//     retryOpenPort();
//   }, retryInterval);
// }

// port.on("close", function (err: any) {
//   console.log("Port closed.");
//   window?.webContents.send("error", "Port Closed");
//   if (err.disconnected === true) {
//     // win.webContents.send('ping', 'Gun Disconnected');
//     shouldRetry = true;
//     retryOpenPort();
//   }
// });

const getPorts = () => {
  SerialPort.list()
    .then((ports) => {
      console.log("Serial ports:", ports);
      window?.webContents.send("ports", ports);
    })
    .catch((error) => {
      console.error("Error listing serial ports:", error);
    });
};

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
    getPorts();
  });

  // Make all links open with the browser, not with the application
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(window);
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

ipcMain.on("reconnect", (event: IpcMainEvent, message: any) => {
  console.log(message);
  // openPort();
});

ipcMain.on("activatePort", (event: IpcMainEvent, message: any) => {
  console.log(message);
  openPort(message);
});

app.on("ready", () => getPorts());
