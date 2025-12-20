/**
 * Color utilities for WCAG accessibility compliance
 */

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Calculate relative luminance per WCAG 2.1 guidelines
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Returns a value between 1 and 21
 * @param color1 - First hex color (e.g., "#FFFFFF")
 * @param color2 - Second hex color (e.g., "#000000")
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a foreground/background color combination meets WCAG accessibility standards
 * @param foreground - Foreground/text hex color
 * @param background - Background hex color
 * @param level - WCAG conformance level ('AA' or 'AAA')
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 */
export function isAccessible(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  // AA level
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Get the minimum required contrast ratio for WCAG compliance
 */
export function getMinimumContrastRatio(
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): number {
  if (level === 'AAA') {
    return isLargeText ? 4.5 : 7;
  }
  return isLargeText ? 3 : 4.5;
}
