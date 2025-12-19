import type { MusicMood } from '@wrapp0r/shared';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0/tracks';

// Map Wrapp0r moods to Jamendo tags and speed settings
const MOOD_SEARCH_MAP: Record<MusicMood, { tags: string; speed?: string; vocalinstrumental?: string }> = {
  energetic: { tags: 'energetic+electronic', speed: 'high', vocalinstrumental: 'instrumental' },
  chill: { tags: 'chillout+ambient', speed: 'low', vocalinstrumental: 'instrumental' },
  upbeat: { tags: 'happy+pop', speed: 'medium', vocalinstrumental: 'instrumental' },
  dramatic: { tags: 'epic+cinematic', speed: 'medium', vocalinstrumental: 'instrumental' },
  warm: { tags: 'acoustic+relaxing', speed: 'low', vocalinstrumental: 'instrumental' },
  professional: { tags: 'corporate+ambient', speed: 'medium', vocalinstrumental: 'instrumental' },
};

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

export interface DownloadedTrack {
  filePath: string;
  duration: number;
  artist: string;
  trackName: string;
}

/**
 * Download a music track for video rendering
 * The client_id is passed from the client settings (like OpenAI key)
 */
export async function downloadMusicForRender(
  mood: MusicMood,
  jamendoClientId: string
): Promise<DownloadedTrack | null> {
  if (!jamendoClientId) {
    console.warn('No Jamendo client ID provided - music disabled for video export');
    return null;
  }

  try {
    const searchConfig = MOOD_SEARCH_MAP[mood];
    const params = new URLSearchParams({
      client_id: jamendoClientId,
      format: 'json',
      limit: '10',
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

    console.log(`[Jamendo] Fetching tracks for mood: ${mood}`);
    const response = await fetch(`${JAMENDO_API_BASE}?${params.toString()}`);

    if (!response.ok) {
      console.error(`[Jamendo] API error: ${response.status}`);
      return null;
    }

    const data = await response.json() as JamendoResponse;

    if (!data.results || data.results.length === 0) {
      console.warn(`[Jamendo] No tracks found for mood: ${mood}`);
      return null;
    }

    // Pick a random track from results
    const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
    const track = data.results[randomIndex];

    console.log(`[Jamendo] Selected track: "${track.name}" by ${track.artist_name}`);

    // Download the audio file to a temp location
    const audioUrl = track.audio;
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      console.error(`[Jamendo] Failed to download audio: ${audioResponse.status}`);
      return null;
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const tempDir = os.tmpdir();
    const tempFileName = `wrapp0r-audio-${Date.now()}-${track.id}.mp3`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await fs.writeFile(tempFilePath, Buffer.from(audioBuffer));
    console.log(`[Jamendo] Downloaded audio to: ${tempFilePath}`);

    return {
      filePath: tempFilePath,
      duration: track.duration,
      artist: track.artist_name,
      trackName: track.name,
    };
  } catch (error) {
    console.error('[Jamendo] Error downloading music:', error);
    return null;
  }
}

/**
 * Download audio from a specific URL (used when client provides the track URL)
 */
export async function downloadAudioFromUrl(audioUrl: string): Promise<DownloadedTrack | null> {
  try {
    console.log(`[Audio] Downloading from provided URL: ${audioUrl}`);
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      console.error(`[Audio] Failed to download audio: ${audioResponse.status}`);
      return null;
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const tempDir = os.tmpdir();
    const tempFileName = `wrapp0r-audio-${Date.now()}.mp3`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await fs.writeFile(tempFilePath, Buffer.from(audioBuffer));
    console.log(`[Audio] Downloaded audio to: ${tempFilePath}`);

    return {
      filePath: tempFilePath,
      duration: 0, // Duration not known from URL alone
      artist: 'Unknown',
      trackName: 'Audio Track',
    };
  } catch (error) {
    console.error('[Audio] Error downloading audio from URL:', error);
    return null;
  }
}

/**
 * Clean up a downloaded audio file after rendering
 */
export async function cleanupAudioFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log(`[Jamendo] Cleaned up audio file: ${filePath}`);
  } catch (error) {
    console.warn(`[Jamendo] Failed to clean up audio file: ${filePath}`, error);
  }
}
