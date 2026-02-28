import type { Theme } from './types/theme';
import { defaultTheme } from './default-theme';

/** Deep-merge helper: takes default theme and applies overrides */
function withOverrides(
  name: string,
  overrides: {
    page?: Partial<Theme['page']>;
    typography?: Partial<Theme['typography']>;
    elements?: Partial<{
      [K in keyof Theme['elements']]: Partial<Theme['elements'][K]>;
    }>;
    document?: Partial<Theme['document']>;
  },
): Theme {
  const base = structuredClone(defaultTheme);
  const result = { ...base, name };

  if (overrides.page) result.page = { ...base.page, ...overrides.page };
  if (overrides.typography) result.typography = { ...base.typography, ...overrides.typography };

  if (overrides.elements) {
    for (const [key, val] of Object.entries(overrides.elements)) {
      const k = key as keyof Theme['elements'];
      const existing = result.elements[k] as unknown as Record<string, unknown>;
      (result.elements as unknown as Record<string, unknown>)[k] = { ...existing, ...val };
    }
  }

  if (overrides.document) {
    result.document = {
      ...base.document,
      ...overrides.document,
      tableOfContents: {
        ...base.document.tableOfContents,
        ...(overrides.document.tableOfContents ?? {}),
      },
      pageNumbers: {
        ...base.document.pageNumbers,
        ...(overrides.document.pageNumbers ?? {}),
      },
      header: { ...base.document.header, ...(overrides.document.header ?? {}) },
      footer: { ...base.document.footer, ...(overrides.document.footer ?? {}) },
      coverPage: { ...base.document.coverPage, ...(overrides.document.coverPage ?? {}) },
    };
  }

  return result;
}

// --- 1. Clean Technical --- left accent bars, tech doc feel ---
export const cleanTechnical = withOverrides('Clean Technical', {
  elements: {
    h1: { headingStyle: 'left-bar', borderBottom: 'none', paddingBottom: '0', headingBorderColor: '#3b82f6', letterSpacing: '-0.01em' },
    h2: { headingStyle: 'left-bar', headingBorderColor: '#3b82f6', letterSpacing: '-0.01em' },
    h3: { letterSpacing: '-0.01em' },
    code_block: { background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0' },
    link: { linkStyle: 'underline' },
    list_unordered: { listMarkerColor: '#3b82f6' },
    list_ordered: { listMarkerColor: '#3b82f6' },
  },
});

// --- 2. Ebook Modern --- drop caps, decorative quotes, airy spacing ---
export const ebookModern = withOverrides('Ebook Modern', {
  page: { maxWidth: '680px', margins: { top: '1.5in', right: '1.2in', bottom: '1.5in', left: '1.2in' }, backgroundMode: 'texture', texturePreset: 'linen', textureOpacity: 0.03 },
  typography: {
    baseFontFamily: 'Georgia, "Times New Roman", serif',
    baseFontSize: '13pt',
    baseLineHeight: '1.8',
    baseColor: '#2d2d2d',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontFamily: 'Georgia, serif', fontSize: '22pt', fontWeight: '700', color: '#1a1a1a', borderBottom: 'none', alignment: 'center', marginTop: '32px', marginBottom: '24px', headingStyle: 'plain', letterSpacing: '0.02em' },
    h2: { fontFamily: 'Georgia, serif', fontSize: '18pt', color: '#333', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '0.01em' },
    h3: { fontFamily: 'Georgia, serif', fontSize: '15pt', color: '#444' },
    paragraph: { fontSize: '12pt', lineHeight: '1.8', firstLineIndent: '24px', color: '#2d2d2d', dropCap: true, textAlign: 'justify' },
    blockquote: { borderLeft: '3px solid #8b7355', background: '#faf8f5', fontStyle: 'italic', quoteStyle: 'quote-marks' },
    code_block: { background: '#f5f2ed', color: '#3d3d3d', borderRadius: '4px' },
    image: { captionFontStyle: 'italic' },
    link: { color: '#8b7355', hoverColor: '#6b5335', linkStyle: 'none' },
    hr: { style: 'decorative', color: '#c4b5a0', thickness: '2px' },
  },
  document: {
    pageNumbers: { enabled: true, position: 'bottom-center', format: '1', startFrom: 1 },
  },
});

