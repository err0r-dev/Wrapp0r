import type { MusicMood } from '@wrapp0r/shared';

export interface AudioTrack {
  id: string;
  name: string;
  mood: MusicMood;
  src: string;
  originalUrl?: string; // Original HTTP URL for server-side export (not blob URL)
  duration?: number; // in seconds
  artist?: string;
}

// Audio is now enabled via Pixabay API integration
// Set to false to disable audio entirely
export const AUDIO_ENABLED = true;

// Fallback static tracks (used when API is unavailable)
// These paths are for bundled audio files - add MP3s to public/audio/ if needed
export const fallbackTracks: Record<MusicMood, AudioTrack> = {
  energetic: {
    id: 'energetic',
    name: 'Energetic Beat',
    mood: 'energetic',
    src: '/audio/energetic.mp3',
  },
  chill: {
    id: 'chill',
    name: 'Chill Vibes',
    mood: 'chill',
    src: '/audio/chill.mp3',
  },
  upbeat: {
    id: 'upbeat',
    name: 'Upbeat Pop',
    mood: 'upbeat',
    src: '/audio/upbeat.mp3',
  },
  dramatic: {
    id: 'dramatic',
    name: 'Dramatic Cinematic',
    mood: 'dramatic',
    src: '/audio/dramatic.mp3',
  },
  warm: {
    id: 'warm',
    name: 'Warm Acoustic',
    mood: 'warm',
    src: '/audio/warm.mp3',
  },
  professional: {
    id: 'professional',
    name: 'Professional Ambient',
    mood: 'professional',
    src: '/audio/professional.mp3',
  },
};

// Map music moods to display names
export const moodDisplayNames: Record<MusicMood, string> = {
  energetic: 'Energetic',
  chill: 'Chill',
  upbeat: 'Upbeat',
  dramatic: 'Dramatic',
  warm: 'Warm',
  professional: 'Professional',
};

// Map data categories to suggested music moods
export const categoryMoodMap: Record<string, MusicMood> = {
  fitness: 'energetic',
  music: 'upbeat',
  food: 'warm',
  finance: 'professional',
  productivity: 'chill',
  other: 'upbeat',
};

export function getTrackForMood(mood: MusicMood): AudioTrack {
  return fallbackTracks[mood] || fallbackTracks.upbeat;
}

export function getMoodForCategory(category: string): MusicMood {
  return categoryMoodMap[category] || 'upbeat';
}

export function getMoodDisplayName(mood: MusicMood): string {
  return moodDisplayNames[mood] || mood;
}
