# Maho-Mon 🐱‍🔮

[English](README.md) | [简体中文](README_zh.md) | [日本語](README_ja.md)

<p align="center">
  <img src="public/icon.png" width="128" height="128" alt="Maho-Mon Icon">
</p>

A web-based monitoring app for Claude Code token usage in real-time — featuring a Live2D character and system monitoring.

## Features

- **Live2D Character** — Animated pet with expressions that react to your work intensity
- **Real-time Monitoring** — Token count, input/output, cost, model name, context usage
- **Session Tracking** — Current session stats, modified files, git branch, tools used
- **System Monitor** — CPU, memory, GPU, network speed display
- **Kindle Version** — Minimal e-ink friendly UI for Kindle devices

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

| Version | URL | Description |
|---------|-----|-------------|
| Main | http://localhost:5173 | Full UI with Live2D |
| Kindle | http://localhost:5173/k.html | Minimal e-ink UI |

Backend API: http://localhost:3001

## Kindle Version

The Kindle version provides a minimal, e-ink friendly interface:

- Black & white design optimized for e-ink displays
- No animations or gradients
- 5-second refresh interval
- Access via `/k.html` or run `npm run dev:kindle`

```
┌─────────────────────────────────────────────┐
│  Maho-Mon - Claude Monitor                  │
├─────────────────────┬───────────────────────┤
│  Session            │  Total                │
│  - Project/Model    │  - Total Tokens       │
│  - Tokens In/Out    │  - Input/Output       │
│  - Context/Cache    │  - Cost/Sessions      │
│  - Files/Branch     ├───────────────────────┤
│                     │  System               │
│                     │  - CPU/Memory bars    │
└─────────────────────┴───────────────────────┤
│  Network: ↑ XX KB/s  ↓ XX KB/s              │
└─────────────────────────────────────────────┘
```

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
│   ├── pages/kindle/       # Kindle version
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
    ├── k.html              # Kindle HTML (standalone)
    └── assets/live2d/      # Live2D model files
```

## Data Sources

Reads Claude Code usage from:

- `~/.claude/stats-cache.json` — Cumulative token statistics
- `~/.claude/sessions/*.json` — Session activity logs
- `~/.claude/projects/*/*.jsonl` — Project session data

## Screenshots

**Main Version**
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