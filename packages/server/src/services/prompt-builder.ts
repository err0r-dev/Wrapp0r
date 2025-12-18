import type { DataCategory } from '@wrapp0r/shared';

const CATEGORY_CONTEXTS: Record<DataCategory, string> = {
  fitness: 'This is fitness/health tracking data. Focus on achievements, personal records, consistency, and progress. Use energetic, motivating language.',
  music: 'This is music listening data. Focus on top artists, genres, listening trends, and memorable discoveries. Use dynamic, expressive language.',
  food: 'This is food/nutrition data. Focus on eating patterns, favorite foods, nutritional insights, and culinary adventures. Use warm, appetizing language.',
  finance: 'This is financial/spending data. Focus on spending patterns, savings achievements, and smart money moves. Use professional, confident language.',
  productivity: 'This is productivity/work data. Focus on accomplishments, time management, and growth. Use focused, achievement-oriented language.',
  other: 'This is general data. Identify the most interesting patterns and create engaging insights based on what you discover.',
};

const MUSIC_MOODS: Record<DataCategory, string> = {
  fitness: 'energetic',
  music: 'upbeat',
  food: 'warm',
  finance: 'professional',
  productivity: 'chill',
  other: 'upbeat',
};

export function buildWrappedPrompt(
  dataSummary: string,
  category: DataCategory,
  customDescription?: string
): string {
  const categoryContext = CATEGORY_CONTEXTS[category];
  const suggestedMood = MUSIC_MOODS[category];

  return `Create a "Spotify Wrapped"-style experience for the following data.

## Data Context
${categoryContext}
${customDescription ? `\nAdditional context from user: ${customDescription}` : ''}

## Data (TOON Format)
\`\`\`
${dataSummary}
\`\`\`

## Your Task
1. Analyze the data to find the most interesting patterns, trends, and insights
2. Create a sequence of 8-12 slides that tell a compelling data story
3. Use creative, engaging headlines (make them punchy and memorable!)
4. Choose appropriate visualizations for each insight
5. Design a cohesive color theme that matches the ${category} theme

## Slide Requirements
- Start with an exciting title slide introducing the wrapped
- Include at least 2 stat slides with big numbers
- Include at least 1 chart slide (bar, line, or pie)
- Include at least 1 list slide (top items, rankings)
- Add fun comparisons where possible (e.g., "That's enough to circle the Earth 3 times!")
- End with a summary slide highlighting key achievements
- Include at least 1 quote slide with an insightful observation

## Response Format
Respond with a JSON object matching this exact structure:
{
  "title": "string - catchy title for this wrapped",
  "theme": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor",
    "background": "#hexcolor",
    "text": "#hexcolor"
  },
  "musicMood": "${suggestedMood}" // one of: energetic, chill, upbeat, dramatic, warm, professional
  "slides": [
    {
      "id": "unique-id",
      "type": "title|stat|chart|list|comparison|quote|summary",
      "duration": 5000,
      "animation": "fadeIn|slideUp|slideDown|scale|bounce",
      "background": { "type": "solid|gradient", "value": "#hex or gradient css" },
      "content": { /* type-specific content */ }
    }
  ],
  "metadata": {
    "dataType": "string describing the data",
    "dateRange": "optional date range string",
    "generatedAt": "${new Date().toISOString()}"
  }
}

## Slide Content Schemas by Type
- title: { headline, subtitle?, year?, emoji? }
- stat: { label, value, suffix?, comparison?, icon? }
- chart: { title, chartType: bar|line|pie|donut|area, data: [{label, value, color?}], showLegend }
- list: { title, subtitle?, items: [{rank?, label, value?, emoji?}], layout: ranked|grid|horizontal }
- comparison: { title, items: [{label, value, icon?}] }
- quote: { quote, attribution? }
- summary: { title, highlights: [{icon?, label, value}], closingMessage }

Make it fun, celebratory, and visually engaging!`;
}
