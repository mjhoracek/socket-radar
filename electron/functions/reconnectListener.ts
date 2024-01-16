import { ipcMain } from "electron";

export const setupReconnectListener = () => {
  ipcMain.on("reconnect", () => {
    console.log("reconnect called from here");
  });
};
