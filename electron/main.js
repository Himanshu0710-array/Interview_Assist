import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    height: 540,
    transparent: true,    // This makes the window fully transparent!
    frame: false,         // Removes the Windows title bar for a floating look
    alwaysOnTop: true,    // Keeps it above Meet at all times
    maximizable: false,   // Prevents accidental full-screen which blocks all clicks
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // THE MAGIC LINE: This hides the window completely from screen sharing and recording!
  win.setContentProtection(true);

  // Load the Vite dev server directly into the Electron window
  win.loadURL('http://localhost:5173/?pip=true');

  // Allow the window to be dragged around
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
      body, html, #root { 
        background: transparent !important; 
      }
      .pk-panel {
        /* Add a subtle drag handle area to the header */
        -webkit-app-region: drag; 
      }
      button, input, select, textarea, .pk-content {
        -webkit-app-region: no-drag;
      }
    `);
  });
}

// When Electron is ready, create the window
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
