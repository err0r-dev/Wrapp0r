# AI Assistant Guide

This document provides context for AI assistants working on the Wrapp0r codebase.

---

## Project Overview

Wrapp0r is a monorepo application that transforms spreadsheet data into Spotify Wrapped-style animated video presentations. Users upload data files (Excel, CSV, JSON), the AI analyses the data and generates personalised slides, which can then be exported as MP4 videos.

**Key user flow:**
1. Upload file → 2. Select/detect category → 3. AI generates slides → 4. Preview with animations → 5. Export video

---

## Package Architecture

```
packages/
├── web/        # React frontend (primary UI)
├── server/     # Express API (AI + video rendering)
├── shared/     # TypeScript types (used by all packages)
└── electron/   # Desktop wrapper (optional)
```

### Package Responsibilities

| Package | Responsibility |
| ------- | -------------- |
| **web** | User interface, file parsing, slide preview, video export UI |
| **server** | OpenAI API calls, prompt construction, Remotion video rendering |
| **shared** | Zod schemas, TypeScript types, theme definitions |
| **electron** | Native desktop app wrapper, file system access |

### Import Pattern
```typescript
// Shared types are imported from @wrapp0r/shared
import { WrappedExperience, DataCategory, ColorTheme } from '@wrapp0r/shared';
```

---

## Key File Locations

### Frontend (packages/web/src/)

| Path | Purpose |
| ---- | ------- |
| `pages/HomePage.tsx` | Main wizard interface |
| `pages/GuidePage.tsx` | "What Can I Wrap?" guide with export instructions |
| `components/wizard/WizardContainer.tsx` | 3-step wizard orchestration |
| `components/wizard/steps/*.tsx` | Upload, Category, Review steps |
| `components/wrapped/WrappedViewer.tsx` | Full-screen slide viewer modal |
| `components/wrapped/SlideRenderer.tsx` | Renders individual slides |
| `components/wrapped/slides/*.tsx` | Slide type components (Stat, Chart, List, etc.) |
| `components/VideoExportModal.tsx` | Export preset selection and progress |
| `components/upload/FileDropzone.tsx` | File upload with parsing |
| `components/upload/CategorySelect.tsx` | Category selection with auto-detect |
| `hooks/useWrappedGeneration.ts` | AI generation state and API calls |
| `hooks/useVideoExport.ts` | Video rendering state and SSE progress |
| `hooks/useAudioPlayer.ts` | Background music playback |
| `lib/api-client.ts` | Server API communication |
| `lib/category-detector.ts` | Auto-detect category from headers |
| `remotion/*.tsx` | Video composition components (separate from preview) |

### Backend (packages/server/src/)

| Path | Purpose |
| ---- | ------- |
| `index.ts` | Express app setup and route mounting |
| `routes/generate.ts` | POST /api/generate - AI content generation |
| `routes/render.ts` | POST /api/render - Video export |
| `routes/music.ts` | GET /api/music - Background music |
| `services/prompt-builder.ts` | Constructs AI prompts with category context |
| `services/render-progress.ts` | Tracks video render progress |
| `services/pixabay-music.ts` | Pixabay Music API integration |
| `services/jamendo-music.ts` | Jamendo Music API integration |

### Shared (packages/shared/src/)

| Path | Purpose |
| ---- | ------- |
| `types/wrapped-schema.ts` | WrappedExperience, Slide types, ColorTheme |
| `types/api.ts` | DATA_CATEGORIES, OpenAI models, API schemas |
| `themes/category-themes.ts` | Predefined colour themes per category |
| `utils/color-utils.ts` | WCAG contrast ratio calculations |

---

## Data Flow

### Generate Flow

```
Client                          Server
──────                          ──────
1. Parse file (SheetJS)
2. Encode to TOON format
3. POST /api/generate ────────► 4. Validate request (Zod)
                                5. Build prompt (category context)
                                6. Call OpenAI API
   ◄──────────────────────────  7. Stream SSE events:
                                   - progress (stage updates)
                                   - chunk (JSON fragments)
                                   - complete (final wrapped)
8. Parse wrapped JSON
9. Display in WrappedViewer
```

### Render Flow

```
Client                          Server
──────                          ──────
1. POST /api/render ──────────► 2. Generate render ID
                                3. Download audio (if needed)
                                4. Copy to remotion-bundle/public/
                                5. Call Remotion renderMedia()
   ◄──────────────────────────  6. Stream progress via SSE
                                7. Stream MP4 file
8. Download video file
```

---

## Schema Definitions

### WrappedExperience (main output)
```typescript
{
  title: string;
  theme: ColorTheme;
  musicMood: 'energetic' | 'chill' | 'upbeat' | 'dramatic' | 'warm' | 'professional';
  slides: Slide[];  // 5-15 slides
  metadata: {
    dataType: string;
    dateRange?: string;
    generatedAt: string;
  }
}
```

### ColorTheme
```typescript
{
  primary: string;    // Main brand colour
  secondary: string;  // Complementary colour
  accent: string;     // Highlight colour
  background: string; // Background colour
  text: string;       // Text colour
}
```

### Slide Types (discriminated union on `type`)
- `title` - Opening slide
- `stat` - Big number display
- `chart` - Data visualisation (bar, line, pie, donut, area)
- `list` - Ranked items
- `comparison` - Side-by-side metrics
- `quote` - Highlighted insight
- `summary` - Closing highlights

