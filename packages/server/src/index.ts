import express, { Express } from 'express';
import cors from 'cors';
import { generateRouter } from './routes/generate.js';
import { healthRouter } from './routes/health.js';
import { renderRouter } from './routes/render.js';
import { errorHandler } from './middleware/error-handler.js';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', healthRouter);
app.use('/api', generateRouter);
app.use('/api', renderRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
