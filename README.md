# Claude Monitor Web

Node.js + React 网页版本的 Claude Monitor 桌面宠物应用。

## 功能

- 实时监控 Claude Code token 使用
- Live2D 宠物显示
- 宠物养成系统（HP/快乐值/饱食度/经验值/等级）
- 互动功能（喂食/玩耍/休息）
- 系统监控（CPU/内存/网络）
- 多语言支持

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **后端**: Node.js + Express
- **Live2D**: pixi-live2d-display + PixiJS
- **系统监控**: systeminformation

## 快速开始

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
# 终端 1 - 启动后端
cd server && npm run dev

# 终端 2 - 启动前端
npm run dev
```

**方式二：同时启动**

```bash
npm run dev:all
```

### 访问

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001/api

## API 接口

### GET /api/usage
获取 Claude 使用数据

### GET /api/pet
获取宠物状态

### POST /api/pet
更新宠物状态

### POST /api/pet/interact
执行互动（feed/play/rest）

### GET /api/system
获取系统监控数据

## 项目结构

```
claude-monitor-web/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── stores/             # Zustand stores
│   ├── lib/                # 核心逻辑
│   └── types/              # TypeScript 类型
├── server/                 # 后端源码
│   ├── routes/             # API 路由
│   └── lib/                # 后端逻辑
└── public/                 # 静态资源
    └── assets/live2d/      # Live2D 模型
```

## 从 Python 版本迁移

此项目是从 Python + PySide6 版本迁移而来：

| Python 文件 | Node.js 对应 |
|-------------|--------------|
| `src/core/monitor.py` | `server/lib/claudeMonitor.ts` |
| `src/core/pet.py` | `src/lib/pet.ts` |
| `src/data/pet_storage.py` | `server/lib/petStorage.ts` |
| `src/ui/live2d_window.py` | `src/components/Live2DCanvas.tsx` 等 |
| `src/utils/config.py` | `src/lib/config.ts` |

## 数据文件

- 宠物数据: `~/.claude/pet_data.json`
- 使用统计: `~/.claude/stats-cache.json`
- 会话数据: `~/.claude/sessions/*.json`
- 项目会话: `~/.claude/projects/*/*.jsonl`

## License

MIT