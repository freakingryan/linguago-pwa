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

## 日语学习功能备忘录

### 计划功能列表

1. AI 智能评估系统
- 通过对话评估日语水平
- 智能生成学习计划
- 动态难度调整
- JLPT 等级预测

2. JLPT 考试针对训练
- N1-N5 分级词汇、语法训练
- AI 真题解析与出题
- 考点难度分析
- 答题模式分析

3. AI 对话训练
- 模拟考试口语
- 实时语法纠错
- 场景化练习
- 语速语调评分

4. 智能错题本
- 错题自动分类
- 相似题型推荐
- 针对性练习
- 薄弱点分析

5. 考试技巧训练
- 听力应试技巧
- 阅读理解方法
- 时间管理建议
- AI 答题策略

6. 语言能力强化
- 语法关联分析
- 词汇联想记忆
- 相似表达辨析
- 场景应用推荐

7. 模拟考试系统
- AI 动态组卷
- 考试环境模拟
- 解析与评分
- 表现分析

8. 学习效率优化
- 时间分配建议
- 记忆曲线分析
- 复习提醒
- 方法优化

9. 智能复习助手
- 重点内容提取
- 遗忘点预测
- 复习计划
- 考前预测

10. 学习数据分析
- 进度追踪
- 能力提升曲线
- 薄弱环节分析
- 备考规划

### MVP1 优先实现功能建议

基于用户核心需求和技术可行性，建议 MVP1 优先实现以下功能：

1. JLPT 基础训练模块
- N1-N5 分级的词汇和语法练习
- 基于现有翻译功能扩展
- 重用已有的语音交互功能
- 专注单项能力训练

2. 简化版智能错题本
- 错题记录与分类
- 基础的错误分析
- 重点是数据收集
- 为后续 AI 分析做准备

3. 基础模拟测试
- 单个考试科目模拟
- 基础题型覆盖
- 简单的评分反馈
- 重点是考试形式适应

实现重点：
- 复用现有的 AI 翻译能力
- 保持数据结构的扩展性
- 优先实现核心练习功能
- 为后续功能预留接口

技术注意事项：
- 扩展现有的 IndexedDB 结构
- 增加练习相关的 Redux store
- 设计合适的练习数据模型
- 优化 AI 提示词以适应教学场景