import type { DataCategory } from '@wrapp0r/shared';

/**
 * Column name patterns for each data category.
 * Used to auto-detect the most appropriate category based on CSV/Excel headers.
 */
const CATEGORY_PATTERNS: Record<DataCategory, string[]> = {
  fitness: [
    // Exercise & activity
    'steps', 'distance', 'heart rate', 'calories burned', 'active calories',
    'workout', 'exercise', 'active minutes', 'pace', 'elevation', 'activity',
    'running', 'cycling', 'swimming', 'reps', 'sets', 'weight lifted',
    // Sleep & recovery
    'sleep', 'rest', 'recovery', 'hrv', 'vo2',
    // Body metrics
    'body weight', 'body fat', 'bmi', 'muscle mass',
  ],
  food: [
    // Macronutrients
    'calories', 'kcal', 'kilojoules', 'kj', 'energy', 'protein', 'carbs', 'carbohydrates', 'fat', 'fiber',
    // Micronutrients
    'sodium', 'sugar', 'cholesterol', 'potassium', 'vitamin', 'mineral',
    'calcium', 'iron', 'saturated fat', 'trans fat', 'magnesium', 'zinc',
    // Meals
    'meal', 'breakfast', 'lunch', 'dinner', 'snack', 'snacks',
    // Food tracking
    'food', 'nutrition', 'serving', 'portion', 'recipe', 'ingredient',
    // Common food app columns
    'cronometer', 'myfitnesspal', 'noom', 'macro', 'macros',
  ],
  music: [
    // Content
    'artist', 'track', 'song', 'album', 'genre', 'playlist',
    // Listening metrics
    'play count', 'plays', 'minutes played', 'streams', 'listening',
    'scrobbles', 'ms played', 'time played',
    // Music platforms
    'spotify', 'apple music', 'last.fm',
  ],
  finance: [
    // Transactions
    'amount', 'balance', 'transaction', 'payment', 'income', 'expense',
    'merchant', 'vendor', 'payee',
    // Account
    'account', 'credit', 'debit', 'transfer', 'withdrawal', 'deposit',
    // Budgeting
    'spending', 'budget', 'savings', 'investment', 'dividend',
    // Currency
    'currency', 'gbp', 'usd', 'eur', 'price', 'cost', 'fee',
  ],
  productivity: [
    // Tasks
    'task', 'todo', 'completed', 'status', 'priority', 'due date',
    'assignee', 'tags', 'label',
    // Time tracking
    'hours', 'time spent', 'duration', 'pomodoro', 'focus', 'time logged',
    // Projects
    'project', 'milestone', 'deadline', 'sprint',
    // Project management (Jira, Linear, GitHub, Asana)
    'issue', 'ticket', 'story points', 'epic', 'estimate', 'cycle',
    'backlog', 'board', 'workspace', 'assignee',
    // Development
    'pull request', 'commit', 'merge', 'branch', 'repository', 'pr',
    // Professional (LinkedIn)
    'connections', 'followers', 'impressions', 'engagement', 'reactions',
    'comments', 'shares', 'profile views', 'search appearances', 'posts',
    'views', 'likes',
  ],
  entertainment: [
    // Movies & TV
    'movie', 'film', 'watched', 'director', 'actor', 'cast',
    'show', 'series', 'episode', 'season', 'runtime', 'release date',
    'letterboxd', 'imdb', 'tmdb', 'trakt', 'netflix',
    // Books
    'book', 'author', 'pages', 'read date', 'shelves', 'goodreads',
    'isbn', 'publisher', 'chapters',
    // Ratings & reviews
    'rating', 'review', 'watchlist', 'want to watch', 'want to read',
  ],
  gaming: [
    // Game info
    'game', 'title', 'platform', 'console', 'developer', 'publisher',
    // Play time
    'playtime', 'hours played', 'minutes played', 'time played', 'play time',
    'last played', 'first played',
    // Achievements
    'achievement', 'trophy', 'trophies', 'gamerscore', 'platinum',
    'unlocked', 'completion',
    // Platforms
    'steam', 'playstation', 'psn', 'xbox', 'nintendo', 'switch',
    // Progress
    'level', 'score', 'rank', 'xp', 'experience',
  ],
  other: [],
};

/**
 * Result of category detection
 */
export interface CategoryDetectionResult {
  /** The detected category */
  category: DataCategory;
  /** Confidence score from 0-100 */
  confidence: number;
  /** Column headers that matched patterns */
  matches: string[];
  /** All scores for transparency */
  scores: Record<DataCategory, number>;
}

/**
 * Normalizes a header string for matching
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Checks if a header matches a pattern
 */
