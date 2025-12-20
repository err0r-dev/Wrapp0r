export interface ExportPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  aspectRatio: string;
  category: 'standard' | 'social';
  description: string;
  platforms?: string[]; // List of platforms this format works for
}

export const exportPresets: ExportPreset[] = [
  // Standard resolutions - Landscape (16:9)
  {
    id: 'hd-720p',
    name: '720p HD',
    width: 1280,
    height: 720,
    fps: 30,
    aspectRatio: '16:9',
    category: 'standard',
    description: 'Good for web sharing',
    platforms: ['Twitter/X', 'Web'],
  },
  {
    id: 'fhd-1080p',
    name: '1080p Full HD',
    width: 1920,
    height: 1080,
    fps: 30,
    aspectRatio: '16:9',
    category: 'standard',
    description: 'Best for most uses',
    platforms: ['YouTube', 'LinkedIn', 'Facebook', 'Vimeo'],
  },
  {
    id: 'uhd-4k',
    name: '4K Ultra HD',
    width: 3840,
    height: 2160,
    fps: 30,
    aspectRatio: '16:9',
    category: 'standard',
    description: 'Highest quality, larger file',
    platforms: ['YouTube 4K', 'Professional'],
  },

  // Portrait (9:16) - consolidated
  {
    id: 'vertical-1080',
    name: 'Vertical HD',
    width: 1080,
    height: 1920,
    fps: 30,
    aspectRatio: '9:16',
    category: 'social',
    description: 'Perfect for mobile-first platforms',
    platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Snapchat'],
  },

  // Square (1:1) - consolidated
  {
    id: 'square-1080',
    name: 'Square HD',
    width: 1080,
    height: 1080,
    fps: 30,
    aspectRatio: '1:1',
    category: 'social',
    description: 'Great for feed posts',
    platforms: ['Instagram Feed', 'Facebook Feed', 'LinkedIn Feed'],
  },
];

export const defaultPreset = exportPresets.find(p => p.id === 'fhd-1080p')!;

export function getPresetById(id: string): ExportPreset | undefined {
  return exportPresets.find(p => p.id === id);
}

export function getPresetsByCategory(category: 'standard' | 'social'): ExportPreset[] {
  return exportPresets.filter(p => p.category === category);
}

export function getPresetsByAspectRatio(aspectRatio: string): ExportPreset[] {
  return exportPresets.filter(p => p.aspectRatio === aspectRatio);
}
