import { z } from 'zod';

// Data categories for user selection
export const DataCategorySchema = z.enum([
  'fitness',
  'music',
  'food',
  'finance',
  'productivity',
  'other',
]);

export type DataCategory = z.infer<typeof DataCategorySchema>;

export const DATA_CATEGORIES = [
  { id: 'fitness' as const, label: 'Fitness & Health', icon: 'Activity', examples: 'Strava, MyFitnessPal, Apple Health' },
  { id: 'music' as const, label: 'Music & Listening', icon: 'Music', examples: 'Spotify, Last.fm, Apple Music' },
  { id: 'food' as const, label: 'Food & Nutrition', icon: 'UtensilsCrossed', examples: 'MyFitnessPal, meal logs, recipes' },
  { id: 'finance' as const, label: 'Finance & Spending', icon: 'DollarSign', examples: 'Bank exports, budgets, expenses' },
  { id: 'productivity' as const, label: 'Productivity & Work', icon: 'Briefcase', examples: 'Time tracking, tasks, projects' },
  { id: 'other' as const, label: 'Other', icon: 'FileSpreadsheet', examples: 'Any data you want to visualize!' },
] as const;

// OpenAI model selection
export const OpenAIModelSchema = z.enum([
  'gpt-4o',
  'gpt-4o-mini',
  'o1-pro',
  'o1',
  'o1-mini',
]);
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>;

// Model type classification
export type ModelType = 'standard' | 'reasoning';

// Model configuration metadata
export interface ModelConfig {
  type: ModelType;
  supportsStreaming: boolean;
  supportsTemperature: boolean;
  supportsResponseFormat: boolean;
  maxTokens: number;
  displayName: string;
  description: string;
  tier: 'recommended' | 'budget' | 'standard' | 'advanced' | 'premium';
  warning?: string;
}

export const MODEL_CONFIG: Record<OpenAIModel, ModelConfig> = {
  'gpt-4o': {
    type: 'standard',
    supportsStreaming: true,
    supportsTemperature: true,
    supportsResponseFormat: true,
    maxTokens: 4000,
    displayName: 'GPT-4o',
    description: 'Best balance of quality and speed',
    tier: 'recommended',
  },
  'gpt-4o-mini': {
    type: 'standard',
    supportsStreaming: true,
    supportsTemperature: true,
    supportsResponseFormat: true,
    maxTokens: 4000,
    displayName: 'GPT-4o Mini',
    description: 'Faster and cheaper',
    tier: 'budget',
  },
  'o1-mini': {
    type: 'reasoning',
    supportsStreaming: false,
    supportsTemperature: false,
    supportsResponseFormat: false,
    maxTokens: 16384,
    displayName: 'o1-mini',
    description: 'Fast reasoning model',
    tier: 'standard',
  },
  'o1': {
    type: 'reasoning',
    supportsStreaming: false,
    supportsTemperature: false,
    supportsResponseFormat: false,
    maxTokens: 32768,
    displayName: 'o1',
    description: 'Strong reasoning capabilities',
    tier: 'advanced',
  },
  'o1-pro': {
    type: 'reasoning',
    supportsStreaming: false,
    supportsTemperature: false,
    supportsResponseFormat: false,
    maxTokens: 32768,
    displayName: 'o1-pro',
    description: 'Most powerful reasoning - expensive & slow',
    tier: 'premium',
    warning: 'This model is significantly more expensive and slower. Use for complex analysis.',
  },
};

// Helper functions
export function isReasoningModel(model: OpenAIModel): boolean {
  return MODEL_CONFIG[model].type === 'reasoning';
}

export function getModelConfig(model: OpenAIModel): ModelConfig {
  return MODEL_CONFIG[model];
}

// Generate request schema
export const GenerateRequestSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  model: OpenAIModelSchema,
  dataCategory: DataCategorySchema,
  customDescription: z.string().optional(),
  dataSummary: z.string().min(1, 'Data summary is required'),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// SSE event types
export const SSEEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('progress'),
    stage: z.string(),
    progress: z.number(),
  }),
  z.object({
    type: z.literal('chunk'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('complete'),
    data: z.any(), // WrappedSchema validated separately
  }),
  z.object({
    type: z.literal('error'),
    message: z.string(),
  }),
]);

export type SSEEvent = z.infer<typeof SSEEventSchema>;

// Settings stored in localStorage
export const StoredSettingsSchema = z.object({
  apiKey: z.string().optional(),
  pixabayApiKey: z.string().optional(),
  model: OpenAIModelSchema.default('gpt-4o'),
  preferredCategory: DataCategorySchema.optional(),
  darkMode: z.boolean().default(false),
});

export type StoredSettings = z.infer<typeof StoredSettingsSchema>;
