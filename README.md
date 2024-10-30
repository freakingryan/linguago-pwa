# LinguaGo PWA

LinguaGo 是一个基于 AI 的语言学习和翻译 PWA 应用，旨在帮助用户克服国际旅行中的语言障碍。

## 功能特点

- 支持多语言实时翻译
- 语音输入（支持英语）
- 文本朗读功能
- 翻译历史记录
- 自定义 AI API 配置
- PWA 支持，可离线使用
- 响应式设计，支持多设备访问
- 深色/浅色主题切换

## 技术栈

- React 18
- TypeScript
- Redux Toolkit (状态管理)
- React Router (路由管理)
- Tailwind CSS (样式)
- Vite (构建工具)
- PWA (渐进式 Web 应用)
- Web Speech API (语音识别和合成)
- Axios (HTTP 客户端)

## 快速开始

### 开发环境要求

- Node.js >= 16
- npm >= 8

### 安装和运行

1. 克隆仓库：
bash
git clone https://github.com/your-username/linguago-pwa.git
cd linguago-pwa

2. 安装依赖：
bash
npm install

3. 启动开发服务器：
bash
npm run dev

4. 构建生产版本：
bash
npm run build

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

1. 在主页输入要翻译的文本
2. 选择目标语言（支持常用语言快速选择和自定义语言输入）
3. 点击"翻译"按钮获取结果

## 项目结构

linguago-pwa/
├── public/ # 静态资源
│ ├── manifest.json
│ ├── service-worker.js
│ └── icons/
├── src/
│ ├── components/ # React 组件
│ │ ├── common/ # 通用组件
│ │ └── layout/ # 布局组件
│ ├── pages/ # 页面组件
│ ├── services/ # API 服务
│ ├── store/ # Redux store
│ ├── types/ # TypeScript 类型
│ └── styles/ # 样式文件


## 部署说明

1. 构建生产版本：

bash
npm run build

2. 测试生产构建：

bash
npm run preview


## 配置说明

1. AI API 配置：
   - 在设置页面配置您的 API 密钥
   - 支持多个 AI 提供商

2. PWA 配置：
   - 修改 `public/manifest.json` 自定义 PWA 行为
   - 配置 Service Worker 以支持离线功能

3. 主题配置：
   - 支持浅色/深色主题切换
   - 使用 Tailwind CSS 进行样式管理

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

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License