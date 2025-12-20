import { z } from 'zod';

// Color theme schema
export const ColorThemeSchema = z.object({
  primary: z.string().describe('Primary color hex code'),
  secondary: z.string().describe('Secondary color hex code'),
  accent: z.string().describe('Accent color hex code'),
  background: z.string().describe('Background color hex code'),
  text: z.string().describe('Text color hex code'),
});

// Animation types
export const AnimationSchema = z.enum([
  'fadeIn',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'scale',
  'bounce',
  'counter',
  'typewriter',
  'stagger',
]);

// Background types
export const BackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'pattern']),
  value: z.string().describe('Color hex, gradient CSS, or pattern name'),
});

// Base slide properties
const BaseSlideSchema = z.object({
  id: z.string(),
  duration: z.number().default(5000).describe('How long to show this slide in ms'),
  animation: AnimationSchema.default('fadeIn'),
  background: BackgroundSchema,
});

// Title slide
export const TitleSlideSchema = BaseSlideSchema.extend({
  type: z.literal('title'),
  content: z.object({
    headline: z.string(),
    subtitle: z.string().optional(),
    year: z.string().optional(),
    emoji: z.string().optional(),
  }),
});

// Stat slide - big number with optional comparison
export const StatSlideSchema = BaseSlideSchema.extend({
  type: z.literal('stat'),
  content: z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    suffix: z.string().optional().describe('e.g., "miles", "hours", "%"'),
    comparison: z.string().optional().describe('e.g., "up 25% from last year"'),
    icon: z.string().optional().describe('Lucide icon name'),
  }),
});

// Chart slide
export const ChartSlideSchema = BaseSlideSchema.extend({
  type: z.literal('chart'),
  content: z.object({
    title: z.string(),
    chartType: z.enum(['bar', 'line', 'pie', 'donut', 'area']),
    data: z.array(z.object({
      label: z.string(),
      value: z.number(),
      color: z.string().optional(),
    })),
    showLegend: z.boolean().default(true),
  }),
});

// List slide - ranked items
export const ListSlideSchema = BaseSlideSchema.extend({
  type: z.literal('list'),
  content: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    items: z.array(z.object({
      rank: z.number().optional(),
      label: z.string(),
      value: z.string().optional(),
      emoji: z.string().optional(),
    })),
    layout: z.enum(['ranked', 'grid', 'horizontal']).default('ranked'),
  }),
});

// Comparison slide - side by side metrics
export const ComparisonSlideSchema = BaseSlideSchema.extend({
  type: z.literal('comparison'),
  content: z.object({
    title: z.string(),
    items: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      icon: z.string().optional(),
    })).min(2).max(4),
  }),
});

// Quote slide - AI insight or observation
export const QuoteSlideSchema = BaseSlideSchema.extend({
  type: z.literal('quote'),
  content: z.object({
    quote: z.string().describe('An insightful or fun observation about the data'),
    attribution: z.string().optional(),
  }),
});

// Summary slide - closing highlights
export const SummarySlideSchema = BaseSlideSchema.extend({
  type: z.literal('summary'),
  content: z.object({
    title: z.string(),
    highlights: z.array(z.object({
      icon: z.string().optional(),
      label: z.string(),
      value: z.string(),
    })),
    closingMessage: z.string(),
  }),
});

// Union of all slide types
export const SlideSchema = z.discriminatedUnion('type', [
  TitleSlideSchema,
  StatSlideSchema,
  ChartSlideSchema,
  ListSlideSchema,
  ComparisonSlideSchema,
  QuoteSlideSchema,
  SummarySlideSchema,
]);

// Music mood for audio selection
export const MusicMoodSchema = z.enum([
  'energetic',
  'chill',
  'upbeat',
  'dramatic',
  'warm',
  'professional',
]);

// Complete Wrapped experience schema
export const WrappedSchema = z.object({
  title: z.string().describe('Title for this wrapped experience'),
  theme: ColorThemeSchema,
  musicMood: MusicMoodSchema.describe('Suggested music mood for the wrapped'),
  slides: z.array(SlideSchema).min(5).max(15),
  metadata: z.object({
    dataType: z.string().describe('What type of data this is, e.g., "Fitness Tracking"'),
    dateRange: z.string().optional().describe('Date range covered'),
    generatedAt: z.string(),
  }),
});

// Export types
export type ColorTheme = z.infer<typeof ColorThemeSchema>;
export type Animation = z.infer<typeof AnimationSchema>;
export type Background = z.infer<typeof BackgroundSchema>;
export type TitleSlide = z.infer<typeof TitleSlideSchema>;
export type StatSlide = z.infer<typeof StatSlideSchema>;
export type ChartSlide = z.infer<typeof ChartSlideSchema>;
export type ListSlide = z.infer<typeof ListSlideSchema>;
export type ComparisonSlide = z.infer<typeof ComparisonSlideSchema>;
export type QuoteSlide = z.infer<typeof QuoteSlideSchema>;
export type SummarySlide = z.infer<typeof SummarySlideSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideType = Slide['type'];
export type MusicMood = z.infer<typeof MusicMoodSchema>;
export type WrappedExperience = z.infer<typeof WrappedSchema>;