### Data Categories
```typescript
type DataCategory = 'fitness' | 'music' | 'food' | 'finance' | 'productivity' | 'entertainment' | 'gaming' | 'other';
```

---

## Theme System

Each category has a predefined theme in `shared/src/themes/category-themes.ts`:

| Category | Primary | Decoration | Style |
| -------- | ------- | ---------- | ----- |
| fitness | #FC4C02 (Strava orange) | particles | bounce |
| music | #059669 (Spotify green) | waves | smooth |
| food | #F97316 (orange) | shapes | bounce |
| finance | #0D9488 (teal) | grid | smooth |
| productivity | #7C3AED (purple) | rings | smooth |
| entertainment | #EA580C (orange) | spotlight | dramatic |
| gaming | #3B82F6 (blue) | glow | snappy |

The `other` category uses AI-generated themes.

**Decorative elements** (7 types): particles, waves, shapes, grid, rings, spotlight, glow

---

## Important Patterns

### SSE Streaming
Both generate and render endpoints use Server-Sent Events for real-time progress:
```typescript
// Server
res.setHeader('Content-Type', 'text/event-stream');
res.write(`data: ${JSON.stringify({ type: 'progress', stage, progress })}\n\n`);

// Client
const eventSource = new EventSource(url);
eventSource.onmessage = (e) => { /* handle events */ };
```

### Dual Model Handling
The server handles two types of OpenAI models differently:
- **Standard models** (gpt-4o, gpt-4o-mini): Use streaming, temperature, response_format
- **Reasoning models** (o1, o1-mini, o1-pro): No streaming, use max_completion_tokens

### Animation Variants
Framer Motion animations are defined in `web/src/lib/animation-variants.ts`:
- fadeIn, slideUp, slideDown, slideLeft, slideRight
- scale, bounce, counter (for numbers), typewriter, stagger

### Reduced Motion
The app respects `prefers-reduced-motion`. Use the hook:
```typescript
const prefersReducedMotion = useReducedMotion();
```

### ParsedFile Type
Defined in `web/src/components/upload/FileDropzone.tsx`:
```typescript
interface ParsedFile {
  name: string;
  sheets: Array<{ name: string; headers: string[]; rowCount: number }>;
  totalRows: number;
}
```

---

## Common Tasks

### Adding a New Slide Type
1. Add schema in `shared/src/types/wrapped-schema.ts`
2. Add component in `web/src/components/wrapped/slides/`
3. Register in `web/src/lib/slide-registry.ts`
4. Add Remotion version in `web/src/remotion/slides/`
5. Update prompt in `server/src/services/prompt-builder.ts`

### Adding a New Data Category
1. Add to `DATA_CATEGORIES` in `shared/src/types/api.ts`
2. Add theme in `shared/src/themes/category-themes.ts`
3. Add detection patterns in `web/src/lib/category-detector.ts`
4. Add context in `server/src/services/prompt-builder.ts`

### Modifying the AI Prompt
Edit `server/src/services/prompt-builder.ts`. Key sections:
- Category-specific context (what to focus on)
- Data accuracy rules (prevent hallucination)
- Slide generation requirements (minimum counts)
- Output schema specification

### Adding a New Export Preset
Edit `web/src/lib/export-presets.ts`:
```typescript
{ id: 'preset-id', name: 'Name', width: 1920, height: 1080, fps: 30, ... }
```

---

## Testing Considerations

- **File parsing**: Test with various Excel, CSV, JSON formats
- **Large files**: Test with files approaching 10MB limit
- **Empty data**: Handle files with no data rows gracefully
- **Category detection**: Test with ambiguous column headers
- **Render cancellation**: Ensure cleanup on client disconnect
- **SSE reconnection**: Handle connection drops during generation

---

## Deployment Notes

### Docker
The `docker/` directory contains full Docker deployment:
- `docker-compose.yml` - Development configuration
- `docker-compose.prod.yml` - Production with resource limits
- `Dockerfile.web` - Nginx frontend (serves at port 80)
- `Dockerfile.server` - Node.js API with Chromium (port 3001)
- `nginx.conf` - Proxy config routing `/api/*` to server
- `DOCKER.md` - Full deployment documentation

**Requirements:**
- Server container needs 2GB+ RAM for video rendering
- Chromium is installed in the server image for Puppeteer/Remotion
- Frontend uses `VITE_API_URL=""` so API calls use relative `/api` paths

**Quick start:**
```bash
cd docker && docker compose build && docker compose up -d
```
Access at http://localhost

### Remotion Bundle
The web package bundles Remotion compositions to `server/remotion-bundle/` during build:
```bash
pnpm --filter @wrapp0r/web bundle:remotion
```
This must run before the server can render videos.

### Environment Variables
Required for production:
- `CORS_ORIGIN` - Set to your frontend domain
- `PIXABAY_API_KEY` - For music in preview (optional)
- `JAMENDO_CLIENT_ID` - For music in video export (optional)

OpenAI API keys are provided by users at runtime, not stored server-side.

---

## Code Style

- **Language**: British English spelling (colour, analyse, categorise)
- **Types**: Use Zod schemas for validation, export TypeScript types from them
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with `cn()` utility for conditional classes
- **Icons**: Lucide React icons

---

## Useful Commands

```bash
pnpm dev:webapp          # Start frontend + backend
pnpm build               # Build all packages
pnpm --filter @wrapp0r/web tsc --noEmit   # Type check frontend
pnpm --filter @wrapp0r/server tsc         # Build server
```
