# Wrapp0r

Transform any Excel or CSV data into beautiful "Spotify Wrapped"-style video presentations using AI.

## Features

- **Universal Data Support**: Upload fitness logs, music history, finances, productivity data, or any structured spreadsheet
- **AI-Powered Narratives**: OpenAI GPT-4o analyzes your data and generates personalized, engaging story slides
- **Animated Presentations**: Smooth Framer Motion animations with multiple slide types (stats, charts, lists, comparisons)
- **Video Export**: Server-side rendering with Remotion generates downloadable MP4 videos
- **Mood-Based Audio**: Background music matched to your data theme (energetic, chill, dramatic, etc.)
- **Dark/Light Mode**: Full theme support with system preference detection
- **Responsive Design**: Works across desktop and mobile browsers

## Tech Stack

### Frontend (`packages/web`)
- **React 18** with TypeScript
- **Vite** for development and production builds
- **Tailwind CSS** with custom theming
- **Framer Motion** for slide animations
- **Remotion** for video composition and preview
- **Recharts** for data visualizations
- **SheetJS (xlsx)** for Excel/CSV parsing
- **Lucide React** for icons

### Backend (`packages/server`)
- **Node.js** with Express
- **OpenAI API** for AI-powered slide generation
- **Remotion Renderer** for server-side video rendering
- **Puppeteer** for headless Chrome (pre-bundled at install time)
- **Zod** for request validation

### Shared (`packages/shared`)
- **TypeScript** type definitions
- **Zod schemas** for data validation
- Shared between frontend and backend

### Infrastructure
- **Turborepo** for monorepo management
- **pnpm** for package management
- **Docker** for containerized deployment

## Project Structure

```
wrapp0r/
├── packages/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   │   ├── ui/         # Base UI (button, card, input, etc.)
│   │   │   │   ├── layout/     # Header, ThemeProvider
│   │   │   │   ├── upload/     # FileDropzone, CategorySelect
│   │   │   │   └── wrapped/    # Slide components and viewer
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities and helpers
│   │   │   ├── pages/          # Page components
│   │   │   ├── remotion/       # Remotion video compositions
│   │   │   │   └── slides/     # Video slide components
│   │   │   └── assets/         # Static assets and audio
│   │   └── remotion.config.ts  # Remotion bundler configuration
│   │
│   ├── server/                 # Express backend
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints (generate, render)
│   │   │   ├── services/       # Business logic (OpenAI, etc.)
│   │   │   └── middleware/     # Express middleware
│   │   └── remotion-bundle/    # Pre-bundled Remotion compositions (generated)
│   │
│   ├── shared/                 # Shared TypeScript types
│   │   └── src/
│   │       └── types/          # Zod schemas and type definitions
│   │
│   └── electron/               # Desktop app (future)
│
├── docker/                     # Docker configuration
├── turbo.json                  # Turborepo configuration
└── pnpm-workspace.yaml         # pnpm workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wrapp0r.git
cd wrapp0r

# Install dependencies (includes Chromium for video rendering)
pnpm install

# Build all packages (required before first run)
pnpm build
```

> **Note:** The `pnpm build` step compiles the shared TypeScript types and bundles the Remotion video compositions. This is required before running the development server for the first time. Subsequent runs only need `pnpm dev:webapp`.

### Development

```bash
# Start both frontend and backend
pnpm dev:webapp

# Or start individually
pnpm dev:web      # Frontend on http://localhost:5173
pnpm dev:server   # Backend on http://localhost:3001
```

### Production Build

```bash
# Build all packages (includes Remotion bundle)
pnpm build

# Build individually
pnpm build:web     # Builds Remotion bundle + Vite production build
pnpm build:server  # Compiles TypeScript
```

### Docker Deployment

```bash
cd docker
docker-compose up -d

# Access at http://localhost
```

## How It Works

1. **Upload**: Drag and drop an Excel (.xlsx) or CSV file
2. **Categorize**: Select the data type (fitness, music, finance, etc.) or let AI detect it
3. **Generate**: AI analyzes your data and creates a personalized wrapped experience with 8-12 slides
4. **Preview**: Navigate through animated slides with swipe gestures or keyboard
5. **Export**: Download as an MP4 video to share

## API Endpoints

### `POST /api/generate`
Generate wrapped slides from uploaded data.

**Request:**
```json
{
  "data": "parsed spreadsheet data",
  "category": "fitness",
  "apiKey": "sk-..."
}
```

**Response:**
```json
{
  "wrapped": {
    "title": "Your 2024 Fitness Wrapped",
    "theme": { ... },
    "slides": [ ... ],
    "musicMood": "energetic"
  }
}
```

### `POST /api/render`
Render wrapped experience to MP4 video.

**Request:**
```json
{
  "wrapped": { ... }
}
```

**Response:** Binary MP4 file stream

## Configuration

### Environment Variables

**Server:**
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins

### Client Settings (stored in localStorage)
- OpenAI API key
- Preferred AI model (GPT-4o / GPT-4o-mini)
- Theme preference (light/dark/system)

## Slide Types

| Type | Description |
|------|-------------|
| `title` | Opening slide with headline and subtitle |
| `stat` | Single large statistic with optional icon |
| `chart` | Bar, line, or pie chart visualization |
| `list` | Ranked or bullet list of items |
| `comparison` | Side-by-side metric comparison |
| `quote` | Highlighted insight or fun fact |
| `summary` | Closing slide with key highlights |

## Video Export Architecture

Video export uses server-side rendering for reliable, high-quality output:

1. **Remotion Bundle**: Compositions are pre-bundled during `pnpm build:web`
2. **Puppeteer**: Chrome is pre-installed via puppeteer at `npm install` time (no runtime download)
3. **Server Rendering**: The `/api/render` endpoint uses `@remotion/renderer` to generate MP4
4. **Streaming Response**: Video is streamed directly to the client for download

## License

MIT
