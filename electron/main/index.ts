// 引入Electron模块和Node.js内置模块
import { app, BrowserWindow, shell, ipcMain } from 'electron' // 从Electron导入必要的模块
import { createRequire } from 'node:module' // Node.js的createRequire方法用于动态引入模块
import { fileURLToPath } from 'node:url' // 将file URL转换为普通路径字符串
import path from 'node:path' // Node.js的path模块用于处理文件路径
import os from 'node:os' // Node.js的os模块用于获取操作系统信息

// 创建require函数以便在ES模块中使用CommonJS模块
const require = createRequire(import.meta.url) // 创建一个基于当前模块的require函数
// 获取当前文件的目录路径
const __dirname = path.dirname(fileURLToPath(import.meta.url)) // 获取当前模块的目录路径

// 设置构建后的目录结构
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
process.env.APP_ROOT = path.join(__dirname, '../..') // 设置项目根目录的环境变量

// 导出主进程和渲染进程的dist路径
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron') // 主进程打包输出目录
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist') // 渲染进程打包输出目录
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL // Vite开发服务器地址

// 设置公共资源路径
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public') // 开发环境下公共资源路径
  : RENDERER_DIST // 生产环境下公共资源路径

// 禁用Windows 7的GPU加速
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration() // 在Windows 7上禁用硬件加速

// 为Windows 10+设置应用名称用于通知
if (process.platform === 'win32') app.setAppUserModelId(app.getName()) // 设置Windows的任务栏通知ID

// 检查是否是单实例应用（防止多个实例同时运行）
if (!app.requestSingleInstanceLock()) { // 请求单实例锁
  // 如果不是单实例，则退出应用
  app.quit() // 关闭应用
  process.exit(0) // 退出进程
}

// 定义主窗口变量，初始值为null
let win: BrowserWindow | null = null // 主窗口对象，初始值为null
// 预加载脚本的路径
const preload = path.join(__dirname, '../preload/index.mjs') // 预加载脚本的绝对路径
// 渲染进程的HTML文件路径
const indexHtml = path.join(RENDERER_DIST, 'index.html') // 渲染进程HTML文件的绝对路径

// 创建主窗口函数
async function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({ // 创建一个新的浏览器窗口
    title: 'Main window', // 窗口标题
    // 设置窗口图标
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'), // 设置窗口图标
    webPreferences: {
      // 预加载脚本
      preload, // 配置预加载脚本
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true, // 不建议在生产环境中启用nodeIntegration

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false, // 不建议在生产环境中禁用contextIsolation
    },
  })

  // 如果存在VITE开发服务器URL，则加载该URL
  if (VITE_DEV_SERVER_URL) { // #298 判断是否处于开发模式
    // 加载VITE开发服务器URL
    win.loadURL(VITE_DEV_SERVER_URL) // 加载开发服务器URL
    // 打开开发者工具（仅在开发环境需要）
    win.webContents.openDevTools() // 打开开发者工具面板
  } else {
    // 否则加载本地HTML文件
    win.loadFile(indexHtml) // 加载本地HTML文件
  }

  // 主进程主动推送消息到渲染进程的测试
  win.webContents.on('did-finish-load', () => { // 页面加载完成时触发
    // 当页面加载完成后，向渲染进程发送一条消息
    win?.webContents.send('main-process-message', new Date().toLocaleString()) // 发送消息给渲染进程
  })

  // 设置链接打开方式：所有链接都在默认浏览器中打开，而不是在应用中打开
  win.webContents.setWindowOpenHandler(({ url }) => { // 设置新窗口打开处理程序
    // 如果是HTTPS链接，则使用系统默认浏览器打开
    if (url.startsWith('https:')) shell.openExternal(url) // 使用外部浏览器打开HTTPS链接
    // 拒绝创建新窗口
    return { action: 'deny' } // 拒绝创建新窗口
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

// 当Electron初始化完成并准备就绪时创建窗口
app.whenReady().then(createWindow) // 当Electron初始化完成后创建主窗口

// 监听'window-all-closed'事件：当所有窗口都被关闭时
app.on('window-all-closed', () => { // 当所有窗口关闭时触发
  // 将主窗口引用设为null
  win = null // 清除主窗口引用
  // 如果不是macOS平台，则退出应用
  if (process.platform !== 'darwin') app.quit() // macOS下通常不会退出应用
})

// 监听'second-instance'事件：当用户尝试再次启动应用时
app.on('second-instance', () => { // 当检测到第二个实例启动时触发
  if (win) {
    // 如果主窗口存在，确保它获得焦点
    // 如果窗口最小化，先恢复窗口
    if (win.isMinimized()) win.restore() // 如果窗口最小化，先恢复窗口
    // 让窗口获得焦点
    win.focus() // 让主窗口获得焦点
  }
})

// 监听'activate'事件：当应用被激活时（例如点击任务栏图标）
app.on('activate', () => { // 当应用被激活时触发（如点击Dock图标）
  // 获取所有已创建的窗口
  const allWindows = BrowserWindow.getAllWindows() // 获取所有已创建的窗口
  if (allWindows.length) {
    // 如果有窗口存在，让第一个窗口获得焦点
    allWindows[0].focus() // 让第一个窗口获得焦点
  } else {
    // 如果没有窗口存在，创建新的主窗口
    createWindow() // 创建新的主窗口
  }
})

// 监听'open-win' IPC事件：用于创建新窗口
ipcMain.handle('open-win', (_, arg) => { // 处理来自渲染进程的open-win事件
  // 创建新的浏览器窗口
  const childWindow = new BrowserWindow({ // 创建子窗口
    webPreferences: {
      // 使用相同的预加载脚本
      preload, // 配置预加载脚本
      // 启用Node.js集成
      nodeIntegration: true, // 启用Node.js集成
      // 禁用上下文隔离（不推荐在生产环境中使用）
      contextIsolation: false, // 禁用上下文隔离
    },
  })

  // 根据环境加载不同的URL
  if (VITE_DEV_SERVER_URL) {
    // 开发环境加载带hash参数的URL
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`) // 加载带参数的开发服务器URL
  } else {
    // 生产环境加载本地HTML文件并传递hash参数
    childWindow.loadFile(indexHtml, { hash: arg }) // 加载带参数的本地HTML文件
  }

  // 返回childWindow对象，以便后续操作
  return childWindow // 返回子窗口对象
})
