import { numberHeadings } from './heading-numbering';
import type { HeadingNumbering } from './types/theme';

/**
 * Inject numbering prefixes into rendered heading HTML.
 * Matches <hN class="pf-hN"> tags and prepends the number span.
 */
export function injectHeadingNumbers(html: string, format: HeadingNumbering): string {
  if (format === 'none') return html;

  // Collect all headings in order
  const headingRegex = /<h([1-6])\s+class="pf-h\1"[^>]*>/g;
  const matches: { level: number; index: number }[] = [];
  let m;
  while ((m = headingRegex.exec(html)) !== null) {
    matches.push({ level: parseInt(m[1]), index: m.index + m[0].length });
  }

  if (matches.length === 0) return html;

  const numbered = numberHeadings(
    matches.map((h) => ({ level: h.level, text: '' })),
    format,
  );

  // Build result by inserting prefixes (work backwards to preserve indices)
  let result = html;
  for (let i = matches.length - 1; i >= 0; i--) {
    const prefix = numbered[i].prefix;
    if (prefix) {
      const insertAt = matches[i].index;
      result = result.slice(0, insertAt) + `<span class="pf-heading-number">${prefix}</span>` + result.slice(insertAt);
    }
  }

  return result;
}
