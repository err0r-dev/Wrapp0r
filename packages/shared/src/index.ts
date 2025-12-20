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
  MODEL_CONFIG,
  isReasoningModel,
  getModelConfig,
  GenerateRequestSchema,
  SSEEventSchema,
  StoredSettingsSchema,
} from './types/api.js';

export type {
  DataCategory,
  OpenAIModel,
  ModelType,
  ModelConfig,
  GenerateRequest,
  SSEEvent,
  StoredSettings,
} from './types/api.js';

// Theme exports
export {
  CATEGORY_THEMES,
  getCategoryTheme,
  hasPredefinedTheme,
} from './themes/category-themes.js';

export type {
  CategoryTheme,
  DecorativeElement,
  AnimationSpeed,
  AnimationStyle,
} from './themes/category-themes.js';

// Color utility exports
export {
  getContrastRatio,
  isAccessible,
  getMinimumContrastRatio,
} from './utils/color-utils.js';
