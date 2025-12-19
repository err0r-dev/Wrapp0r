import { Router, Request, Response, type IRouter } from 'express';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { downloadMusicForRender, downloadAudioFromUrl, cleanupAudioFile } from '../services/jamendo-music.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router: IRouter = Router();

// Path to pre-bundled Remotion composition
const BUNDLE_PATH = path.join(__dirname, '../../remotion-bundle');

// Directory to store audio files for serving during render
const AUDIO_SERVE_DIR = path.join(BUNDLE_PATH, 'public', 'audio');

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_SERVE_DIR)) {
  fs.mkdirSync(AUDIO_SERVE_DIR, { recursive: true });
}

const FPS = 30;

router.post('/render', async (req: Request, res: Response) => {
  const { wrapped, jamendoClientId, audioUrl } = req.body;

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
  let audioFilePath: string | null = null;

  try {
    // Calculate duration from slides
    const totalDurationMs = wrapped.slides.reduce(
      (sum: number, slide: { duration: number }) => sum + slide.duration,
      0
    );
    const durationInFrames = Math.ceil((totalDurationMs / 1000) * FPS);

    console.log(`Starting render: ${durationInFrames} frames @ ${FPS}fps`);

    // Download audio - prioritize provided audioUrl (same track as preview), fall back to random
    let includeAudio = false;
    let audioFileName: string | null = null;

    console.log(`Audio config: audioUrl=${audioUrl ? 'provided' : 'none'}, jamendoClientId=${jamendoClientId ? 'provided' : 'none'}, musicMood=${wrapped.musicMood}`);

    // Try to download audio from the provided URL first (same track as preview)
    if (audioUrl) {
      console.log(`Downloading audio from provided URL: ${audioUrl.substring(0, 50)}...`);
      const audioTrack = await downloadAudioFromUrl(audioUrl);
      if (audioTrack) {
        audioFileName = `render-audio-${uuid()}.mp3`;
        const audioServePath = path.join(AUDIO_SERVE_DIR, audioFileName);
        fs.copyFileSync(audioTrack.filePath, audioServePath);
        audioFilePath = audioServePath;
        includeAudio = true;
        console.log(`Audio downloaded from provided URL`);
        cleanupAudioFile(audioTrack.filePath);
      } else {
        console.log(`Failed to download from provided URL, will try Jamendo fallback`);
      }
    }

    // Fall back to fetching a new track if no audio yet (either no URL provided or download failed)
    if (!includeAudio && jamendoClientId && wrapped.musicMood) {
      console.log(`Downloading audio for mood: ${wrapped.musicMood} (fallback)`);
      const audioTrack = await downloadMusicForRender(wrapped.musicMood, jamendoClientId);
      if (audioTrack) {
        // Copy audio to the bundle's public directory so Remotion can serve it
        audioFileName = `render-audio-${uuid()}.mp3`;
        const audioServePath = path.join(AUDIO_SERVE_DIR, audioFileName);
        fs.copyFileSync(audioTrack.filePath, audioServePath);
        audioFilePath = audioServePath;
        includeAudio = true;
        console.log(`Audio downloaded: ${audioTrack.trackName} by ${audioTrack.artist}`);
        // Clean up the original temp file
        cleanupAudioFile(audioTrack.filePath);
      }
    }

    if (!includeAudio) {
      console.log(`No audio will be included in the video`);
    }

    // Build input props with optional audio
    // Use relative path that Remotion's static file server can serve
    const inputProps = {
      wrapped,
      includeAudio,
      audioSrc: audioFileName ? `/public/audio/${audioFileName}` : undefined,
    };

    // Select composition from pre-bundled project
    const composition = await selectComposition({
      serveUrl: BUNDLE_PATH,
      id: 'WrappedVideo',
      inputProps,
    });

    // Override duration based on actual slides
    composition.durationInFrames = durationInFrames;

    // Render to MP4
    await renderMedia({
      composition,
      serveUrl: BUNDLE_PATH,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
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
      // Cleanup temp files after streaming
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Failed to cleanup temp video file:', err);
      });
      // Cleanup audio file from serve directory
      if (audioFilePath && fs.existsSync(audioFilePath)) {
        fs.unlink(audioFilePath, (err) => {
          if (err) console.error('Failed to cleanup audio file:', err);
        });
      }
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

    // Cleanup temp files on error
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    if (audioFilePath && fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }

    if (!res.headersSent) {
      // Provide more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('Full error stack:', errorStack);

      res.status(500).json({
        error: 'Video rendering failed',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      });
    }
  }
});

export { router as renderRouter };
