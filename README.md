# Wrapp0r

Transform any spreadsheet into a Spotify Wrapped-style video presentation using AI.

Upload your data. Let AI craft your story. Export a shareable video.

---

## Features

- **Universal Data Support** — Works with fitness logs, music history, spending records, productivity stats, gaming achievements, and more
- **AI-Powered Storytelling** — GPT-4o analyses your data and generates personalised insights with animated slides
- **Video Export** — Download as MP4 in multiple formats (landscape, portrait, square) up to 4K
- **Smart Category Detection** — Automatically identifies your data type from column headers
- **Animated Presentations** — 7 slide types with smooth Framer Motion animations
- **Background Music** — Mood-matched audio tracks via Pixabay and Jamendo APIs
- **Theme System** — Category-specific colour schemes with WCAG AA accessibility compliance
- **Cross-Platform** — Web app plus native desktop apps for macOS, Windows, and Linux
- **Mobile-First** — Touch navigation with swipe gestures and responsive design
- **Accessibility** — Keyboard navigation, reduced motion support, screen reader labels

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages (required first time)
pnpm build

# Start development servers
pnpm dev:webapp
```

Open http://localhost:5173 and add your OpenAI API key in settings.

---

## Supported Data

| Category | Example Sources |
| -------- | --------------- |
| Fitness & Health | Strava, Garmin, Fitbit, Whoop, Apple Health |
| Music & Listening | Spotify, Last.fm, Apple Music, YouTube Music |
| Food & Nutrition | MyFitnessPal, Cronometer, Noom, meal logs |
| Finance & Spending | Bank exports, Mint, YNAB, expense trackers |
| Productivity & Work | Jira, Linear, GitHub, Trello, LinkedIn |
| Entertainment | Letterboxd, Goodreads, IMDb, TV Time |
| Gaming | Steam, PlayStation, Xbox, Nintendo |
| Other | Any structured spreadsheet data |

**Supported file formats:** Excel (.xlsx, .xls), CSV, JSON

**Limits:** 10MB max file size, 5000+ rows triggers a warning

---

## How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Upload    │ → │  Categorise │ → │   Generate  │ → │   Export    │
│  your file  │    │  your data  │    │   wrapped   │    │   video     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

1. **Upload** — Drop an Excel, CSV, or JSON file
2. **Categorise** — Select data type or let AI auto-detect from headers
3. **Generate** — AI analyses your data and creates 8-12 personalised slides
4. **Preview** — Navigate through animated slides with keyboard, mouse, or swipe
5. **Export** — Download as MP4 video to share

---

## Project Structure

```
packages/
├── web/        # React frontend (Vite + Tailwind + Framer Motion)
│   ├── src/
│   │   ├── components/
│   │   │   ├── wizard/      # 3-step upload wizard
│   │   │   ├── wrapped/     # Slide viewer and renderer
│   │   │   ├── upload/      # File dropzone and category select
│   │   │   └── splash/      # Animated splash screen
│   │   ├── hooks/           # useVideoExport, useAudioPlayer, etc.
│   │   ├── remotion/        # Video composition components
│   │   └── pages/           # HomePage, GuidePage
│   └── ...
│
├── server/     # Express API + video renderer
│   └── src/
│       ├── routes/          # generate, render, music, health
│       └── services/        # OpenAI prompts, Remotion, music APIs
│
├── shared/     # TypeScript types and schemas
│   └── src/
│       ├── types/           # Zod schemas for slides, API, settings
│       └── themes/          # Category colour themes
│
└── electron/   # Desktop app wrapper
    └── src/
        ├── main.ts          # Window management, menus
        └── preload.ts       # Secure IPC bridge
```

---

## Development

```bash
pnpm dev:webapp     # Frontend + backend (recommended)
pnpm dev:web        # Frontend only (port 5173)
pnpm dev:server     # Backend only (port 3001)
pnpm build          # Build all packages
pnpm build:electron # Build desktop apps
```

---

## Slide Types

| Type | Description |
| ---- | ----------- |
| **Title** | Opening slide with headline, subtitle, year, emoji |
| **Stat** | Large animated number with label, suffix, comparison |
| **Chart** | Bar, line, pie, donut, or area chart visualisation |
| **List** | Ranked items with emoji (grid, horizontal, or ranked layout) |
| **Comparison** | 2-4 metrics displayed side-by-side |
| **Quote** | Highlighted insight or observation about your data |
| **Summary** | Closing slide with key highlights and message |

Each slide supports custom duration, animation style (fade, slide, scale, bounce), and themed backgrounds.

---

## Video Export

| Preset | Resolution | Aspect Ratio | Best For |
| ------ | ---------- | ------------ | -------- |
| 720p HD | 1280 × 720 | 16:9 | Web sharing |
| 1080p Full HD | 1920 × 1080 | 16:9 | Standard quality |
| 4K Ultra HD | 3840 × 2160 | 16:9 | Professional |
| Vertical HD | 1080 × 1920 | 9:16 | TikTok, Reels, Stories |
| Square HD | 1080 × 1080 | 1:1 | Instagram Feed |

Video rendering is performed server-side using Remotion and Puppeteer.

---

## API Reference

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/generate` | Generate wrapped content (SSE streaming) |
| POST | `/api/render` | Render video, returns MP4 stream |
| GET | `/api/render/progress/:id` | Render progress updates (SSE) |
| POST | `/api/render/cancel/:id` | Cancel active render |
| GET | `/api/music/:mood` | Fetch background track by mood |
| GET | `/api/music` | List available music moods |
| GET | `/api/health` | Health check |

**Music moods:** energetic, chill, upbeat, dramatic, warm, professional

---

## Configuration

### Server Environment Variables

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | Allowed origins | localhost:5173 |
| `PIXABAY_API_KEY` | Pixabay Music API key | — |
| `JAMENDO_CLIENT_ID` | Jamendo API client ID | — |

### Client Settings (localStorage)

- **OpenAI API Key** — Required for generation
- **AI Model** — gpt-4o (recommended), gpt-4o-mini, o1, o1-mini, o1-pro
- **Pixabay API Key** — Optional, for music in preview
- **Theme** — Light, dark, or system preference

---

## AI Models

| Model | Type | Speed | Cost | Best For |
| ----- | ---- | ----- | ---- | -------- |
| gpt-4o | Standard | Fast | $$ | Recommended for most users |
| gpt-4o-mini | Standard | Fastest | $ | Budget-friendly option |
| o1-mini | Reasoning | Medium | $$ | Complex data patterns |
| o1 | Reasoning | Slower | $$$ | Advanced analysis |
| o1-pro | Reasoning | Slowest | $$$$ | Maximum capability |

Reasoning models (o1 series) provide deeper analysis but don't support streaming.

---

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and builds
- Tailwind CSS for styling
- Framer Motion for animations
- Remotion for video composition
- Recharts for data visualisation
- SheetJS for Excel/CSV parsing

### Backend
- Node.js with Express
- OpenAI SDK for AI generation
- Remotion Renderer for video export
- Puppeteer for headless Chrome
- Zod for schema validation

### Desktop
- Electron for native apps
- electron-builder for distribution

### Infrastructure
- Turborepo for monorepo management
- pnpm for package management
- Docker for containerised deployment

---

## Docker

```bash
cd docker
docker-compose up -d
```

Access at http://localhost

---

## Requirements

- Node.js 20+
- pnpm 9+
- OpenAI API key

---

## Licence

[ERR0R.DEV OPEN USE LICENSE](https://github.com/err0r-dev/.github/blob/main/profile/license.md)
