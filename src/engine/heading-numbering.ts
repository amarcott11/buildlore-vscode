import type { HeadingNumbering } from './types/theme';

function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}

function toAlpha(n: number, upper: boolean): string {
  const base = upper ? 65 : 97;
  if (n <= 0) return '';
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(base + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

export interface NumberedHeading {
  level: number;
  text: string;
  prefix: string;
}

/**
 * Generate numbering prefixes for a list of headings.
 * Returns the same headings with a `prefix` field added.
 */
export function numberHeadings(
  headings: { level: number; text: string }[],
  format: HeadingNumbering,
  maxDepth: number = 6,
): NumberedHeading[] {
  if (format === 'none') {
    return headings.map((h) => ({ ...h, prefix: '' }));
  }

  // Track counters for each heading level (1-6)
  const counters = [0, 0, 0, 0, 0, 0];

  return headings.map((h) => {
    const level = Math.min(h.level, 6);
    if (level > maxDepth) return { ...h, prefix: '' };

    // Increment counter for current level
    counters[level - 1]++;
    // Reset all deeper levels
    for (let i = level; i < 6; i++) counters[i] = 0;

    let prefix = '';

    switch (format) {
      case 'decimal': {
        // 1. / 1.1 / 1.1.1
        const parts: number[] = [];
        for (let i = 0; i < level; i++) parts.push(counters[i] || 1);
        prefix = parts.join('.') + (level === 1 ? '.' : '');
        break;
      }
      case 'legal': {
        // 1. / 1.1. / 1.1.1.
        const parts: number[] = [];
        for (let i = 0; i < level; i++) parts.push(counters[i] || 1);
        prefix = parts.join('.') + '.';
        break;
      }
      case 'roman': {
        // I. / A. / 1. / a. / i. / (1)
        switch (level) {
          case 1: prefix = toRoman(counters[0]) + '.'; break;
          case 2: prefix = toAlpha(counters[1], true) + '.'; break;
          case 3: prefix = counters[2] + '.'; break;
          case 4: prefix = toAlpha(counters[3], false) + '.'; break;
          case 5: prefix = toRoman(counters[4]).toLowerCase() + '.'; break;
          case 6: prefix = '(' + counters[5] + ')'; break;
        }
        break;
      }
    }

    return { ...h, prefix: prefix + '\u2002' }; // en-space after number
  });
}
