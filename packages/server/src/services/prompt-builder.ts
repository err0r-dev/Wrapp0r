import type { DataCategory } from '@wrapp0r/shared';

const CATEGORY_CONTEXTS: Record<DataCategory, string> = {
  fitness: 'This is FITNESS/EXERCISE tracking data. Calories here are BURNED through physical activity. Focus on workout achievements, personal records, consistency, and progress. Use energetic, motivating language.',
  music: 'This is music listening data. Focus on top artists, genres, listening trends, and memorable discoveries. Use dynamic, expressive language.',
  food: `This is FOOD/NUTRITION tracking data - what the user ATE and CONSUMED.
CRITICAL: Calories/kcal in this data are calories EATEN (intake), NOT burned!
- Do NOT say "calories burned" or make exercise comparisons (marathons, etc.)
- DO say "calories consumed", "eaten", "intake", "enjoyed"
- Focus on: favourite foods, eating patterns, macro breakdown, nutritional balance
- Make comparisons like "enough pizza to stack to the moon" NOT "burned enough to run X marathons"`,
  finance: 'This is financial/spending data. Focus on spending patterns, savings achievements, and smart money moves. Use professional, confident language.',
  productivity: 'This is productivity/work data. Focus on accomplishments, time management, and growth. Use focused, achievement-oriented language.',
  entertainment: 'This is entertainment data (movies, TV shows, books). Focus on viewing/reading habits, favourites, genres explored, and memorable discoveries. Use cinematic, storytelling language.',
  gaming: 'This is gaming data. Focus on playtime, achievements, favourite games, and gaming milestones. Use exciting, immersive language.',
  other: 'This is general data. Identify the most interesting patterns and create engaging insights based on what you discover.',
};

const MUSIC_MOODS: Record<DataCategory, string> = {
  fitness: 'energetic',
  music: 'upbeat',
  food: 'warm',
  finance: 'professional',
  productivity: 'chill',
  entertainment: 'dramatic',
  gaming: 'energetic',
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

## CRITICAL: Data Accuracy Rules
1. ONLY use values that actually exist in the provided data - NEVER invent or fabricate numbers
2. For stat slides, USE THE CALCULATED_TOTALS provided at the end of the data - these are pre-calculated sums/averages
3. For list slides, items MUST exist in the data and be sorted correctly (rank 1 = highest/best)
4. For comparisons and fun facts, use the CALCULATED_TOTALS values, not made-up numbers
5. If a metric doesn't exist in the data, DO NOT create a slide for it
6. The CALCULATED_TOTALS section contains accurate sums - USE THESE VALUES DIRECTLY

## CRITICAL: Category-Specific Rules
The data category is: ${category.toUpperCase()}

${category === 'food' ? `### FOOD DATA RULES (MUST FOLLOW):
- All calorie/kcal values are FOOD CONSUMED (eaten), NOT exercise/burned
- NEVER use phrases like "burned", "burnt", "ran off", "exercised away"
- NEVER compare to marathons, running, cycling, or any physical activity
- USE phrases like "consumed", "eaten", "enjoyed", "devoured", "indulged in"
- GOOD comparisons: "Enough protein to build a small muscle car", "Carbs equivalent to X loaves of bread"
- BAD comparisons: "Burned enough to run 54 marathons" (THIS IS WRONG FOR FOOD DATA)
` : ''}
${category === 'fitness' ? `### FITNESS DATA RULES:
- Calories here ARE burned through exercise
- You CAN compare to running, cycling, climbing, etc.
` : ''}

## Your Task
1. Analyse the data to find the most interesting patterns, trends, and insights
2. Create a sequence of 8-12 slides that tell a compelling data story
3. Use creative, engaging headlines (make them punchy and memorable!)
4. Choose appropriate visualisations for each insight
5. Design a cohesive colour theme inspired by Spotify Wrapped campaigns

## Colour Design Guidelines
Use colours inspired by Spotify Wrapped campaigns. Choose from these palette styles:

1. **Classic Spotify**: Dark backgrounds (#121212, #191414) with bright green (#1DB954) accents
2. **Wrapped Gradient**: Vibrant gradients mixing pink (#FF6B9D), orange (#FF8C42), and purple (#A855F7)
3. **Neon Night**: Deep purple (#1A1A2E) with electric blue (#00D4FF) and hot pink (#FF2D6A)
4. **Warm Sunset**: Deep orange (#E94057) fading to pink (#FF6B9D) on dark backgrounds
5. **Cool Electric**: Teal (#00CEC9) and blue (#5F27CD) on black backgrounds

IMPORTANT:
- Prefer dark backgrounds (#121212, #1A1A2E, #191414) with bright, contrasting accent colours
- Text colour should ALWAYS be white (#FFFFFF) or near-white for readability
- Use vibrant gradients for slide backgrounds (e.g., "linear-gradient(135deg, #FF6B9D, #A855F7)")
- Ensure sufficient contrast for accessibility

## Slide Requirements
- Start with an exciting title slide introducing the wrapped
- Include at least 2 stat slides with big numbers
- Include at least 1 chart slide (bar, line, or pie)
- Include at least 1 list slide (top items, rankings)
- Add fun comparisons where possible (but respect category rules above!)
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
