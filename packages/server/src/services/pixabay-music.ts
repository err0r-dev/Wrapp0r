import type { MusicMood } from '@wrapp0r/shared';

interface PixabayHit {
  id: number;
  tags: string;
  duration: number;
  audio_url: string;
  audio_download_url: string;
  user: string;
  user_id: number;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayHit[];
}

interface CachedTrack {
  url: string;
  duration: number;
  id: number;
  artist: string;
  expiresAt: number;
}

// In-memory cache for music tracks (15 minute TTL)
const musicCache = new Map<MusicMood, CachedTrack>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Map Wrapp0r moods to Pixabay search queries
const MOOD_SEARCH_MAP: Record<MusicMood, { query: string; category?: string }> = {
  energetic: { query: 'energetic upbeat electronic', category: 'beats' },
  chill: { query: 'chill relaxing lofi', category: 'ambient' },
  upbeat: { query: 'upbeat happy positive', category: 'pop' },
  dramatic: { query: 'dramatic cinematic epic', category: 'cinematic' },
  warm: { query: 'warm acoustic folk', category: 'acoustic' },
  professional: { query: 'corporate ambient business', category: 'ambient' },
};

/**
 * Fetch a music track from Pixabay API for a given mood
 */
export async function getTrackForMood(mood: MusicMood): Promise<CachedTrack | null> {
  // Check cache first
  const cached = musicCache.get(mood);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.warn('PIXABAY_API_KEY not set - music features disabled');
    return null;
  }

  const searchConfig = MOOD_SEARCH_MAP[mood];
  const params = new URLSearchParams({
    key: apiKey,
    q: searchConfig.query,
    per_page: '10',
    min_duration: '60',
    max_duration: '180',
    safesearch: 'true',
  });

  if (searchConfig.category) {
    params.set('category', searchConfig.category);
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/videos/music/?${params.toString()}`
    );

    if (!response.ok) {
      console.error(`Pixabay API error: ${response.status}`);
      return null;
    }

    const data = await response.json() as PixabayResponse;

    if (data.hits.length === 0) {
      console.warn(`No tracks found for mood: ${mood}`);
      return null;
    }

    // Pick a random track from the results for variety
    const randomIndex = Math.floor(Math.random() * data.hits.length);
    const hit = data.hits[randomIndex];

    const track: CachedTrack = {
      id: hit.id,
      url: hit.audio_download_url || hit.audio_url,
      duration: hit.duration,
      artist: hit.user,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    // Cache the result
    musicCache.set(mood, track);

    return track;
  } catch (error) {
    console.error('Error fetching from Pixabay:', error);
    return null;
  }
}

/**
 * Get all available moods
 */
export function getAvailableMoods(): MusicMood[] {
  return Object.keys(MOOD_SEARCH_MAP) as MusicMood[];
}

/**
 * Clear the music cache
 */
export function clearMusicCache(): void {
  musicCache.clear();
}