// --- 3. Product Guide --- colored heading badges, tight spacing ---
export const productGuide = withOverrides('Product Guide', {
  page: { maxWidth: '860px' },
  typography: {
    baseFontFamily: "'Nunito Sans', 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.65',
    baseColor: '#334155',
    contentDensity: 'compact',
  },
  elements: {
    h1: { fontSize: '24pt', color: '#7c3aed', headingStyle: 'background', borderBottom: 'none', letterSpacing: '0.02em', textTransform: 'none' },
    h2: { fontSize: '18pt', color: '#6d28d9', headingStyle: 'pill', letterSpacing: '0.03em', textTransform: 'uppercase' },
    h3: { fontSize: '15pt', color: '#7c3aed', letterSpacing: '0.01em' },
    paragraph: { color: '#475569' },
    blockquote: { borderLeft: '4px solid #a78bfa', background: '#f5f3ff', quoteStyle: 'background' },
    code_inline: { background: '#ede9fe', color: '#6d28d9' },
    code_block: { background: '#1e1b4b', color: '#e0e7ff', borderRadius: '12px' },
    link: { color: '#7c3aed', hoverColor: '#5b21b6', linkStyle: 'hover-only' },
    table: { headerBackground: '#f5f3ff', borderStyle: 'striped' },
    list_unordered: { listMarkerColor: '#7c3aed' },
    list_ordered: { listMarkerColor: '#6d28d9' },
  },
});

// --- 4. Academic --- formal, plain headings, indented quotes ---
export const academic = withOverrides('Academic', {
  page: { size: 'letter', maxWidth: '720px', margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' } },
  typography: {
    baseFontFamily: "'Times New Roman', 'Cambria', serif",
    baseFontSize: '12pt',
    baseLineHeight: '2',
    baseColor: '#000000',
  },
  elements: {
    h1: { fontFamily: "'Times New Roman', serif", fontSize: '16pt', fontWeight: '700', color: '#000', alignment: 'center', borderBottom: 'none', marginTop: '24pt', marginBottom: '12pt', headingStyle: 'plain', letterSpacing: '0.04em', textTransform: 'uppercase' },
    h2: { fontFamily: "'Times New Roman', serif", fontSize: '14pt', fontWeight: '700', color: '#000', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '0.02em' },
    h3: { fontFamily: "'Times New Roman', serif", fontSize: '12pt', fontWeight: '700', color: '#000', headingStyle: 'plain' },
    paragraph: { fontSize: '12pt', lineHeight: '2', firstLineIndent: '0.5in', color: '#000', textAlign: 'justify' },
    blockquote: { borderLeft: '2px solid #666', background: '#fafafa', fontStyle: 'normal', padding: '48px', quoteStyle: 'indented' },
    code_block: { background: '#f5f5f5', color: '#333', borderRadius: '0' },
    image: { captionAlign: 'left', captionFontStyle: 'italic' },
    link: { color: '#000080', hoverColor: '#000060', linkStyle: 'dotted' },
    table: { borderStyle: 'bordered', headerBackground: '#f0f0f0', fontSize: '10pt' },
    hr: { style: 'solid', color: '#000', thickness: '1px' },
    list_ordered: { style: 'roman', listMarkerColor: '#333' },
  },
  document: {
    tableOfContents: { enabled: true, depth: 3, title: 'Table of Contents', style: 'dotted-leaders', indentSize: 24 },
    headingNumbering: 'decimal',
    pageNumbers: { enabled: true, position: 'bottom-center', format: 'Page 1 of N', startFrom: 1 },
  },
});

// --- 5. Newsletter --- overline headings, accent bar code, airy ---
export const newsletter = withOverrides('Newsletter', {
  page: { maxWidth: '640px' },
  typography: {
    baseFontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    baseFontSize: '13pt',
    baseLineHeight: '1.7',
    baseColor: '#1a202c',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontSize: '22pt', fontWeight: '800', color: '#e53e3e', borderBottom: '3px solid #e53e3e', marginBottom: '8px', headingStyle: 'overline', letterSpacing: '0.06em', textTransform: 'uppercase', headingBorderColor: '#e53e3e' },
    h2: { fontSize: '16pt', fontWeight: '700', color: '#2d3748', borderBottom: '2px solid #e2e8f0', marginTop: '32px', headingStyle: 'overline', letterSpacing: '0.04em', headingBorderColor: '#e53e3e' },
    h3: { fontSize: '14pt', fontWeight: '600', color: '#4a5568', letterSpacing: '0.02em' },
    paragraph: { fontSize: '12pt', lineHeight: '1.75', color: '#2d3748' },
    blockquote: { borderLeft: '4px solid #e53e3e', background: '#fff5f5', quoteStyle: 'border-left' },
    code_inline: { background: '#fed7d7', color: '#c53030' },
    code_block: { accentBar: true, accentBarColor: '#e53e3e' },
    link: { color: '#e53e3e', hoverColor: '#c53030', linkStyle: 'underline' },
    hr: { style: 'solid', color: '#e2e8f0', thickness: '2px', margin: '40px 0' },
    list_unordered: { listMarkerColor: '#e53e3e' },
    list_ordered: { listMarkerColor: '#e53e3e' },
  },
});

