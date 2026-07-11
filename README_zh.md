# Maho-Mon 🐱‍🔮

<p align="center">
  <img src="public/icon.png" width="128" height="128" alt="Maho-Mon Icon">
</p>

一个基于 Web 的桌面宠物应用，实时监控 Claude Code 的 token 使用量 —— 配备 Live2D 角色、游戏化属性和系统监控功能。

## 功能特性

- **Live2D 角色** — 带有表情和动作的动画宠物
- **实时监控** — Token 数量、输入/输出、费用、模型名称、上下文使用率
- **宠物系统** — HP、心情、饱食度、经验值和等级，由你的编程活动驱动
- **互动功能** — 喂食、玩耍、休息按钮触发动画
- **系统监控** — CPU、内存使用率显示
- **会话追踪** — 当前会话统计、修改的文件、Git 分支

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

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001

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
    └── assets/live2d/      # Live2D 模型文件
```

## 数据来源

从以下位置读取 Claude Code 使用数据：

- `~/.claude/stats-cache.json` — 累计 token 统计
- `~/.claude/sessions/*.json` — 会话活动日志
- `~/.claude/projects/*/*.jsonl` — 项目会话数据

## 宠物数据

- 宠物状态: `~/.claude/pet_data.json`

## 界面预览

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
