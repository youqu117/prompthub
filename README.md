
# PromptHub Pro 桌面版使用指南

此版本已配置为 Electron 桌面应用，外观和操作体验与原生 Windows 软件一致。

### 1. 快速启动
1. 确保已安装 [Node.js](https://nodejs.org/)。
2. 双击 `启动软件.bat`。
3. 首次启动会自动安装依赖、构建页面并下载 Electron 引擎（约 50-100MB），之后即可秒开。
4. 如果你不想用 bat，也可以在命令行里执行：
   - `npm install`
   - `npm run start`

### 2. 一键更新（可选）
如果你是通过 Git 拉下来的源码，双击 `一键更新.bat` 会自动拉取最新代码、安装依赖并构建页面。

### 3. 如何变成一个真正的 .exe 文件？
如果你想把这个文件夹打包成一个单独的 `.exe` 发给别人使用，请按以下步骤：
1. 在文件夹地址栏输入 `cmd` 并回车。
2. 输入命令：`npm run pack`。
3. 等待完成后，你会发现多了一个 `dist` 文件夹。
4. `dist` 里会生成两个可直接分发的文件：
   - **`PromptHub Pro 1.0.0 Setup.exe`**：标准安装版（双击安装，体验更像微信等桌面软件）
   - **`PromptHub Pro 1.0.0 Portable.exe`**：绿色单文件，双击直接运行

### 4. 为什么这样更好用？
- **独立窗口**：不再混杂在浏览器的几十个标签页里。
- **任务栏固定**：运行后可以直接右键任务栏“固定到任务栏”。
- **性能更优**：独立的渲染进程，不占用浏览器内存。

### 5. 白屏快速定位（开发排查）
1. 如果 `dist/index.html` 不存在，应用会自动尝试加载本地开发地址（默认 `http://localhost:5173`）。
2. 可通过环境变量指定端口/地址：
   - `PROMPTHUB_DEV_URL=http://localhost:3000`
   - `PROMPTHUB_DEV_PORT=3000`
3. 如果加载失败，窗口会直接显示失败原因，并把渲染进程的 console 输出到主进程控制台。
4. 想自动打开 DevTools：设置 `PROMPTHUB_OPEN_DEVTOOLS=1`。

### 6. 常见报错汇总指令（避免重复踩坑）
> 复制以下命令运行，可一次性检查“依赖不可用 / 白屏 / 入口文件缺失 / 端口错误”等常见问题。

```bash
# 1) 检查 npm 依赖是否有不可用版本（例如之前的 @google/genai@^0.1.1）
npm ls --all

# 2) 检查是否能成功安装依赖（403/ETARGET 一般是镜像或版本问题）
npm install

# 3) 构建静态资源，确保 dist/index.html 存在
npm run build

# 4) 启动 Electron（如果是开发环境，可手动指定端口）
# Windows PowerShell:
# $env:PROMPTHUB_DEV_PORT=5173; $env:PROMPTHUB_OPEN_DEVTOOLS=1; npm run start
# macOS/Linux:
# PROMPTHUB_DEV_PORT=5173 PROMPTHUB_OPEN_DEVTOOLS=1 npm run start

# 5) 如出现白屏，优先查看主进程控制台输出（renderer:...）和窗口内的 Load failed 信息
```

**常见问题对照：**
- `ETARGET No matching version`：依赖版本不存在或拼错，检查 `package.json` 依赖版本。  
- `403 Forbidden`：网络/镜像或权限限制导致 npm 无法拉取包，建议切换 registry 或使用内网镜像。  
- 白屏 + CSP Warning：CSP 提示不是白屏原因，应看真正的报错与网络失败请求。  
- 入口空白：确认 `dist/index.html` 是否存在，或 dev server 端口是否正确（常见为 5173）。  
