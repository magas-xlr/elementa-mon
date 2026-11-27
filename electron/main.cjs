// Windows / Steam build: a thin Electron shell around the same web build (dist/).
const path = require('node:path');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

// The Steam overlay draws on top of the GPU surface; these switches keep it working in Electron.
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('disable-direct-composition');

/**
 * Steamworks is optional: install `steamworks.js` and set STEAM_APP_ID (or ship steam_appid.txt)
 * to enable achievements and the overlay. Without it the game runs as a normal desktop app.
 */
let steam = null;
function initSteam() {
  const appId = Number(process.env.STEAM_APP_ID || 0);
  if (!appId) return;
  try {
    const steamworks = require('steamworks.js');
    steam = steamworks.init(appId);
    steamworks.electronEnableSteamOverlay();
  } catch (err) {
    console.warn('Steamworks indisponível, seguindo sem Steam:', err.message);
    steam = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: '#120f1f',
    title: 'Elementa-Mon',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });
  win.once('ready-to-show', () => win.show());
  // Block navigation away from the game and new windows.
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Smoke test (CI / dev): ELEMENTAMON_SMOKE=out.png saves a screenshot after startup and quits.
  const smoke = process.env.ELEMENTAMON_SMOKE;
  if (smoke) {
    win.webContents.on('console-message', (details) => console.log('[jogo]', details.message));
    win.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        const image = await win.webContents.capturePage();
        require('node:fs').writeFileSync(smoke, image.toPNG());
        app.quit();
      }, 4000);
    });
  }
  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  initSteam();
  const win = createWindow();

  ipcMain.on('desktop:quit', () => app.quit());
  ipcMain.on('desktop:fullscreen', (_e, on) => win.setFullScreen(Boolean(on)));
  ipcMain.on('desktop:achievement', (_e, id) => {
    if (steam && typeof id === 'string') {
      try {
        steam.achievement.activate(id);
      } catch (err) {
        console.warn('Falha ao liberar conquista', id, err.message);
      }
    }
  });
});

app.on('window-all-closed', () => app.quit());
