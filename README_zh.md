# Maho-Mon 🐱‍🔮

[English](README.md) | [简体中文](README_zh.md) | [日本語](README_ja.md)

<p align="center">
  <img src="public/icon.png" width="128" height="128" alt="Maho-Mon Icon">
</p>

一个基于 Web 的监控应用，实时监控 Claude Code 的 token 使用量 —— 配备 Live2D 角色和系统监控功能。

## 功能特性

- **Live2D 角色** — 带有表情的动画角色，会根据工作强度做出反应
- **实时监控** — Token 数量、输入/输出、费用、模型名称、上下文使用率
- **会话追踪** — 当前会话统计、修改的文件、Git 分支、使用的工具
- **系统监控** — CPU、内存、GPU、网络速度显示
- **Kindle 版本** — 专为电子墨水屏设计的极简界面

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand
- **后端**: Node.js + Express
- **Live2D**: pixi-live2d-display + PixiJS 7

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 运行

**方式一：分别启动前端和后端**

```bash
# 终端 1 - 启动后端服务
cd server && npm run dev

# 终端 2 - 启动前端开发服务器
npm run dev
```

**方式二：同时启动**

```bash
npm run dev:all
```

### 访问地址

| 版本 | 地址 | 说明 |
|------|------|------|
| 主版本 | http://localhost:5173 | 完整界面，带 Live2D |
| Kindle | http://localhost:5173/k.html | 电子墨水屏极简界面 |

后端 API: http://localhost:3001

## Kindle 版本

Kindle 版本提供专为电子墨水屏设计的极简界面：

- 黑白设计，适合电子墨水屏
- 无动画或渐变效果
- 5 秒刷新间隔
- 通过 `/k.html` 访问

```
┌─────────────────────────────────────────────┐
│  Maho-Mon - Claude Monitor                  │
├─────────────────────┬───────────────────────┤
│  Session            │  Total                │
│  - 项目/模型        │  - 总 Tokens          │
│  - Tokens 输入/输出  │  - 输入/输出          │
│  - 上下文/缓存      │  - 费用/会话数        │
│  - 文件/分支        ├───────────────────────┤
│                     │  System               │
│                     │  - CPU/内存进度条     │
└─────────────────────┴───────────────────────┤
│  Network: ↑ XX KB/s  ↓ XX KB/s              │
└─────────────────────────────────────────────┘
```

## API 接口

| 接口 | 描述 |
|------|------|
| `GET /api/usage` | 获取 Claude 使用数据 |
| `GET /api/pet` | 获取宠物状态 |
| `POST /api/pet` | 更新宠物状态 |
| `POST /api/pet/interact` | 执行互动（喂食/玩耍/休息） |
| `GET /api/system` | 获取系统监控数据 |
| `GET /api/health` | 健康检查 |

## 项目结构

```
mahomon/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── Live2DCanvas.tsx
│   │   ├── SessionBubble.tsx
│   │   ├── StatsPanel.tsx
│   │   └── SystemMonitor.tsx
│   ├── pages/kindle/       # Kindle 版本
│   ├── stores/             # Zustand stores
│   ├── lib/                # 核心逻辑
│   └── types/              # TypeScript 类型
├── server/                 # 后端源码
│   ├── routes/             # API 路由
│   ├── lib/                # 后端逻辑
│   │   ├── claudeMonitor.ts
│   │   └── petStorage.ts
│   └── types/
└── public/
    ├── k.html              # Kindle HTML（独立）
    └── assets/live2d/      # Live2D 模型文件
```

## 数据来源

从以下位置读取 Claude Code 使用数据：

- `~/.claude/stats-cache.json` — 累计 token 统计
- `~/.claude/sessions/*.json` — 会话活动日志
- `~/.claude/projects/*/*.jsonl` — 项目会话数据

## 界面预览

**主版本**
```
┌──────────────────────────────────────────────┐
│  Maho-Mon | Magic Monitor Girl               │
├──────────────────────┬───────────────────────┤
│                      │  统计面板              │
│  会话气泡            │  - 总 token 数        │
│  - 当前会话          │  - 输入/输出          │
│  - 消息数            │  - 费用               │
│  - 使用的工具        │  - 模型名称           │
│                      ├───────────────────────┤
│  系统监控            │                       │
│  - CPU 使用率        │    Live2D 角色        │
│  - 内存              │                       │
│                      │  [喂食] [玩耍] [休息] │
└──────────────────────┴───────────────────────┘
```

## 许可证

MIT