// --- 6. Craft Pattern --- warm tones, underline headings, drop caps, background quotes ---
export const craftPattern = withOverrides('Craft Pattern', {
  page: { maxWidth: '780px', background: '#fffbf5', backgroundMode: 'texture', texturePreset: 'paper', textureOpacity: 0.04 },
  typography: {
    baseFontFamily: "'Lora', Georgia, serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.7',
    baseColor: '#44403c',
  },
  elements: {
    h1: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22pt', color: '#78350f', borderBottom: '2px solid #d6b889', paddingBottom: '8px', headingStyle: 'underline', headingBorderColor: '#d6b889', letterSpacing: '0.03em' },
    h2: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18pt', color: '#92400e', headingStyle: 'underline', borderBottom: '1px solid #d6b889', paddingBottom: '5px', headingBorderColor: '#d6b889', letterSpacing: '0.02em' },
    h3: { fontFamily: "'Lora', Georgia, serif", fontSize: '15pt', color: '#a16207', fontWeight: '600' },
    paragraph: { color: '#57534e', dropCap: true, textAlign: 'justify' },
    blockquote: { borderLeft: '4px solid #d6b889', background: '#fef3c7', fontStyle: 'italic', quoteStyle: 'background' },
    code_inline: { background: '#fef3c7', color: '#92400e' },
    code_block: { background: '#44403c', color: '#fef3c7', borderRadius: '6px' },
    image: { borderRadius: '8px', shadow: 'md' },
    link: { color: '#b45309', hoverColor: '#92400e', linkStyle: 'hover-only' },
    list_unordered: { style: 'custom', customBullet: '\u2726', listMarkerColor: '#b45309' },
    list_ordered: { listMarkerColor: '#b45309' },
    table: { headerBackground: '#fef3c7', borderStyle: 'bordered' },
    hr: { style: 'decorative', color: '#d6b889', thickness: '2px' },
  },
});

// --- 7. Minimal --- ultra-clean, plain headings, indented quotes, bordered code, airy ---
export const minimal = withOverrides('Minimal', {
  page: { maxWidth: '700px' },
  typography: {
    baseFontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.6',
    baseColor: '#333',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontSize: '20pt', fontWeight: '600', color: '#111', borderBottom: 'none', marginTop: '0', headingStyle: 'plain', letterSpacing: '-0.02em' },
    h2: { fontSize: '16pt', fontWeight: '600', color: '#222', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '-0.01em' },
    h3: { fontSize: '14pt', fontWeight: '600', color: '#333', headingStyle: 'plain' },
    paragraph: { color: '#444' },
    blockquote: { borderLeft: '3px solid #ddd', background: 'transparent', fontStyle: 'normal', quoteStyle: 'indented' },
    code_inline: { background: '#f4f4f4', color: '#555' },
    code_block: { background: '#f8f8f8', color: '#333', borderRadius: '4px', border: '1px solid #e5e7eb' },
    link: { color: '#111', hoverColor: '#555', linkStyle: 'hover-only' },
    hr: { style: 'solid', color: '#eee', thickness: '1px' },
    table: { borderStyle: 'minimal', headerBackground: 'transparent', headerFontWeight: '600' },
  },
});

