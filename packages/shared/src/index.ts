// Schema exports
export {
  ColorThemeSchema,
  AnimationSchema,
  BackgroundSchema,
  TitleSlideSchema,
  StatSlideSchema,
  ChartSlideSchema,
  ListSlideSchema,
  ComparisonSlideSchema,
  QuoteSlideSchema,
  SummarySlideSchema,
  SlideSchema,
  MusicMoodSchema,
  WrappedSchema,
} from './types/wrapped-schema.js';

// Type exports
export type {
  ColorTheme,
  Animation,
  Background,
  TitleSlide,
  StatSlide,
  ChartSlide,
  ListSlide,
  ComparisonSlide,
  QuoteSlide,
  SummarySlide,
  Slide,
  SlideType,
  MusicMood,
  WrappedExperience,
} from './types/wrapped-schema.js';

// API exports
export {
  DataCategorySchema,
  DATA_CATEGORIES,
  OpenAIModelSchema,
  GenerateRequestSchema,
  SSEEventSchema,
  StoredSettingsSchema,
} from './types/api.js';

export type {
  DataCategory,
  OpenAIModel,
  GenerateRequest,
  SSEEvent,
  StoredSettings,
} from './types/api.js';
