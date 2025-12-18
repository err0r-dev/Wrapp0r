import type { MusicMood } from '@wrapp0r/shared';

export interface AudioTrack {
  id: string;
  name: string;
  mood: MusicMood;
  src: string;
  duration?: number; // in seconds
}

// Map music moods to their corresponding audio tracks
// These are placeholder paths - replace with actual royalty-free audio files
// Recommended sources:
// - Pixabay Music (https://pixabay.com/music/)
// - Free Music Archive (https://freemusicarchive.org/)
// - Uppbeat (https://uppbeat.io/)

export const audioTracks: Record<MusicMood, AudioTrack> = {
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
  return audioTracks[mood] || audioTracks.upbeat;
}

export function getMoodForCategory(category: string): MusicMood {
  return categoryMoodMap[category] || 'upbeat';
}