// --- 8. Dark --- left-bar headings, bordered code, accent bars ---
export const dark = withOverrides('Dark', {
  page: { background: '#0f172a', maxWidth: '800px', backgroundMode: 'gradient', gradientColor2: '#1e1b4b', gradientDirection: 'to bottom right' },
  typography: {
    baseFontFamily: "'Inter', system-ui, sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.65',
    baseColor: '#cbd5e1',
  },
  elements: {
    h1: { fontSize: '22pt', color: '#f1f5f9', headingStyle: 'left-bar', borderBottom: 'none', headingBorderColor: '#3b82f6', letterSpacing: '-0.01em' },
    h2: { fontSize: '18pt', color: '#e2e8f0', headingStyle: 'left-bar', headingBorderColor: '#3b82f6', letterSpacing: '-0.01em' },
    h3: { fontSize: '15pt', color: '#cbd5e1' },
    paragraph: { color: '#94a3b8' },
    blockquote: { borderLeft: '4px solid #3b82f6', background: '#1e293b', quoteStyle: 'border-left' },
    code_inline: { background: '#1e293b', color: '#7dd3fc', borderRadius: '4px' },
    code_block: { background: '#020617', color: '#e2e8f0', borderRadius: '8px', border: '1px solid #334155' },
    image: { shadow: 'lg' },
    link: { color: '#60a5fa', hoverColor: '#93bbfd', linkStyle: 'hover-only' },
    table: { headerBackground: '#1e293b', borderStyle: 'bordered' },
    hr: { color: '#334155' },
    list_ordered: { style: 'decimal', listMarkerColor: '#60a5fa' },
    list_unordered: { style: 'dash', listMarkerColor: '#60a5fa' },
  },
});

// --- 9. Maker's Guide --- warm craft blog aesthetic, sage green + blush ---
export const makersGuide = withOverrides("Maker's Guide", {
  page: { maxWidth: '740px', background: '#fdf8f6', backgroundMode: 'texture', texturePreset: 'paper', textureOpacity: 0.05 },
  typography: {
    baseFontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.7',
    baseColor: '#3d3830',
  },
  elements: {
    h1: { fontFamily: "'Josefin Sans', 'Gill Sans', sans-serif", fontSize: '24pt', fontWeight: '700', color: '#5f7a61', borderBottom: '2px solid #5f7a61', paddingBottom: '6px', headingStyle: 'underline', headingBorderColor: '#5f7a61', letterSpacing: '0.02em' },
    h2: { fontFamily: "'Josefin Sans', 'Gill Sans', sans-serif", fontSize: '18pt', fontWeight: '600', color: '#5f7a61', headingStyle: 'left-bar', headingBorderColor: '#5f7a61', letterSpacing: '0.01em' },
    h3: { fontFamily: "'Josefin Sans', 'Gill Sans', sans-serif", fontSize: '15pt', fontWeight: '600', color: '#6b8e6b' },
    paragraph: { color: '#4a4239', lineHeight: '1.75' },
    blockquote: { borderLeft: '4px solid #b5c7a3', background: '#f0ebe4', fontStyle: 'italic', quoteStyle: 'background' },
    code_inline: { background: '#f0ebe4', color: '#5f7a61' },
    code_block: { background: '#2d3a2e', color: '#d4e4c8', borderRadius: '8px' },
    image: { borderRadius: '8px', shadow: 'md' },
    link: { color: '#5f7a61', hoverColor: '#4a6349', linkStyle: 'underline' },
    table: { headerBackground: '#f0ebe4', borderStyle: 'bordered' },
    hr: { style: 'decorative', color: '#b5c7a3', thickness: '2px' },
    list_ordered: { style: 'hierarchical', listMarkerColor: '#5f7a61' },
    list_unordered: { style: 'custom', customBullet: '\u2665', listMarkerColor: '#c27c7c' },
  },
  document: {
    tableOfContents: { enabled: true, depth: 3, title: 'Contents', style: 'dotted-leaders', indentSize: 20 },
    pageNumbers: { enabled: true, position: 'bottom-center', format: '1', startFrom: 1 },
    coverPage: { enabled: true, layout: 'centered' },
  },
});

