import type { WrappedExperience, Slide, StatSlide, ListSlide } from '@wrapp0r/shared';

/**
 * Validation warning for AI-generated content
 */
export interface ValidationWarning {
  slideId: string;
  slideType: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Result of validating a wrapped experience
 */
export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  stats: {
    totalSlides: number;
    validatedSlides: number;
    suspiciousValues: number;
  };
}

/**
 * Extracts all numeric values from the original data
 */
function extractNumericValues(data: Record<string, unknown>[]): Set<number> {
  const values = new Set<number>();

  for (const row of data) {
    for (const value of Object.values(row)) {
      if (typeof value === 'number' && !isNaN(value)) {
        values.add(value);
        // Also add common aggregations
        values.add(Math.round(value));
        values.add(Math.floor(value));
        values.add(Math.ceil(value));
      } else if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          values.add(parsed);
          values.add(Math.round(parsed));
        }
      }
    }
  }

  return values;
}

/**
 * Calculates common aggregations that might appear in stats
 */
function calculateAggregations(data: Record<string, unknown>[]): Set<number> {
  const aggregations = new Set<number>();

  if (data.length === 0) return aggregations;

  // Count of rows
  aggregations.add(data.length);

  // Per-column aggregations
  const columns = Object.keys(data[0]);

  for (const column of columns) {
    const columnValues: number[] = [];

    for (const row of data) {
      const value = row[column];
      if (typeof value === 'number' && !isNaN(value)) {
        columnValues.push(value);
      } else if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          columnValues.push(parsed);
        }
      }
    }

    if (columnValues.length > 0) {
      // Sum
      const sum = columnValues.reduce((a, b) => a + b, 0);
      aggregations.add(sum);
      aggregations.add(Math.round(sum));

      // Average
      const avg = sum / columnValues.length;
      aggregations.add(avg);
      aggregations.add(Math.round(avg));
      aggregations.add(Number(avg.toFixed(1)));
      aggregations.add(Number(avg.toFixed(2)));

      // Min/Max
      aggregations.add(Math.min(...columnValues));
      aggregations.add(Math.max(...columnValues));

      // Count
      aggregations.add(columnValues.length);
    }
  }

  return aggregations;
}

/**
 * Extracts all unique string values (labels) from the data
 */
function extractStringValues(data: Record<string, unknown>[]): Set<string> {
  const values = new Set<string>();

  for (const row of data) {
    for (const value of Object.values(row)) {
      if (typeof value === 'string' && value.trim()) {
        values.add(value.trim().toLowerCase());
      }
    }
  }

  return values;
}

/**
 * Parses a stat value that might be string or number
 */
function parseStatValue(value: string | number): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove commas and other formatting
    const cleaned = value.replace(/[,\s]/g, '').replace(/[%$£€]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Checks if a number is "close enough" to a valid value
 * (allows for rounding differences)
 */
function isCloseToValidValue(value: number, validValues: Set<number>, tolerance = 0.1): boolean {
  for (const valid of validValues) {
    if (Math.abs(value - valid) <= Math.abs(valid * tolerance)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates a stat slide against the original data
 */
function validateStatSlide(
  slide: StatSlide,
  numericValues: Set<number>,
  aggregations: Set<number>
): ValidationWarning | null {
  const statValue = parseStatValue(slide.content.value);

  if (statValue === null) {
    // Non-numeric stat, can't validate
    return null;
  }

  // Check if value exists in raw data or aggregations
  const allValidValues = new Set([...numericValues, ...aggregations]);

  // Allow some tolerance for rounding
  if (!isCloseToValidValue(statValue, allValidValues, 0.05)) {
    // Value doesn't match any known value - could be fabricated
    return {
      slideId: slide.id,
      slideType: 'stat',
      message: `The value "${slide.content.value}" doesn't appear to come from the data. Verify this is correct.`,
      severity: 'medium',
    };
  }

  return null;
}

/**
 * Validates a list slide against the original data
 */
function validateListSlide(
  slide: ListSlide,
  stringValues: Set<string>
): ValidationWarning | null {
  const items = slide.content.items;

  // Check if ranked items are in correct order
  const rankedItems = items.filter(item => item.rank !== undefined);
  if (rankedItems.length >= 2) {
    const isOrdered = rankedItems.every((item, index) => {
      if (index === 0) return true;
      const prev = rankedItems[index - 1];
      return (item.rank ?? 0) >= (prev.rank ?? 0);
    });

    if (!isOrdered) {
      return {
        slideId: slide.id,
        slideType: 'list',
        message: 'List items appear to be out of order. Ranks should be in ascending order (1, 2, 3...).',
        severity: 'low',
      };
    }
  }

  // Check if any item labels exist in the data
  const matchingItems = items.filter(item =>
    stringValues.has(item.label.toLowerCase())
  );

  if (items.length > 0 && matchingItems.length === 0) {
    return {
      slideId: slide.id,
      slideType: 'list',
      message: 'None of the list items appear in the original data. These may be inaccurate.',
      severity: 'medium',
    };
  }

  return null;
}

/**
 * Validates a wrapped experience against the original data
 */
export function validateWrapped(
  wrapped: WrappedExperience,
  originalData: Record<string, unknown>[]
): ValidationResult {
  const warnings: ValidationWarning[] = [];

  // Extract values from original data
  const numericValues = extractNumericValues(originalData);
  const aggregations = calculateAggregations(originalData);
  const stringValues = extractStringValues(originalData);

  let validatedSlides = 0;
  let suspiciousValues = 0;

  for (const slide of wrapped.slides) {
    if (slide.type === 'stat') {
      const warning = validateStatSlide(slide as StatSlide, numericValues, aggregations);
      if (warning) {
        warnings.push(warning);
        suspiciousValues++;
      }
      validatedSlides++;
    } else if (slide.type === 'list') {
      const warning = validateListSlide(slide as ListSlide, stringValues);
      if (warning) {
        warnings.push(warning);
      }
      validatedSlides++;
    }
    // Chart and other slides are harder to validate automatically
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    stats: {
      totalSlides: wrapped.slides.length,
      validatedSlides,
      suspiciousValues,
    },
  };
}

/**
 * Gets a summary message for validation results
 */
export function getValidationSummary(result: ValidationResult): string | null {
  if (result.isValid) {
    return null;
  }

  const highSeverity = result.warnings.filter(w => w.severity === 'high').length;
  const mediumSeverity = result.warnings.filter(w => w.severity === 'medium').length;

  if (highSeverity > 0) {
    return `Found ${highSeverity} potentially inaccurate value(s). Please verify the highlighted slides.`;
  }

  if (mediumSeverity > 0) {
    return `Some values may not match your data. Consider reviewing the generated content.`;
  }

  return 'Minor issues found. The content should still be accurate.';
}