function matchesPattern(header: string, pattern: string): boolean {
  const normalizedHeader = normalizeHeader(header);
  const normalizedPattern = pattern.toLowerCase();

  // Exact match
  if (normalizedHeader === normalizedPattern) return true;

  // Contains match (for multi-word patterns)
  if (normalizedHeader.includes(normalizedPattern)) return true;

  // Word boundary match (pattern appears as a complete word)
  const wordBoundaryRegex = new RegExp(`\\b${normalizedPattern}\\b`, 'i');
  if (wordBoundaryRegex.test(normalizedHeader)) return true;

  return false;
}

/**
 * Detects the most likely category based on column headers
 */
export function detectCategory(headers: string[]): CategoryDetectionResult {
  const scores: Record<DataCategory, number> = {
    fitness: 0,
    food: 0,
    music: 0,
    finance: 0,
    productivity: 0,
    entertainment: 0,
    gaming: 0,
    other: 0,
  };

  const matchedHeaders: Record<DataCategory, string[]> = {
    fitness: [],
    food: [],
    music: [],
    finance: [],
    productivity: [],
    entertainment: [],
    gaming: [],
    other: [],
  };

  // Score each category based on header matches
  for (const header of headers) {
    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      for (const pattern of patterns) {
        if (matchesPattern(header, pattern)) {
          scores[category as DataCategory]++;
          if (!matchedHeaders[category as DataCategory].includes(header)) {
            matchedHeaders[category as DataCategory].push(header);
          }
          break; // Only count each header once per category
        }
      }
    }
  }

  // Find the category with highest score
  let bestCategory: DataCategory = 'other';
  let bestScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as DataCategory;
    }
  }

  // Handle special case: "calories" appears in both food and fitness
  // If we have food-specific columns (protein, carbs, fat, meal), prefer food
  if (bestCategory === 'fitness' && scores.food > 0) {
    const foodSpecificMatches = matchedHeaders.food.filter(h => {
      const normalized = normalizeHeader(h);
      return normalized.includes('protein') ||
             normalized.includes('carb') ||
             normalized.includes('fat') ||
             normalized.includes('meal') ||
             normalized.includes('sodium') ||
             normalized.includes('fiber');
    });
    if (foodSpecificMatches.length > 0) {
      bestCategory = 'food';
      bestScore = scores.food;
    }
  }

  // Calculate confidence (0-100)
  // Based on: number of matches relative to headers, and margin over second place
  const totalHeaders = headers.length;
  const matchRatio = totalHeaders > 0 ? (bestScore / totalHeaders) : 0;

  // Get second highest score
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const secondBestScore = sortedScores[1] || 0;
  const margin = bestScore - secondBestScore;

  // Confidence formula: base on match ratio + margin
  let confidence = 0;
  if (bestScore > 0) {
    confidence = Math.min(100, Math.round(
      (matchRatio * 50) + // Up to 50 points for match ratio
      (Math.min(margin, 5) * 10) // Up to 50 points for margin over second place
    ));
  }

  return {
    category: bestCategory,
    confidence,
    matches: matchedHeaders[bestCategory],
    scores,
  };
}

/**
 * Gets a warning message if the selected category differs from detected
 */
export function getCategoryMismatchWarning(
  detected: DataCategory,
  selected: DataCategory,
  matches: string[]
): string | null {
  if (detected === selected || detected === 'other') {
    return null;
  }

  const categoryLabels: Record<DataCategory, string> = {
    fitness: 'Fitness & Health',
    food: 'Food & Nutrition',
    music: 'Music & Listening',
    finance: 'Finance & Spending',
    productivity: 'Productivity & Work',
    entertainment: 'Entertainment',
    gaming: 'Gaming',
    other: 'Other',
  };

  const matchList = matches.slice(0, 3).join(', ');
  const moreCount = matches.length > 3 ? ` and ${matches.length - 3} more` : '';

  return `Your data appears to be "${categoryLabels[detected]}" based on columns like ${matchList}${moreCount}. Using "${categoryLabels[selected]}" may produce inaccurate results.`;
}

/**
 * Gets a suggestion message for detected category
 */
export function getCategorySuggestion(
  detected: DataCategory,
  confidence: number,
  matches: string[]
): string | null {
  if (detected === 'other' || confidence < 20) {
    return null;
  }

  const categoryLabels: Record<DataCategory, string> = {
    fitness: 'Fitness & Health',
    food: 'Food & Nutrition',
    music: 'Music & Listening',
    finance: 'Finance & Spending',
    productivity: 'Productivity & Work',
    entertainment: 'Entertainment',
    gaming: 'Gaming',
    other: 'Other',
  };

  const matchList = matches.slice(0, 3).join(', ');

  return `Detected "${categoryLabels[detected]}" based on columns: ${matchList}`;
}
