const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs/promises");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // titleBarStyle: 'hidden',
    // titleBarOverlay: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });
  
  // enforce aspect ratio
  mainWindow.setAspectRatio(1);
  
  //mainWindow.webContents.openDevTools();
  
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // create window
  createWindow();

  readFile('./res/user-prefs.json').then((string) => {
    const settings = JSON.parse(string)["settings"];
    registerGlobalShorts(settings["soundShortcuts"]);
  })

  // create window for mac
  app.on("activate", function () {

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});



// Sets global shortcuts, defined in /res/user-prefs.json
function registerGlobalShorts(shortcutData) {
  shortcutData.forEach((shortcut, index) => {
    if (shortcut !== null) {
    globalShortcut.register(shortcut, () => {
      mainWindow.webContents.send('message:toRender', 'play', index);
    });
    }
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// handles invocation requests from renderer
ipcMain.handle('invoke:fromRender', async(event, req) => {
  console.log(req);
  if (req === 'reqFileList') { // return sound data
    const soundData = JSON.parse(await readFile('./res/soundData.json'));
    return soundData;
  }
  else if (req === 'reqCatList') { // return category data
    const catData = JSON.parse(await readFile('./res/catData.json'));
    return catData
  } else if (req === 'reqHTMLFrags') { // return html frags
    const editBtnHtml = await readFile('./res/frags/editBtn.html');
    const regBtnHtml = await readFile('./res/frags/regBtn.html');
    return (
      [editBtnHtml,
      regBtnHtml]
    );
  } else { // block all other requests
    return 'Unknown Request!';
  }
});

ipcMain.on('message:fromRender', (event, req) => {
  if (req === 'minimize') BrowserWindow.getFocusedWindow().minimize();
});
// reads file, returns string
async function readFile(file) {
 try {
  const string = await fs.readFile(file, { encoding: 'utf8' });
  return string;
 } catch (err) {
  console.log(err);
 }
}

module.exports = {};