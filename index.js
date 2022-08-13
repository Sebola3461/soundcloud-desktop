const { app, BrowserWindow } = require("electron");
const { readFileSync } = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Soundcloud desktop",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadURL("https://soundcloud.com");

  win.webContents.addListener("dom-ready", () => {
    win.webContents.executeJavaScript(
      readFileSync(__dirname + "/script.user.js", "utf8")
    );
  });

  win.webContents.addListener("will-redirect", () => {
    win.webContents.executeJavaScript(
      readFileSync(__dirname + "/script.user.js", "utf8")
    );
  });

  win.webContents.on("ipc-message-sync", (m) => {});

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
