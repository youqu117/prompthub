
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "PromptHub Pro",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // 如果以后需要
    }
  });

  // 在开发环境和生产环境使用不同的加载策略
  // 由于我们是打包使用，直接加载 dist/index.html
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  
  // 尝试加载文件
  mainWindow.loadFile(distIndex).catch(err => {
    console.error("Failed to load index.html:", err);
    // 如果文件不存在（比如在开发模式直接运行 electron .），尝试加载 vite 开发服务器
    mainWindow.loadURL('http://localhost:5173');
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
