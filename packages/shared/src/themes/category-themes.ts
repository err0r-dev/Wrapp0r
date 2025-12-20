/**
 * Bespoke themes for each data category
 * All themes are WCAG AA compliant
 */

import type { DataCategory } from '../types/api.js';

export type DecorativeElement = 'particles' | 'waves' | 'shapes' | 'grid' | 'rings' | 'spotlight' | 'glow';
export type AnimationSpeed = 'fast' | 'normal' | 'slow';
export type AnimationStyle = 'bounce' | 'smooth' | 'dramatic' | 'snappy';

export interface CategoryTheme {
  /** Primary brand color */
  primary: string;
  /** Secondary/complementary color */
  secondary: string;
  /** Accent color for highlights */
  accent: string;
  /** Background color */
  background: string;
  /** Text color */
  text: string;
  /** Gradient options for slide backgrounds */
  gradients: {
    /** Primary gradient - vibrant, energetic */
    primary: string;
    /** Secondary gradient - subtle, supportive */
    secondary: string;
  };
  /** Chart color palette (accessible, ordered by visual weight) */
  chart: {
    colors: string[];
  };
  /** Decorative element type for this category */
  decorativeElement: DecorativeElement;
  /** Animation speed for this category */
  animationSpeed: AnimationSpeed;
  /** Animation style/easing for this category */
  animationStyle: AnimationStyle;
}

/**
 * Brand-inspired LIGHT themes for each known data category
 * All themes use light backgrounds with brand accent colors
 * 'other' category is not included - AI generates themes for that
 */
export const CATEGORY_THEMES: Record<Exclude<DataCategory, 'other'>, CategoryTheme> = {
  // Strava-inspired - energetic orange on warm white
  fitness: {
    primary: '#FC4C02',
    secondary: '#FF6B35',
    accent: '#0891B2',
    background: '#FFF7ED',
    text: '#1C1917',
    gradients: {
      primary: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)',
      secondary: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
    },
    chart: { colors: ['#EA580C', '#DC2626', '#0891B2', '#059669', '#CA8A04', '#7C3AED'] },
    decorativeElement: 'particles',
    animationSpeed: 'fast',
    animationStyle: 'bounce',
  },

  // Spotify-inspired - green on mint white
  music: {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#DB2777',
    background: '#ECFDF5',
    text: '#1C1917',
    gradients: {
      primary: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)',
      secondary: 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)',
    },
    chart: { colors: ['#059669', '#DB2777', '#0891B2', '#7C3AED', '#EA580C', '#CA8A04'] },
    decorativeElement: 'waves',
    animationSpeed: 'normal',
    animationStyle: 'smooth',
  },

  // Fresh/Natural - healthy green on soft green
  food: {
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#16A34A',
    background: '#FEF7CD',
    text: '#1C1917',
    gradients: {
      primary: 'linear-gradient(135deg, #FEF7CD 0%, #FDE68A 50%, #FCD34D 100%)',
      secondary: 'linear-gradient(135deg, #FFFFFF 0%, #FEF7CD 100%)',
    },
    chart: { colors: ['#F97316', '#16A34A', '#CA8A04', '#0891B2', '#DB2777', '#7C3AED'] },
    decorativeElement: 'shapes',
    animationSpeed: 'normal',
    animationStyle: 'bounce',
  },

  // Mint-inspired - professional teal on soft teal
  finance: {
    primary: '#0D9488',
    secondary: '#14B8A6',
    accent: '#CA8A04',
    background: '#F0FDFA',
    text: '#1C1917',
    gradients: {
      primary: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 50%, #99F6E4 100%)',
      secondary: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)',
    },
    chart: { colors: ['#0D9488', '#CA8A04', '#14B8A6', '#EA580C', '#7C3AED', '#DB2777'] },
    decorativeElement: 'grid',
    animationSpeed: 'slow',
    animationStyle: 'smooth',
  },

  // Linear-inspired - modern purple on soft indigo
  productivity: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    accent: '#0891B2',
    background: '#F5F3FF',
    text: '#1C1917',
    gradients: {
      primary: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)',
      secondary: 'linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)',
    },
    chart: { colors: ['#7C3AED', '#0891B2', '#8B5CF6', '#059669', '#EA580C', '#DB2777'] },
    decorativeElement: 'rings',
    animationSpeed: 'normal',
    animationStyle: 'smooth',
  },

  // Letterboxd-inspired - cinematic orange on warm cream
  entertainment: {
    primary: '#EA580C',
    secondary: '#F59E0B',
    accent: '#0EA5E9',
    background: '#FFFBEB',
    text: '#1C1917',
    gradients: {
      primary: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
      secondary: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)',
    },
    chart: { colors: ['#EA580C', '#F59E0B', '#0EA5E9', '#CA8A04', '#DB2777', '#7C3AED'] },
    decorativeElement: 'spotlight',
    animationSpeed: 'normal',
    animationStyle: 'dramatic',
  },

  // Steam-inspired - cool blue on soft sky
  gaming: {
    primary: '#3B82F6',
    secondary: '#06B6D4',
    accent: '#10B981',
    background: '#EFF6FF',
    text: '#1C1917',
    gradients: {
      primary: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)',
      secondary: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
    },
    chart: { colors: ['#3B82F6', '#06B6D4', '#10B981', '#CA8A04', '#EA580C', '#7C3AED'] },
    decorativeElement: 'glow',
    animationSpeed: 'fast',
    animationStyle: 'snappy',
  },
};

/**
 * Get the predefined theme for a category
 * Returns null for 'other' category (AI should generate theme)
 */
export function getCategoryTheme(category: DataCategory): CategoryTheme | null {
  if (category === 'other') {
    return null;
  }
  return CATEGORY_THEMES[category];
}

/**
 * Check if a category has a predefined theme
 */
export function hasPredefinedTheme(category: DataCategory): boolean {
  return category !== 'other';
}
