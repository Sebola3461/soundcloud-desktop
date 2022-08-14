const { app, BrowserWindow, dialog } = require("electron");
const { readFileSync, unlinkSync, readdirSync } = require("fs");
const { default: axios } = require("axios");
const download = require("download");
const path = require("path");

function createWindow() {
  try {
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
        readFileSync(__dirname + "/rpc/rpc_client.js", "utf8")
      );
    });

    win.webContents.addListener("will-redirect", () => {
      try {
        if (RPC) return;

        win.webContents.executeJavaScript(
          readFileSync(__dirname + "/rpc/rpc_client.js", "utf8")
        );
      } catch (e) {
        console.error(e);
      }
    });

    const package = readFileSync(__dirname + "/package.json");
    process.env.APP_VERSION = JSON.parse(package).version;

    checkUpdates();

    win.setMenuBarVisibility(false);
  } catch (e) {
    console.log(e);
  }
}

async function checkUpdates() {
  const server_package = await await axios(
    "https://raw.githubusercontent.com/Sebola3461/soundcloud-desktop/main/package.json"
  );
  const server_version = server_package.data.version;

  if (process.env.APP_VERSION != server_version) installUpdate();

  async function installUpdate() {
    if (
      dialog.showMessageBoxSync({
        message: "New version detected! Want to update?",
        buttons: ["Yes", "No"],
      }) == 0
    ) {
      dialog.showMessageBoxSync({
        message:
          "A new version is being downloaded! The program will restart after the download is completed.",
      });

      readdirSync(path.resolve(__dirname + `/updater`)).forEach((file) => {
        unlinkSync(path.resolve(__dirname + `/updater/${file}`));
      });

      await download(
        `https://github.com/Sebola3461/soundcloud-desktop/releases/download/Beta/soundcloud-desktop.Setup.${server_version}.exe`,
        path.resolve(__dirname + "/updater"),
        {
          filename: "install.exe",
        }
      );

      console.log("Downloaded!");

      const terminal = require("child_process").spawn(`updater/install.exe`);

      terminal.on("error", (err) => {
        console.error(err);
        dialog.showErrorBox("Something is wrong", err.message);
      });

      terminal.on("message", (err) => {
        console.error(err);
        dialog.showErrorBox("Updater", err);
      });

      terminal.on("close", () => {
        app.exit();
      });
    }
  }
}

app.whenReady().then(createWindow);
