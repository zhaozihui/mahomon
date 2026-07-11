# Maho-Mon 🐱‍🔮

[English](README.md) | [简体中文](README_zh.md) | [日本語](README_ja.md)

<p align="center">
  <img src="public/icon.png" width="128" height="128" alt="Maho-Mon Icon">
</p>

A web-based desktop pet app that monitors Claude Code token usage in real-time — featuring a Live2D character, gamified stats, and system monitoring.

## Features

- **Live2D Character** — Animated pet with expressions and actions
- **Real-time Monitoring** — Token count, input/output, cost, model name, context usage
- **Pet System** — HP, mood, hunger, XP, and levels driven by your coding activity
- **Interactive** — Feed, play, and rest buttons trigger animations
- **System Monitor** — CPU, memory usage display
- **Session Tracking** — Current session stats, modified files, git branch

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand
- **Backend**: Node.js + Express
- **Live2D**: pixi-live2d-display + PixiJS 7

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### Run

**Option 1: Start frontend and backend separately**

```bash
# Terminal 1 - Start backend server
cd server && npm run dev

# Terminal 2 - Start frontend dev server
npm run dev
```

**Option 2: Start both together**

```bash
npm run dev:all
```

### Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/usage` | Get Claude usage data |
| `GET /api/pet` | Get pet status |
| `POST /api/pet` | Update pet status |
| `POST /api/pet/interact` | Perform interaction (feed/play/rest) |
| `GET /api/system` | Get system monitoring data |
| `GET /api/health` | Health check |

## Project Structure

```
mahomon/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── Live2DCanvas.tsx
│   │   ├── SessionBubble.tsx
│   │   ├── StatsPanel.tsx
│   │   └── SystemMonitor.tsx
│   ├── stores/             # Zustand stores
│   ├── lib/                # Core logic
│   └── types/              # TypeScript types
├── server/                 # Backend source
│   ├── routes/             # API routes
│   ├── lib/                # Backend logic
│   │   ├── claudeMonitor.ts
│   │   └── petStorage.ts
│   └── types/
└── public/
    └── assets/live2d/      # Live2D model files
```

## Data Sources

Reads Claude Code usage from:

- `~/.claude/stats-cache.json` — Cumulative token statistics
- `~/.claude/sessions/*.json` — Session activity logs
- `~/.claude/projects/*/*.jsonl` — Project session data

## Pet Data

- Pet state: `~/.claude/pet_data.json`

## Screenshots

```
┌──────────────────────────────────────────────┐
│  Maho-Mon | Magic Monitor Girl               │
├──────────────────────┬───────────────────────┤
│                      │  Stats Panel          │
│  Session Bubble      │  - Total tokens       │
│  - Current session   │  - Input/Output       │
│  - Messages          │  - Cost               │
│  - Tools used        │  - Model name         │
│                      ├───────────────────────┤
│  System Monitor      │                       │
│  - CPU usage         │    Live2D Character   │
│  - Memory            │                       │
│                      │  [Feed] [Play] [Rest] │
└──────────────────────┴───────────────────────┘
```

## License

MIT
