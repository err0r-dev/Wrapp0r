import { Router, type Request, type Response, type IRouter } from 'express';
import { MusicMoodSchema } from '@wrapp0r/shared';
import { getTrackForMood, getAvailableMoods, clearMusicCache } from '../services/pixabay-music.js';

const router: IRouter = Router();

/**
 * GET /api/music/:mood
 * Fetch a music track for a given mood
 */
router.get('/music/:mood', async (req: Request, res: Response) => {
  try {
    const moodResult = MusicMoodSchema.safeParse(req.params.mood);

    if (!moodResult.success) {
      res.status(400).json({
        error: 'Invalid mood',
        validMoods: getAvailableMoods(),
      });
      return;
    }

    const mood = moodResult.data;
    const track = await getTrackForMood(mood);

    if (!track) {
      res.status(503).json({
        error: 'Music service unavailable',
        message: 'Unable to fetch music track. Check PIXABAY_API_KEY configuration.',
      });
      return;
    }

    res.json({
      mood,
      url: track.url,
      duration: track.duration,
      artist: track.artist,
      id: track.id,
    });
  } catch (error) {
    console.error('Music route error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/music
 * List available moods
 */
router.get('/music', (req: Request, res: Response) => {
  res.json({
    moods: getAvailableMoods(),
  });
});

/**
 * POST /api/music/cache/clear
 * Clear the music cache (admin endpoint)
 */
router.post('/music/cache/clear', (req: Request, res: Response) => {
  clearMusicCache();
  res.json({ message: 'Music cache cleared' });
});

export { router as musicRouter };
