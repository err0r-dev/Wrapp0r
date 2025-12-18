# Wrapp0r

Transform any Excel data into beautiful "Spotify Wrapped"-style visualizations using AI.

## Features

- **Any Data Works**: Upload fitness data, music history, finances, productivity logs - anything in Excel format
- **AI-Powered Insights**: GPT-4o analyzes your data and creates personalized, engaging narratives
- **Beautiful Animations**: Framer Motion-powered slides with smooth transitions
- **Theme-Based Music**: Background music matched to your data category
- **Video Export**: Download your wrapped as a shareable MP4
- **Dark Mode**: Full dark/light mode support
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-4o with structured JSON output
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Excel Parsing**: SheetJS (xlsx)
- **Desktop**: Electron (coming soon)
- **Deployment**: Docker

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

# Install dependencies
pnpm install

# Build shared package
pnpm --filter @wrapp0r/shared build
```

### Development

```bash
# Start both frontend and backend in development mode
pnpm dev

# Or start individually
pnpm dev:web    # Frontend on http://localhost:5173
pnpm dev:server # Backend on http://localhost:3001
```

### Production Build

```bash
# Build all packages
pnpm build

# Or build individually
pnpm build:web
pnpm build:server
```

### Docker Deployment

```bash
# Build and run with Docker Compose
cd docker
docker-compose up -d

# Access the app at http://localhost
```

## Project Structure

```
wrapp0r/
├── packages/
│   ├── web/        # React frontend
│   ├── server/     # Express backend
│   ├── electron/   # Desktop app (coming soon)
│   └── shared/     # Shared types and schemas
├── docker/         # Docker configuration
└── turbo.json      # Turborepo config
```

## How It Works

1. **Upload**: Drag and drop your Excel file
2. **Categorize**: Tell us what kind of data it is (fitness, music, food, etc.)
3. **Generate**: AI analyzes your data and creates a personalized wrapped experience
4. **Enjoy**: Navigate through animated slides with insights about your data
5. **Share**: Download as video to share with friends

## Configuration

### Environment Variables

**Server:**
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins in production

### Settings

The app stores settings locally in your browser:
- OpenAI API key (encrypted)
- Preferred AI model (GPT-4o or GPT-4o-mini)
- Theme preference (light/dark/system)

## Data Categories

- **Fitness & Health**: Strava, MyFitnessPal, Apple Health exports
- **Music & Listening**: Spotify, Last.fm, Apple Music history
- **Food & Nutrition**: Meal logs, nutrition tracking
- **Finance & Spending**: Bank exports, budgets, expenses
- **Productivity & Work**: Time tracking, task management
- **Other**: Any structured data!

## Token Efficiency

Wrapp0r uses TOON (Token-Oriented Object Notation) format to send data to OpenAI, reducing token usage by ~40% compared to JSON while maintaining high accuracy.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
