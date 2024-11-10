# LinguaGo PWA 项目说明文档

## 项目概述

LinguaGo PWA 是一个基于 AI 的多语言学习与翻译应用，专注于日语学习和实时翻译功能。主要面向日语学习者和旅行者，提供智能学习和跨语言交流解决方案。

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
- 消息编辑功能
- 自定义目标语言

### 2. 智能词汇管理 (Vocabulary)
主要功能:
- AI 智能推荐单词
- 词汇分级管理
- 单词搜索功能
- 批量添加单词
- 词汇详情查看
- 标签分类管理

### 3. 歌词管理 (Lyrics)
主要功能:
- 歌词导入与分离
  - 支持文本粘贴导入
  - 智能分离原文和译文
  - 支持拖拽排序（react-beautiful-dnd）
  - 支持批量选择（奇数行/偶数行）
  - 支持单行点击选择
  - 支持将选中内容移动到译文区
- AI 注音处理
  - 支持 OpenAI/Gemini API
  - 自动为汉字添加假名注音
  - 智能识别日文内容
  - 保持原有换行格式
- 歌词存储管理
  - 本地 IndexedDB 存储
  - 支持增删改查
  - 歌词详情查看
  - 创建/更新时间记录
- 用户交互
  - 拖拽排序功能
  - 行选择功能
  - 复原功能
  - 深色模式支持

### 4. 数据存储层 (IndexedDB)
主要功能:
- 存储单词数据
- 存储对话记录
- 支持离线访问
- 数据持久化
- 存储歌词数据
  - 歌曲标题
  - 歌手信息
  - 原文内容
  - 注音标注
  - 中文翻译
  - 创建/更新时间

### 5. AI 服务集成
- 多平台支持
  - OpenAI API
  - Google Gemini API
- API 功能
  - 文本生成（翻译/注音）
  - 错误处理机制
  - 响应格式化
  - 安全过滤处理
- 配置管理
  - API URL 配置
  - API Key 配置
  - 模型选择
  - 连接测试

### 6. 状态管理 (Redux)
主要模块:
- vocabularySlice: 词汇管理状态
- conversationSlice: 对话状态
- settingsSlice: 应用配置状态
- loadingSlice: 加载状态管理
- lyricsSlice: 歌词管理状态

## 开发指南

### 1. UI 开发规范
- 使用 Tailwind CSS 进行样式开发
- 支持深色模式
- 响应式设计
- 统一的交互反馈
- 动画效果适度

### 2. 组件开发流程
1. 定义接口和类型
2. 实现核心逻辑
3. 添加错误处理
4. 优化性能
5. 添加测试用例

### 3. AI 功能开发
- 优化提示词设计
- 处理 AI 响应格式
- 实现错误重试
- 优化响应速度
- 本地缓存结果

## 项目结构

src/
- components/: UI组件
- hooks/: 自定义hooks
- pages/: 页面组件
- services/: API服务
- store/: Redux store
- types/: TypeScript类型
- utils/: 工具函数
- components/lyrics/
  - LyricsImportPage.tsx: 歌词导入页面
  - ProcessedLyricsModal.tsx: 处理后歌词展示
- components/layout/
  - Sidebar.tsx: 侧边栏导航
  - Header.tsx: 顶部导航
- pages/
  - LyricsManagement.tsx: 歌词管理页面
  - LyricsDetail.tsx: 歌词详情页面
- services/
  - api.ts: 统一 API 服务
  - promptService.ts: AI 提示词服务
  - lyricsProcessingService.ts: 歌词处理服务
- types/
  - lyrics.ts: 歌词相关类型定义
- store/lyrics/
  - actions.ts: Redux actions
  - reducer.ts: Redux reducer
  - types.ts: Redux 状态类型

## 后续开发计划

### 1. 词汇学习增强
- JLPT 分级词汇训练
- 智能错题本
- 记忆曲线分析
- 学习进度追踪

### 2. AI 功能优化
- 更智能的单词推荐
- 上下文理解增强
- 语法纠错功能
- 学习建议生成

### 3. 用户体验提升
- 性能优化
- 离线功能增强
- UI/UX 改进
- 数据导出功能

### 4. 歌词处理优化
- 注音准确性验证
- 格式一致性保持
- 大文本处理优化
- 拖拽交互优化
- 状态管理优化
- 数据持久化处理

## 注意事项

### 1. AI 响应处理
- 验证响应格式
- 处理异常情况
- 优化响应速度
- 实现重试机制

### 2. 数据存储
- 定期清理缓存
- 数据备份机制
- 版本升级处理
- 存储空间管理

### 3. 性能优化
- 使用 React.memo
- 实现虚拟列表
- 延迟加载组件
- 优化渲染性能

### 4. 代码规范
- 使用 TypeScript 类型
- 遵循 ESLint 规则
- 编写单元测试
- 文档注释完整

### 5. Git 工作流
- 遵循 Git Flow
- 编写清晰的提交信息
- 创建功能分支
- 进行代码审查

### 6. AI 交互注意事项
- 提示词模板优化
- 响应格式验证
- 错误重试机制
- 安全过滤处理
- API 调用频率控制
- 响应超时处理

### 7. 歌词处理注意事项
- 注音准确性验证
- 格式一致性保持
- 大文本处理优化
- 拖拽交互优化
- 状态管理优化
- 数据持久化处理