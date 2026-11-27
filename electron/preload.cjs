// Exposes a tiny, explicit API to the game page (no Node access in the renderer).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  quit: () => ipcRenderer.send('desktop:quit'),
  setFullscreen: (on) => ipcRenderer.send('desktop:fullscreen', Boolean(on)),
  unlockAchievement: (id) => ipcRenderer.send('desktop:achievement', String(id)),
});
