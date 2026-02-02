
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

const DEFAULT_DEV_URL = 'http://localhost:5173';

function getDevUrl() {
  const explicitUrl = process.env.PROMPTHUB_DEV_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  const port = process.env.PROMPTHUB_DEV_PORT;
  if (port) {
    return `http://localhost:${port}`;
  }

  return DEFAULT_DEV_URL;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'PromptHub Pro',
    autoHideMenuBar: true,
    backgroundColor: '#0b1220',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // 如果以后需要
    }
  });

  if (process.env.PROMPTHUB_VERBOSE_LOG === '1') {
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
    });
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    const message = `Load failed\nURL: ${validatedURL}\nCode: ${errorCode}\nReason: ${errorDescription}`;
    mainWindow.loadURL(`data:text/plain;charset=utf-8,${encodeURIComponent(message)}`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.webContents.on('dom-ready', () => {
    if (process.env.PROMPTHUB_OPEN_DEVTOOLS === '1') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const distIndex = path.join(__dirname, 'dist', 'index.html');

  mainWindow.loadFile(distIndex).catch(err => {
    console.error('Failed to load index.html:', err);
    mainWindow.loadURL(getDevUrl());
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
