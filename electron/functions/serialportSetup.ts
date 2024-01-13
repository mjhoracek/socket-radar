import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { BrowserWindow } from "electron";

let port: SerialPort | null = null;
let parser: ReadlineParser | null = null;

const SERIAL_PORT = "COM3"; // Update with your COM port
const BAUD_RATE = 9600; // Set to your device's baud rate

let window: BrowserWindow | null = null;
let openPortStatus: string = "";
const retryInterval = 1000; // 1 second
let shouldRetry = true;

const serialPortSettings = {
  path: SERIAL_PORT,
  autoOpen: false,
  baudRate: BAUD_RATE,
  dataBits: 8,
  stopBits: 1,
};

export function openPort(path: string, window: BrowserWindow | null) {
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
    if (window && !window.isDestroyed()) {
      //TODO: dont use the error channel here
      window.webContents.send("error", "Port Open");
      // Send data to the renderer process
      window.webContents.send("ping", data);
    }
  });

  port?.on("error", (err: any) => {
    console.error(`Error: ${err.message}`);
    window?.webContents.send("error", err.message);
  });

  function retryOpenPort() {
    if (shouldRetry === false) {
      console.log("no need to retry::::::");
      return;
    }

    setTimeout(() => {
      // openPort();
      console.log("openPortstatus?", openPortStatus);
      if (openPortStatus === "alreadyOpen") {
        shouldRetry = false;
        return;
      }
      console.log(`Retrying to open port`);
      retryOpenPort();
    }, retryInterval);
  }

  port.on("close", function (err: any) {
    console.log("Port closed.");
    window?.webContents.send("error", "Port Closed");
    if (err.disconnected === true) {
      // win.webContents.send('ping', 'Gun Disconnected');
      shouldRetry = true;
      retryOpenPort();
    }
  });
}

export const getPorts = (window: BrowserWindow | null) => {
  console.log("running get ports");
  SerialPort.list()
    .then((ports) => {
      console.log("Serial ports:", ports);
      window?.webContents.send("ports", ports);
    })
    .catch((error) => {
      console.error("Error listing serial ports:", error);
    });
};
