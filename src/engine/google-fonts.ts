import type { Theme } from './types/theme';

// Set of font names that are system-available and should NOT trigger a Google Fonts load.
const SYSTEM_FONT_NAMES = new Set([
  'inherit',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Helvetica Neue',
  'Helvetica',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Cambria',
  'Courier New',
  'Courier',
  'monospace',
  'serif',
  'sans-serif',
  'cursive',
  'fantasy',
]);

/**
 * Extract the primary (first) font family from a CSS font stack.
 */
function parsePrimaryFont(fontStack: string): string {
  const trimmed = fontStack.trim();
  if (!trimmed || trimmed === 'inherit') return trimmed;
  const quoted = trimmed.match(/^["']([^"']+)["']/);
  if (quoted) return quoted[1];
  const firstComma = trimmed.indexOf(',');
  if (firstComma >= 0) return trimmed.slice(0, firstComma).trim().replace(/^["']|["']$/g, '');
  return trimmed.replace(/^["']|["']$/g, '');
}

/**
 * Scan a theme for all font families that are Google Fonts (not system fonts).
 * Returns deduplicated array of family names suitable for loading.
 */
export function extractGoogleFonts(theme: Theme): string[] {
  const families = new Set<string>();

  const check = (fontStack: string | undefined) => {
    if (!fontStack) return;
    const primary = parsePrimaryFont(fontStack);
    if (primary && !SYSTEM_FONT_NAMES.has(primary) && primary !== 'inherit') {
      families.add(primary);
    }
  };

  // Typography base
  check(theme.typography.baseFontFamily);

  // Headings
  const headingKeys = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
  for (const key of headingKeys) {
    check(theme.elements[key].fontFamily);
  }

  // Code
  check(theme.elements.code_inline.fontFamily);
  check(theme.elements.code_block.fontFamily);

  // Mermaid
  check(theme.elements.mermaid?.fontFamily);

  return [...families];
}

/**
 * Build a Google Fonts `<link>` href for the given families.
 * Suitable for injection into exported HTML documents.
 */
export function buildGoogleFontsLink(families: string[]): string {
  if (families.length === 0) return '';
  const params = families
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