// --- 10. Step by Step --- IKEA-style minimalist instruction manual, monochrome slate ---
export const stepByStep = withOverrides('Step by Step', {
  page: { maxWidth: '800px', background: '#ffffff', backgroundMode: 'texture', texturePreset: 'grid', textureOpacity: 0.02 },
  typography: {
    baseFontFamily: "'Barlow', 'Helvetica Neue', sans-serif",
    baseFontSize: '11pt',
    baseLineHeight: '1.6',
    baseColor: '#334155',
    contentDensity: 'compact',
  },
  elements: {
    h1: { fontFamily: "'Barlow', sans-serif", fontSize: '22pt', fontWeight: '700', color: '#ffffff', headingStyle: 'pill', letterSpacing: '0.04em', textTransform: 'uppercase', headingBorderColor: '#475569' },
    h2: { fontFamily: "'Barlow', sans-serif", fontSize: '16pt', fontWeight: '600', color: '#1e293b', headingStyle: 'background', letterSpacing: '0.03em', textTransform: 'uppercase', headingBorderColor: '#e2e8f0' },
    h3: { fontFamily: "'Barlow', sans-serif", fontSize: '14pt', fontWeight: '600', color: '#475569', letterSpacing: '0.01em' },
    paragraph: { color: '#475569', lineHeight: '1.6' },
    blockquote: { borderLeft: '4px solid #94a3b8', background: '#f8fafc', fontStyle: 'normal', quoteStyle: 'border-left' },
    code_inline: { background: '#f1f5f9', color: '#475569' },
    code_block: { background: '#1e293b', color: '#e2e8f0', borderRadius: '4px', border: '1px solid #334155' },
    image: { borderRadius: '4px', shadow: 'sm' },
    link: { color: '#475569', hoverColor: '#1e293b', linkStyle: 'underline' },
    table: { headerBackground: '#f1f5f9', borderStyle: 'bordered', fontSize: '10pt' },
    hr: { style: 'solid', color: '#cbd5e1', thickness: '1px' },
    list_ordered: { style: 'decimal', listMarkerColor: '#1e293b' },
    list_unordered: { style: 'square', listMarkerColor: '#475569' },
  },
  document: {
    tableOfContents: { enabled: true, depth: 2, title: 'Steps', style: 'simple' },
    pageNumbers: { enabled: true, position: 'bottom-right', format: 'Page 1 of N', startFrom: 1 },
  },
});

// --- 11. Creative Workshop --- bold, colorful workshop handout, coral-orange energy ---
export const creativeWorkshop = withOverrides('Creative Workshop', {
  page: { maxWidth: '780px', background: '#fffcfa', backgroundMode: 'texture', texturePreset: 'dots', textureOpacity: 0.03 },
  typography: {
    baseFontFamily: "'Nunito', 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.75',
    baseColor: '#3b2f2f',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontFamily: "'Archivo Black', 'Impact', sans-serif", fontSize: '26pt', fontWeight: '400', color: '#e85d3a', headingStyle: 'overline', letterSpacing: '0.04em', textTransform: 'uppercase', headingBorderColor: '#e85d3a' },
    h2: { fontFamily: "'Archivo', 'Helvetica Neue', sans-serif", fontSize: '18pt', fontWeight: '600', color: '#ffffff', headingStyle: 'pill', headingBorderColor: '#e85d3a', letterSpacing: '0.02em' },
    h3: { fontFamily: "'Archivo', 'Helvetica Neue', sans-serif", fontSize: '15pt', fontWeight: '600', color: '#c74b2e' },
    paragraph: { color: '#4a3c3c', lineHeight: '1.8' },
    blockquote: { borderLeft: '4px solid #e85d3a', background: '#fff0eb', fontStyle: 'italic', quoteStyle: 'background' },
    code_inline: { background: '#fff0eb', color: '#c74b2e' },
    code_block: { background: '#2d1f1f', color: '#f5d0c5', borderRadius: '10px', accentBar: true, accentBarColor: '#e85d3a' },
    image: { borderRadius: '12px', shadow: 'lg', maxWidth: '90%' },
    link: { color: '#e85d3a', hoverColor: '#c74b2e', linkStyle: 'underline' },
    table: { headerBackground: '#fff0eb', borderStyle: 'striped' },
    hr: { style: 'decorative', color: '#e85d3a', thickness: '2px' },
    list_ordered: { style: 'alpha', listMarkerColor: '#e85d3a' },
    list_unordered: { style: 'custom', customBullet: '\u2192', listMarkerColor: '#e85d3a' },
  },
  document: {
    coverPage: { enabled: true, layout: 'centered' },
    pageNumbers: { enabled: true, position: 'bottom-center', format: '1', startFrom: 1 },
  },
});

/** All built-in templates */
export const builtInTemplates: Theme[] = [
  cleanTechnical,
  ebookModern,
  productGuide,
  academic,
  newsletter,
  craftPattern,
  minimal,
  dark,
  makersGuide,
  stepByStep,
  creativeWorkshop,
];
