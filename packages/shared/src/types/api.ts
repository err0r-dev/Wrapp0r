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
export const OpenAIModelSchema = z.enum(['gpt-4o', 'gpt-4o-mini']);
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>;

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
  model: OpenAIModelSchema.default('gpt-4o'),
  preferredCategory: DataCategorySchema.optional(),
  darkMode: z.boolean().default(false),
});

export type StoredSettings = z.infer<typeof StoredSettingsSchema>;
