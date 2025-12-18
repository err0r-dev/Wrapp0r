import { Router, Request, Response, type IRouter } from 'express';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router: IRouter = Router();

// Path to pre-bundled Remotion composition
const BUNDLE_PATH = path.join(__dirname, '../../remotion-bundle');

const FPS = 30;

router.post('/render', async (req: Request, res: Response) => {
  const { wrapped } = req.body;

  if (!wrapped) {
    res.status(400).json({ error: 'Missing wrapped data' });
    return;
  }

  // Check if bundle exists
  if (!fs.existsSync(BUNDLE_PATH)) {
    res.status(500).json({
      error: 'Video rendering bundle not found',
      details: 'Please run "pnpm bundle:remotion" in the web package first',
    });
    return;
  }

  const outputPath = path.join(os.tmpdir(), `${uuid()}.mp4`);

  try {
    // Calculate duration from slides
    const totalDurationMs = wrapped.slides.reduce(
      (sum: number, slide: { duration: number }) => sum + slide.duration,
      0
    );
    const durationInFrames = Math.ceil((totalDurationMs / 1000) * FPS);

    console.log(`Starting render: ${durationInFrames} frames @ ${FPS}fps`);

    // Select composition from pre-bundled project
    const composition = await selectComposition({
      serveUrl: BUNDLE_PATH,
      id: 'WrappedVideo',
      inputProps: { wrapped, includeAudio: false },
    });

    // Override duration based on actual slides
    composition.durationInFrames = durationInFrames;

    // Render to MP4
    await renderMedia({
      composition,
      serveUrl: BUNDLE_PATH,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { wrapped, includeAudio: false },
      onProgress: ({ progress }) => {
        console.log(`Render progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log('Render complete, sending file...');

    // Check file exists and get stats
    const stat = fs.statSync(outputPath);

    // Set response headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${wrapped.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'wrapped'}.mp4"`
    );

    // Stream file to client
    const stream = fs.createReadStream(outputPath);

    stream.on('end', () => {
      // Cleanup temp file after streaming
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Failed to cleanup temp file:', err);
      });
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error('Render error:', error);

    // Cleanup temp file on error
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Video rendering failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

export { router as renderRouter };
