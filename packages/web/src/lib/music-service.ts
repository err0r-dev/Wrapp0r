import type { MusicMood } from '@wrapp0r/shared';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0/tracks';
const IDB_STORE_NAME = 'music-cache';
const IDB_DB_NAME = 'wrapp0r-music';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Map Wrapp0r moods to Jamendo tags and speed settings
const MOOD_SEARCH_MAP: Record<MusicMood, { tags: string; speed?: string; vocalinstrumental?: string }> = {
  energetic: { tags: 'energetic+electronic', speed: 'high', vocalinstrumental: 'instrumental' },
  chill: { tags: 'chillout+ambient', speed: 'low', vocalinstrumental: 'instrumental' },
  upbeat: { tags: 'happy+pop', speed: 'medium', vocalinstrumental: 'instrumental' },
  dramatic: { tags: 'epic+cinematic', speed: 'medium', vocalinstrumental: 'instrumental' },
  warm: { tags: 'acoustic+relaxing', speed: 'low', vocalinstrumental: 'instrumental' },
  professional: { tags: 'corporate+ambient', speed: 'medium', vocalinstrumental: 'instrumental' },
};

interface CachedMusic {
  mood: MusicMood;
  url: string;
  blob: Blob;
  duration: number;
  artist: string;
  cachedAt: number;
}

interface MusicTrackResponse {
  mood: MusicMood;
  url: string;
  duration: number;
  artist: string;
  id: number;
}

/**
 * Open IndexedDB for music caching
 */
async function openMusicDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: 'mood' });
      }
    };
  });
}

/**
 * Get cached music from IndexedDB
 */
async function getCachedMusic(mood: MusicMood): Promise<CachedMusic | null> {
  try {
    const db = await openMusicDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.get(mood);

      request.onerror = () => resolve(null);
      request.onsuccess = () => {
        const cached = request.result as CachedMusic | undefined;
        if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
          resolve(cached);
        } else {
          resolve(null);
        }
      };
    });
  } catch {
    return null;
  }
}

/**
 * Cache music in IndexedDB
 */
async function cacheMusic(data: CachedMusic): Promise<void> {
  try {
    const db = await openMusicDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Failed to cache music:', error);
  }
}

interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  audio: string;
  audiodownload: string;
}

interface JamendoResponse {
  headers: {
    status: string;
    code: number;
    results_count: number;
  };
  results: JamendoTrack[];
}

/**
 * Fetch music track for a given mood
 * Uses client-side Jamendo API with IndexedDB caching
 */
export async function fetchMusicTrack(
  mood: MusicMood,
  jamendoClientId?: string
): Promise<{
  url: string;
  originalUrl: string; // Original Jamendo URL for server-side export
  duration: number;
  artist: string;
} | null> {
  // Check IndexedDB cache first
  const cached = await getCachedMusic(mood);
  if (cached) {
    return {
      url: URL.createObjectURL(cached.blob),
      originalUrl: cached.url, // Return the original URL for export
      duration: cached.duration,
      artist: cached.artist,
    };
  }

  // If no API key provided, cannot fetch
  if (!jamendoClientId) {
    console.warn('No Jamendo client ID provided - music disabled');
    return null;
  }

  try {
    // Fetch from Jamendo API (client-side)
    const searchConfig = MOOD_SEARCH_MAP[mood];
    const params = new URLSearchParams({
      client_id: jamendoClientId,
      format: 'json',
      limit: '20',
      fuzzytags: searchConfig.tags,
      audioformat: 'mp32', // MP3 320kbps
      include: 'musicinfo',
      boost: 'popularity_total',
    });

    if (searchConfig.speed) {
      params.set('speed', searchConfig.speed);
    }
    if (searchConfig.vocalinstrumental) {
      params.set('vocalinstrumental', searchConfig.vocalinstrumental);
    }

    const response = await fetch(`${JAMENDO_API_BASE}?${params.toString()}`);

    if (!response.ok) {
      console.warn(`Jamendo API error: ${response.status}`);
      return null;
    }

    const data = await response.json() as JamendoResponse;

    if (!data.results || data.results.length === 0) {
      console.warn(`No tracks found for mood: ${mood}`);
      return null;
    }

    // Pick a random track from results for variety
    const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
    const track = data.results[randomIndex];

    const audioUrl = track.audio;

    // Download the audio file for caching
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      console.warn('Failed to download audio file');
      // Still return the streaming URL even if caching fails
      return {
        url: audioUrl,
        originalUrl: audioUrl,
        duration: track.duration,
        artist: track.artist_name,
      };
    }

    const blob = await audioResponse.blob();

    // Cache for offline use
    await cacheMusic({
      mood,
      url: audioUrl,
      blob,
      duration: track.duration,
      artist: track.artist_name,
      cachedAt: Date.now(),
    });

    return {
      url: URL.createObjectURL(blob),
      originalUrl: audioUrl, // Keep the original URL for export
      duration: track.duration,
      artist: track.artist_name,
    };
  } catch (error) {
    console.error('Error fetching music:', error);
    return null;
  }
}

