// Modules to control application life and create native browser window
const { app, BrowserWindow, desktopCapturer, screen } = require("electron");

const path = require("path");
var mainWindow = null;
let mouseProcess = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    transparent: true,
  });

  // mainWindow.loadURL("http://browserify.org") // transparent background
  // mainWindow.setBackgroundColor("#56cc5b10"); // turns opaque brown

  desktopCapturer.getSources({ types: ["screen"] }).then(async (sources) => {
    for (const source of sources) {
      if (source.name === "Entire screen") {
        mainWindow.webContents.send("SET_SOURCE", source.id);
        return;
      }
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  mouseProcess = setInterval(printMousePos, 10);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // We cannot require the screen module until the app is ready.

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  clearInterval(mouseProcess);
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function printMousePos() {
  var mousePos = screen.getCursorScreenPoint();
  mainWindow.webContents.send("MOUSE_POS", mousePos);
}
