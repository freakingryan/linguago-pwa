# LinguaGo PWA

一个基于 AI 的多语言学习与翻译 PWA 应用，支持实时翻译、语音交互和离线使用。

## ✨ 核心特性

- 🌍 多语言实时翻译
- 🎙️ 语音输入与朗读
- 📱 PWA 支持，可离线使用
- 🌓 深色/浅色主题
- 🔄 翻译历史记录
- ⚙️ 自定义 AI API 配置

## 🛠️ 技术栈

- React 18 + TypeScript
- Redux Toolkit
- Tailwind CSS
- Vite
- Web Speech API
- PWA

## 🚀 快速开始

### 开发环境要求

- Node.js >= 16
- npm >= 8

### 安装和运行

1. 克隆仓库：
```bash
git clone https://github.com/your-username/linguago-pwa.git
cd linguago-pwa
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建生产版本：
```bash
npm run build
```

## 使用说明

### API 配置

1. 访问设置页面
2. 配置以下信息：
   - API URL (例如: https://api.chatanywhere.tech/v1)
   - API Key
   - 模型名称 (例如: gpt-3.5-turbo)
3. 点击"测试连接"确保配置正确
4. 点击"保存配置"保存设置

### 翻译功能

1. 在主页输入要翻译的文本或使用语音输入（目前支持英语）
2. 选择目标语言（支持常用语言快速选择和自定义语言输入）
3. 点击"翻译"按钮获取结果
4. 可以使用朗读功能听取翻译结果
5. 所有翻译记录都会保存在历史记录中

## 浏览器支持

- Chrome (推荐)
- Edge
- Safari
- Firefox

注意：语音识别功能目前仅支持英语输入，并且需要浏览器支持 Web Speech API。

## 项目结构

linguago-pwa/
├── src/
│ ├── components/ # 可复用组件
│ ├── services/ # 业务服务
│ ├── store/ # Redux store
│ ├── types/ # TypeScript 类型定义
│ ├── utils/ # 工具函数
│ └── pages/ # 页面组件
├── public/ # 静态资源
└── vite.config.ts # Vite 配置



## 部署说明

1. 构建生产版本：

bash
npm run build

2. 测试生产构建：

bash
npm run preview


## 🔧 配置说明

### API 配置
1. 访问设置页面
2. 配置 API 信息：
   - API URL
   - API Key
   - 模型选择
3. 保存并测试连接

### PWA 配置
- 修改 `manifest.json` 自定义 PWA 行为
- 配置 Service Worker 支持离线功能

## 📱 浏览器支持

- Chrome/Edge (推荐)
- Safari
- Firefox

> 注意：语音功能需要浏览器支持 Web Speech API

## 开发指南

1. 组件开发
   - 使用 TypeScript 类型定义
   - 遵循函数式组件范式
   - 使用 Hooks 管理状态

2. 状态管理
   - 使用 Redux Toolkit 管理全局状态
   - 本地状态使用 useState
   - 持久化存储使用 localStorage

3. 样式开发
   - 使用 Tailwind CSS 工具类
   - 支持响应式设计
   - 支持深色模式
