# LinguaGo PWA 项目说明文档

## 项目概述

LinguaGo PWA 是一个基于 AI 的多语言学习与翻译应用,支持实时翻译、语音交互和离线使用。主要面向旅行者,提供便捷的跨语言交流解决方案。

## 技术栈

- React 18 + TypeScript: 前端框架和类型系统
- Redux Toolkit: 状态管理
- Tailwind CSS: 样式框架
- IndexedDB: 本地数据存储
- Web Speech API: 语音功能
- PWA: 离线支持

## 核心功能模块

### 1. 实时对话翻译 (Conversation)

主要功能:
- 实时语音/文字翻译
- 双向语言切换
- 语音输入/输出
- 对话历史保存
- 地理位置检测

实现要点:
- 使用 useVoiceRecording hook 处理语音录制
- 使用 useAITranslation hook 处理翻译逻辑
- 使用 IndexedDB 存储当前对话
- 支持对话重置和历史保存

### 2. 对话历史管理 (ConversationHistory)

数据结构说明:
- 消息(Message): 包含原文、译文、语言信息等
- 对话(Conversation): 包含多条消息及时间信息
- 历史记录(History): 包含多个完整对话

主要功能:
- 查看历史对话列表
- 查看单个对话详情
- 删除历史记录
- 支持多选操作

### 3. 数据存储层 (IndexedDB)

主要功能:
- 存储当前对话内容
- 存储历史对话记录
- 支持离线访问
- 数据持久化

关键操作:
- getCurrentConversation: 获取当前对话
- saveCurrentConversation: 保存当前对话
- getAllConversations: 获取所有历史
- addConversation: 添加新记录

### 4. 状态管理 (Redux)

主要模块:
- conversationHistory: 对话历史状态
- settings: 应用配置状态
- loading: 加载状态管理

## 开发指南

### 1. 添加新功能流程

1. 在 types 目录定义相关类型
2. 在 store/slices 添加状态管理
3. 在 hooks 目录封装业务逻辑
4. 在 components 开发UI组件
5. 在 pages 组装完整页面

### 2. 数据流向说明

1. UI 事件触发 -> 调用 hooks 方法
2. hooks 处理业务逻辑 -> 调用 API/更新 IndexedDB
3. 通过 dispatch 更新 Redux store
4. Redux store 更新触发 UI 重渲染

### 3. 注意事项

IndexedDB 操作:
- 统一使用 useIndexedDB hook
- 处理异步操作错误
- 保持数据结构一致

状态管理:
- 全局状态用 Redux
- 组件状态用 useState
- 注意更新时机

性能优化:
- 使用 useCallback/useMemo
- 合理拆分组件
- 图片资源懒加载

## 项目结构

src/
- components/: UI组件
- hooks/: 自定义hooks
- pages/: 页面组件
- services/: API服务
- store/: Redux store
- types/: TypeScript类型
- utils/: 工具函数

## 后续开发建议

功能增强:
- 支持更多语言选项
- 添加语音识别准确度提示
- 支持对话导出功能
- 添加更多的交互动画

性能优化:
- 实现虚拟列表
- 优化数据库查询
- 添加请求缓存
- 优化首屏加载

用户体验:
- 完善加载状态反馈
- 优化错误提示
- 支持快捷键操作
- 优化深色模式

## 常见问题

1. IndexedDB 数据同步问题
- 检查 useEffect 依赖项
- 确保异步操作完成
- 验证数据结构一致性

2. 翻译功能异常处理
- 检查 API 配置
- 确认网络连接
- 查看控制台错误

3. 语音功能故障排查
- 检查浏览器兼容性
- 确认麦克风权限
- 验证 API 支持情况

## 环境配置

开发环境:
- Node.js >= 16
- npm >= 8
- 现代浏览器(支持 IndexedDB)

环境变量:
- VITE_API_URL: API 地址
- VITE_DEFAULT_MODEL: 默认模型
- VITE_APP_VERSION: 应用版本

## 部署说明

构建命令:
- npm install: 安装依赖
- npm run dev: 开发环境
- npm run build: 生产构建
- npm run preview: 预览构建

部署注意:
- 配置 HTTPS
- 设置正确的 API 地址
- 确保 PWA 资源可访问