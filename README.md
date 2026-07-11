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

**Prerequisites**: Node.js 18+

```bash
# Clone and install
git clone https://github.com/zhaozihui/mahomon.git
cd mahomon
npm install
cd server && npm install && cd ..

# Start backend
cd server && npm run dev

# Start frontend (in another terminal)
npm run dev
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

### Mobile Version

<p align="center">
  <img src="screenshot_m.jpg" width="300" alt="Mobile Version Screenshot">
</p>

### Kindle Version

<p align="center">
  <img src="screenshot_k.png" width="400" alt="Kindle Version Screenshot">
</p>

## License

MIT