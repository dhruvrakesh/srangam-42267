/**
 * Dark Mode Utilities
 * 
 * Provides helper functions for generating consistent dark-mode-safe color classes
 * across all components. Uses semantic tokens from the design system.
 * 
 * WCAG 2.1 AA Compliance:
 * - Normal text (< 18px): 4.5:1 contrast ratio required
 * - Large text (≥ 18px or 14px bold): 3:1 contrast ratio required
 * - UI components and graphical objects: 3:1 contrast ratio required
 */

/**
 * Maps color names to semantic dark-mode-safe Tailwind classes.
 * Use these instead of hardcoded Tailwind colors (e.g., `text-gray-700`).
 */
export const semanticColorMap: Record<string, string> = {
  // Grays → Semantic tokens
  'gray': 'bg-muted text-muted-foreground',
  'gray-bg': 'bg-muted dark:bg-muted',
  'gray-text': 'text-muted-foreground',
  'gray-border': 'border-border',
  
  // Blues → Ocean palette
  'blue': 'bg-ocean/10 text-ocean dark:text-ocean border-ocean/20',
  'blue-bg': 'bg-ocean/10 dark:bg-ocean/20',
  'blue-text': 'text-ocean dark:text-ocean',
  
  // Greens → Ocean-teal palette
  'green': 'bg-ocean-teal/10 text-ocean-teal dark:text-ocean-teal border-ocean-teal/20',
  'green-bg': 'bg-ocean-teal/10 dark:bg-ocean-teal/20',
  'green-text': 'text-ocean-teal dark:text-ocean-teal',
  
  // Purples → Burgundy palette
  'purple': 'bg-burgundy/10 text-burgundy dark:text-burgundy-light border-burgundy/20',
  'purple-bg': 'bg-burgundy/10 dark:bg-burgundy/20',
  'purple-text': 'text-burgundy dark:text-burgundy-light',
  
  // Oranges/Ambers → Saffron palette
  'orange': 'bg-saffron/10 text-saffron dark:text-saffron border-saffron/20',
  'amber': 'bg-saffron/10 text-saffron dark:text-saffron border-saffron/20',
  'amber-bg': 'bg-saffron/10 dark:bg-saffron/20',
  'amber-text': 'text-saffron dark:text-saffron',
  
  // Reds → Laterite palette
  'red': 'bg-laterite/10 text-laterite dark:text-laterite border-laterite/20',
  'red-bg': 'bg-laterite/10 dark:bg-laterite/20',
  'red-text': 'text-laterite dark:text-laterite',
  
  // Yellows → Gold palette
  'yellow': 'bg-gold-warm/10 text-gold-warm dark:text-gold-light border-gold-warm/20',
  'yellow-bg': 'bg-gold-warm/10 dark:bg-gold-warm/20',
  'yellow-text': 'text-gold-warm dark:text-gold-light',
  
  // Teals/Cyans → Peacock-blue palette
  'teal': 'bg-peacock-blue/10 text-peacock-blue dark:text-peacock-blue border-peacock-blue/20',
  'cyan': 'bg-peacock-blue/10 text-peacock-blue dark:text-peacock-blue border-peacock-blue/20',
};

/**
 * Gets semantic color classes for a given color name.
 * Falls back to muted colors if the color is not found.
 * 
 * @param colorName - The color name (e.g., 'gray', 'blue', 'red')
 * @returns Tailwind classes with proper dark mode support
 * 
 * @example
 * ```tsx
 * <Badge className={getSemanticColor('blue')}>Tag</Badge>
 * ```
 */
export function getSemanticColor(colorName: string): string {
  const normalizedColor = colorName.toLowerCase();
  return semanticColorMap[normalizedColor] || 'bg-muted text-muted-foreground border-border';
}

/**
 * Gets background-only semantic color classes.
 * 
 * @param colorName - The color name (e.g., 'gray', 'blue', 'red')
 * @returns Tailwind background classes with proper dark mode support
 */
export function getSemanticBgColor(colorName: string): string {
  const normalizedColor = colorName.toLowerCase();
  return semanticColorMap[`${normalizedColor}-bg`] || 'bg-muted dark:bg-muted';
}

/**
 * Gets text-only semantic color classes.
 * 
 * @param colorName - The color name (e.g., 'gray', 'blue', 'red')
 * @returns Tailwind text classes with proper dark mode support
 */
export function getSemanticTextColor(colorName: string): string {
  const normalizedColor = colorName.toLowerCase();
  return semanticColorMap[`${normalizedColor}-text`] || 'text-muted-foreground';
}

/**
 * Card and panel background classes with proper dark mode support.
 * Use instead of hardcoded `bg-white dark:bg-gray-800`.
 */
export const cardBg = 'bg-card dark:bg-card';
export const panelBg = 'bg-background dark:bg-background';
export const mutedBg = 'bg-muted dark:bg-muted';

/**
 * Text color classes with proper dark mode support.
 * Use instead of hardcoded `text-gray-700 dark:text-gray-300`.
 */
export const textPrimary = 'text-foreground';
export const textSecondary = 'text-muted-foreground';
export const textMuted = 'text-muted-foreground';

/**
 * Border color classes with proper dark mode support.
 * Use instead of hardcoded `border-gray-200 dark:border-gray-700`.
 */
export const borderDefault = 'border-border';
