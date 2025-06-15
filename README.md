# Electron + Vue 3 + Vite 桌面应用模板

一个简单而现代的桌面应用程序模板，使用 Electron、Vue 3 和 Vite 构建。该模板提供了一个快速启动桌面应用开发的基础框架。

## 技术栈

- ⚡️ Electron 29.1.1 - 跨平台桌面应用框架
- 🖖 Vue 3.4.21 - 渐进式 JavaScript 框架
- 🛠️ Vite 5.1.5 - 下一代前端构建工具
- 📦 TypeScript 5.4.2 - JavaScript 的超集
- 🗃️ Pinia 3.0.3 - Vue 状态管理
- 🚦 Vue Router 4.0.13 - Vue.js 官方路由

## 项目结构

```
electron-vue3-desktop-app/
├── electron/                 # Electron 相关代码
│   ├── main/                # 主进程代码
│   │   └── index.ts        # 主进程入口文件
│   └── preload/            # 预加载脚本
│       └── index.ts        # 预加载脚本入口文件
├── src/                     # 前端源代码
│   ├── assets/             # 静态资源
│   ├── components/         # Vue 组件
│   ├── demos/              # 示例代码
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── App.vue            # 根组件
│   └── main.ts            # 渲染进程入口文件
├── index.html              # HTML 模板
└── package.json           # 项目配置文件
```

## 特性

- 🚀 基于 Vite 的快速开发和热重载
- 💡 TypeScript 支持
- 📦 开箱即用的 Electron 主进程和渲染进程配置
- 🔒 安全的 IPC 通信封装
- 🎯 Vue Router 路由管理
- 📊 Pinia 状态管理
- 🎨 简洁的项目结构

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
npm run build
```

## 开发指南

### 主进程开发

主进程代码位于 `electron/main/index.ts`，负责：
- 创建和管理应用窗口
- 处理应用生命周期
- 配置应用菜单和快捷键
- 处理 IPC 通信

### 预加载脚本

预加载脚本位于 `electron/preload/index.ts`，用于：
- 安全地暴露 IPC 通信接口
- 提供渲染进程可用的 API
- 处理窗口加载状态

### 渲染进程开发

渲染进程使用 Vue 3 开发，主要文件：
- `src/main.ts` - 渲染进程入口
- `src/App.vue` - 根组件
- `src/router/` - 路由配置
- `src/stores/` - 状态管理
- `src/components/` - 可复用组件

### IPC 通信示例

在 `src/demos/ipc.ts` 中提供了主进程和渲染进程之间通信的示例代码。

## 构建和打包

项目使用 electron-builder 进行应用打包，配置文件为 `electron-builder.json5`。

### 打包命令

```bash
npm run build
```

这将生成适用于当前平台的安装包。

## 许可证

[MIT](LICENSE)