/**
 * Preload music for faster playback
 */
export async function preloadMusic(mood: MusicMood, jamendoClientId?: string): Promise<void> {
  const cached = await getCachedMusic(mood);
  if (!cached && jamendoClientId) {
    await fetchMusicTrack(mood, jamendoClientId);
  }
}

/**
 * Clear all cached music
 */
export async function clearMusicCache(): Promise<void> {
  try {
    const db = await openMusicDB();
    const transaction = db.transaction(IDB_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IDB_STORE_NAME);
    store.clear();
  } catch (error) {
    console.warn('Failed to clear music cache:', error);
  }
}

/**
 * Check if Jamendo API is reachable with the provided client ID
 */
export async function isMusicServiceAvailable(jamendoClientId?: string): Promise<boolean> {
  if (!jamendoClientId) return false;

  try {
    const response = await fetch(`${JAMENDO_API_BASE}?client_id=${jamendoClientId}&format=json&limit=1`);
    const data = await response.json() as JamendoResponse;
    return data.headers?.status === 'success';
  } catch {
    return false;
  }
}

/**
 * Fetch a new random track for a given mood (bypasses cache)
 * Used for skip functionality to get a different track
 */
export async function fetchNewTrack(
  mood: MusicMood,
  jamendoClientId?: string,
  excludeTrackId?: number
): Promise<{
  url: string;
  originalUrl: string;
  duration: number;
  artist: string;
  id: number;
} | null> {
  if (!jamendoClientId) {
    console.warn('No Jamendo client ID provided - cannot skip track');
    return null;
  }

  try {
    const searchConfig = MOOD_SEARCH_MAP[mood];
    const params = new URLSearchParams({
      client_id: jamendoClientId,
      format: 'json',
      limit: '20',
      fuzzytags: searchConfig.tags,
      audioformat: 'mp32',
      include: 'musicinfo',
      boost: 'popularity_total',
    });

    if (searchConfig.speed) {
      params.set('speed', searchConfig.speed);
    }
    if (searchConfig.vocalinstrumental) {
      params.set('vocalinstrumental', searchConfig.vocalinstrumental);
    }

    const response = await fetch(`${JAMENDO_API_BASE}?${params.toString()}`);

    if (!response.ok) {
      console.warn(`Jamendo API error: ${response.status}`);
      return null;
    }

    const data = await response.json() as JamendoResponse;

    if (!data.results || data.results.length === 0) {
      console.warn(`No tracks found for mood: ${mood}`);
      return null;
    }

    // Filter out the current track if provided
    let availableTracks = data.results;
    if (excludeTrackId) {
      availableTracks = data.results.filter(t => t.id !== String(excludeTrackId));
      if (availableTracks.length === 0) {
        availableTracks = data.results; // Fall back to all tracks if filtering removes all
      }
    }

    // Pick a random track from results
    const randomIndex = Math.floor(Math.random() * Math.min(availableTracks.length, 10));
    const track = availableTracks[randomIndex];

    return {
      url: track.audio,
      originalUrl: track.audio, // Same as url since this is direct from API
      duration: track.duration,
      artist: track.artist_name,
      id: parseInt(track.id, 10),
    };
  } catch (error) {
    console.error('Error fetching new track:', error);
    return null;
  }
}
