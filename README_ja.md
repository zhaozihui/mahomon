# Maho-Mon 🐱‍🔮

<p align="center">
  <img src="public/icon.png" width="128" height="128" alt="Maho-Mon Icon">
</p>

Claude Codeのトークン使用量をリアルタイムで監視するWebベースのデスクトップペットアプリ — Live2Dキャラクター、ゲーミフィケーション機能、システム監視を搭載。

## 機能

- **Live2Dキャラクター** — 表情とアクションを持つアニメーションペット
- **リアルタイム監視** — トークン数、入力/出力、コスト、モデル名、コンテキスト使用率
- **ペットシステム** — HP、気分、空腹度、経験値、レベルがコーディング活動に連動
- **インタラクション** — 餌やり、遊び、休憩ボタンでアニメーション発動
- **システム監視** — CPU、メモリ使用率表示
- **セッション追跡** — 現在のセッション統計、編集ファイル、Git ブランチ

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand
- **バックエンド**: Node.js + Express
- **Live2D**: pixi-live2d-display + PixiJS 7

## クイックスタート

### 前提条件

- Node.js 18+
- npm

### インストール

```bash
# フロントエンド依存関係をインストール
npm install

# バックエンド依存関係をインストール
cd server && npm install && cd ..
```

### 起動

**方法1：フロントエンドとバックエンドを個別に起動**

```bash
# ターミナル1 - バックエンドサーバー起動
cd server && npm run dev

# ターミナル2 - フロントエンド開発サーバー起動
npm run dev
```

**方法2：同時起動**

```bash
npm run dev:all
```

### アクセス

- フロントエンド: http://localhost:5173
- バックエンド API: http://localhost:3001

## API エンドポイント

| エンドポイント | 説明 |
|---------------|------|
| `GET /api/usage` | Claude使用データを取得 |
| `GET /api/pet` | ペットステータスを取得 |
| `POST /api/pet` | ペットステータスを更新 |
| `POST /api/pet/interact` | インタラクション実行（餌やり/遊び/休憩） |
| `GET /api/system` | システム監視データを取得 |
| `GET /api/health` | ヘルスチェック |

## プロジェクト構成

```
mahomon/
├── src/                    # フロントエンドソース
│   ├── components/         # React コンポーネント
│   │   ├── Live2DCanvas.tsx
│   │   ├── SessionBubble.tsx
│   │   ├── StatsPanel.tsx
│   │   └── SystemMonitor.tsx
│   ├── stores/             # Zustand stores
│   ├── lib/                # コアロジック
│   └── types/              # TypeScript 型定義
├── server/                 # バックエンドソース
│   ├── routes/             # API ルート
│   ├── lib/                # バックエンドロジック
│   │   ├── claudeMonitor.ts
│   │   └── petStorage.ts
│   └── types/
└── public/
    └── assets/live2d/      # Live2D モデルファイル
```

## データソース

以下から Claude Code 使用データを読み込み：

- `~/.claude/stats-cache.json` — 累積トークン統計
- `~/.claude/sessions/*.json` — セッション活動ログ
- `~/.claude/projects/*/*.jsonl` — プロジェクトセッションデータ

## ペットデータ

- ペットステータス: `~/.claude/pet_data.json`

## スクリーンショット

```
┌──────────────────────────────────────────────┐
│  Maho-Mon | Magic Monitor Girl               │
├──────────────────────┬───────────────────────┤
│                      │  統計パネル           │
│  セッションバブル    │  - 総トークン数       │
│  - 現在のセッション   │  - 入力/出力         │
│  - メッセージ数      │  - コスト            │
│  - 使用ツール        │  - モデル名          │
│                      ├───────────────────────┤
│  システム監視        │                       │
│  - CPU使用率         │    Live2D キャラ      │
│  - メモリ            │                       │
│                      │  [餌] [遊び] [休憩]  │
└──────────────────────┴───────────────────────┘
```

## ライセンス

MIT
