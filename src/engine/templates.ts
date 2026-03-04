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

// ─── 1. Standard ─── GitHub README meets Notion. The default. ───
// Standard IS the default theme — no overrides needed, just re-export with the same name.
export const standard: Theme = structuredClone(defaultTheme);

// ─── 2. Manuscript ─── Ebook/prose. Kindle reading comfort. ───
export const manuscript = withOverrides('Manuscript', {
  page: {
    maxWidth: '650px',
    margins: { top: '1.5in', right: '1.2in', bottom: '1.5in', left: '1.2in' },
    backgroundMode: 'texture',
    texturePreset: 'linen',
    textureOpacity: 0.03,
  },
  typography: {
    baseFontFamily: "'Lora', Georgia, serif",
    baseFontSize: '13pt',
    baseLineHeight: '1.85',
    baseColor: '#2d2d2d',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24pt', fontWeight: '700', color: '#1a1a1a', borderBottom: 'none', alignment: 'center', marginTop: '32px', marginBottom: '24px', headingStyle: 'plain', letterSpacing: '0.02em' },
    h2: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18pt', color: '#333', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '0.01em' },
    h3: { fontFamily: "'Lora', Georgia, serif", fontSize: '15pt', color: '#444' },
    paragraph: { fontSize: '12pt', lineHeight: '1.85', firstLineIndent: '1.5em', color: '#2d2d2d', dropCap: true, textAlign: 'justify' },
    blockquote: { borderLeft: '3px solid #8b7355', background: '#faf8f5', fontStyle: 'italic', quoteStyle: 'quote-marks' },
    code_block: { background: '#f5f2ed', color: '#3d3d3d', borderRadius: '4px' },
    link: { color: '#8b7355', hoverColor: '#6b5335', linkStyle: 'none' },
    hr: { style: 'decorative', color: '#c4b5a0', thickness: '2px' },
  },
  document: {
    coverPage: { enabled: true, layout: 'centered' },
    pageNumbers: { enabled: true, position: 'bottom-center', format: '1', startFrom: 1 },
  },
});

// ─── 3. Briefing ─── Business report. McKinsey deliverable. ───
export const briefing = withOverrides('Briefing', {
  page: { maxWidth: '780px' },
  typography: {
    baseFontFamily: "'Source Sans 3', 'Segoe UI', sans-serif",
    baseFontSize: '11pt',
    baseLineHeight: '1.55',
    baseColor: '#1e293b',
    contentDensity: 'compact',
  },
  elements: {
    h1: { fontFamily: "'Source Sans 3', sans-serif", fontSize: '22pt', fontWeight: '700', color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', headingStyle: 'underline', headingBorderColor: '#1e3a5f', letterSpacing: '0.04em', textTransform: 'uppercase' },
    h2: { fontFamily: "'Source Sans 3', sans-serif", fontSize: '16pt', fontWeight: '600', color: '#1e3a5f', headingStyle: 'left-bar', headingBorderColor: '#1e3a5f', letterSpacing: '0.02em' },
    h3: { fontFamily: "'Source Sans 3', sans-serif", fontSize: '14pt', fontWeight: '600', color: '#334155' },
    paragraph: { color: '#334155', lineHeight: '1.55' },
    blockquote: { borderLeft: '4px solid #1e3a5f', background: '#f0f4f8', fontStyle: 'normal', quoteStyle: 'background' },
    code_block: { background: '#f8fafc', color: '#1e293b', borderRadius: '4px', border: '1px solid #e2e8f0' },
    table: { borderStyle: 'bordered', headerBackground: '#1e3a5f' },
    link: { color: '#1e3a5f', hoverColor: '#0f2440', linkStyle: 'underline' },
    list_ordered: { listMarkerColor: '#1e3a5f' },
    list_unordered: { listMarkerColor: '#1e3a5f' },
  },
  document: {
    coverPage: { enabled: true, layout: 'centered' },
    tableOfContents: { enabled: true, depth: 3, title: 'Table of Contents', style: 'dotted-leaders', indentSize: 24 },
    headingNumbering: 'decimal',
    pageNumbers: { enabled: true, position: 'bottom-center', format: 'Page 1 of N', startFrom: 1 },
  },
});

// ─── 4. Scholar ─── Academic paper. APA/MLA compliance. ───
export const scholar = withOverrides('Scholar', {
  page: { size: 'letter', maxWidth: '720px', margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' } },
  typography: {
    baseFontFamily: "'Crimson Text', 'Times New Roman', serif",
    baseFontSize: '12pt',
    baseLineHeight: '2',
    baseColor: '#000000',
  },
  elements: {
    h1: { fontFamily: "'Crimson Text', serif", fontSize: '16pt', fontWeight: '700', color: '#000', alignment: 'center', borderBottom: 'none', marginTop: '24pt', marginBottom: '12pt', headingStyle: 'plain', letterSpacing: '0.04em', textTransform: 'uppercase' },
    h2: { fontFamily: "'Crimson Text', serif", fontSize: '14pt', fontWeight: '700', color: '#000', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '0.02em' },
    h3: { fontFamily: "'Crimson Text', serif", fontSize: '12pt', fontWeight: '700', color: '#000', headingStyle: 'plain' },
    paragraph: { fontSize: '12pt', lineHeight: '2', firstLineIndent: '0.5in', color: '#000', textAlign: 'justify' },
    blockquote: { borderLeft: '2px solid #666', background: '#fafafa', fontStyle: 'normal', padding: '48px', quoteStyle: 'indented' },
    code_block: { background: '#f5f5f5', color: '#333', borderRadius: '0' },
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

// ─── 5. Journal ─── Blog/essay. Warm, inviting longform. ───
export const journal = withOverrides('Journal', {
  page: { maxWidth: '680px' },
  typography: {
    baseFontFamily: "'Source Serif 4', Georgia, serif",
    baseFontSize: '13pt',
    baseLineHeight: '1.8',
    baseColor: '#2d2d2d',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '28pt', fontWeight: '400', color: '#1a1a1a', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '-0.01em', marginBottom: '16px' },
    h2: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20pt', fontWeight: '400', color: '#333', borderBottom: '1px solid #e5e0db', paddingBottom: '6px', headingStyle: 'underline', headingBorderColor: '#e5e0db', letterSpacing: '-0.005em' },
    h3: { fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '16pt', color: '#444' },
    paragraph: { fontSize: '13pt', lineHeight: '1.8', color: '#3d3d3d' },
    blockquote: { borderLeft: '4px solid #c05d3b', background: '#faf6f4', fontStyle: 'italic', quoteStyle: 'border-left' },
    code_block: { background: '#2d2520', color: '#e8ddd4', borderRadius: '8px' },
    image: { borderRadius: '6px', shadow: 'md' },
    link: { color: '#c05d3b', hoverColor: '#9a4a2f', linkStyle: 'underline' },
    hr: { style: 'decorative', color: '#d4c5b9', thickness: '2px' },
  },
});

// ─── 6. Dispatch ─── Newsletter. Scannable, energetic. ───
export const dispatch = withOverrides('Dispatch', {
  page: { maxWidth: '640px' },
  typography: {
    baseFontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.7',
    baseColor: '#1a202c',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: '22pt', fontWeight: '800', color: '#dc2626', borderBottom: '3px solid #dc2626', marginBottom: '8px', headingStyle: 'overline', letterSpacing: '0.06em', textTransform: 'uppercase', headingBorderColor: '#dc2626' },
    h2: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: '16pt', fontWeight: '700', color: '#2d3748', borderBottom: '2px solid #dc2626', marginTop: '32px', headingStyle: 'overline', letterSpacing: '0.04em', headingBorderColor: '#dc2626' },
    h3: { fontSize: '14pt', fontWeight: '600', color: '#4a5568', letterSpacing: '0.02em' },
    paragraph: { fontSize: '12pt', lineHeight: '1.75', color: '#2d3748' },
    blockquote: { borderLeft: '4px solid #dc2626', background: '#fef2f2', quoteStyle: 'border-left' },
    code_inline: { background: '#fecaca', color: '#b91c1c' },
    code_block: { accentBar: true, accentBarColor: '#dc2626' },
    table: { borderStyle: 'striped' },
    link: { color: '#dc2626', hoverColor: '#b91c1c', linkStyle: 'underline' },
    hr: { style: 'solid', color: '#dc2626', thickness: '2px', margin: '40px 0' },
    list_unordered: { listMarkerColor: '#dc2626' },
    list_ordered: { listMarkerColor: '#dc2626' },
  },
});

// ─── 7. Handbook ─── Product docs. Stripe/Tailwind style. ───
export const handbook = withOverrides('Handbook', {
  page: { maxWidth: '820px' },
  typography: {
    baseFontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.65',
    baseColor: '#334155',
    contentDensity: 'compact',
  },
  elements: {
    h1: { fontFamily: "'DM Sans', sans-serif", fontSize: '24pt', color: '#7c3aed', headingStyle: 'background', borderBottom: 'none', letterSpacing: '0.01em' },
    h2: { fontFamily: "'DM Sans', sans-serif", fontSize: '18pt', color: '#6d28d9', headingStyle: 'left-bar', headingBorderColor: '#7c3aed', letterSpacing: '0.01em' },
    h3: { fontFamily: "'DM Sans', sans-serif", fontSize: '15pt', color: '#7c3aed' },
    paragraph: { color: '#475569' },
    blockquote: { borderLeft: '4px solid #a78bfa', background: '#f5f3ff', fontStyle: 'normal', quoteStyle: 'background' },
    code_inline: { background: '#ede9fe', color: '#6d28d9' },
    code_block: { background: '#1e1b4b', color: '#e0e7ff', borderRadius: '12px' },
    table: { headerBackground: '#7c3aed', borderStyle: 'striped' },
    link: { color: '#7c3aed', hoverColor: '#5b21b6', linkStyle: 'hover-only' },
    list_unordered: { listMarkerColor: '#7c3aed' },
    list_ordered: { listMarkerColor: '#6d28d9' },
  },
  document: {
    tableOfContents: { enabled: true, depth: 3, title: 'Contents', style: 'indented', indentSize: 20 },
  },
});

// ─── 8. Midnight ─── Dark mode essential. Developer. ───
export const midnight = withOverrides('Midnight', {
  page: { background: '#0f172a', maxWidth: '800px', backgroundMode: 'gradient', gradientColor2: '#1a1033', gradientDirection: 'to bottom right' },
  typography: {
    baseFontFamily: "'Inter', system-ui, sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.65',
    baseColor: '#cbd5e1',
  },
  elements: {
    h1: { fontSize: '22pt', color: '#f1f5f9', headingStyle: 'left-bar', borderBottom: 'none', headingBorderColor: '#38bdf8', letterSpacing: '-0.01em' },
    h2: { fontSize: '18pt', color: '#e2e8f0', headingStyle: 'left-bar', headingBorderColor: '#38bdf8', letterSpacing: '-0.01em' },
    h3: { fontSize: '15pt', color: '#cbd5e1' },
    paragraph: { color: '#94a3b8' },
    blockquote: { borderLeft: '4px solid #38bdf8', background: '#1e293b', quoteStyle: 'border-left' },
    code_inline: { background: '#1e293b', color: '#7dd3fc', borderRadius: '4px' },
    code_block: { background: '#020617', color: '#e2e8f0', borderRadius: '8px', border: '1px solid #334155' },
    link: { color: '#38bdf8', hoverColor: '#7dd3fc', linkStyle: 'hover-only' },
    table: { headerBackground: '#1e293b', borderStyle: 'bordered' },
    hr: { color: '#334155' },
    list_ordered: { style: 'decimal', listMarkerColor: '#38bdf8' },
    list_unordered: { style: 'dash', listMarkerColor: '#38bdf8' },
    mermaid: {
      background: '#1e293b',
      fontSize: '14px',
      fontFamily: "'Inter', system-ui, sans-serif",
      lineColor: '#475569',
      nodeColor: '#38bdf8',
      secondaryColor: '#1e3a5f',
      primaryBorderColor: '#38bdf8',
      textColor: '#e2e8f0',
      edgeLabelBackground: '#0f172a',
      noteBkgColor: '#1e3a5f',
      noteTextColor: '#e2e8f0',
      borderRadius: '8px',
    },
  },
});

// ─── 9. Blueprint ─── Technical spec, RFC, architecture doc. ───
export const blueprint = withOverrides('Blueprint', {
  page: { maxWidth: '820px' },
  typography: {
    baseFontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.6',
    baseColor: '#1e293b',
  },
  elements: {
    h1: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '22pt', fontWeight: '700', color: '#0c4a6e', borderBottom: '2px solid #0369a1', paddingBottom: '8px', headingStyle: 'underline', headingBorderColor: '#0369a1', letterSpacing: '-0.01em' },
    h2: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '18pt', fontWeight: '600', color: '#0369a1', headingStyle: 'left-bar', headingBorderColor: '#0369a1', letterSpacing: '-0.005em' },
    h3: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '15pt', fontWeight: '600', color: '#0c4a6e' },
    paragraph: { color: '#334155' },
    blockquote: { borderLeft: '4px solid #0369a1', background: '#f0f9ff', quoteStyle: 'border-left' },
    code_block: { accentBar: true, accentBarColor: '#0369a1' },
    table: { borderStyle: 'bordered', headerBackground: '#f0f9ff' },
    link: { color: '#0369a1', hoverColor: '#075985', linkStyle: 'underline' },
    hr: { style: 'dashed', color: '#94a3b8', thickness: '1px' },
    list_unordered: { style: 'square', listMarkerColor: '#0369a1' },
    list_ordered: { listMarkerColor: '#0369a1' },
  },
  document: {
    tableOfContents: { enabled: true, depth: 3, title: 'Table of Contents', style: 'simple' },
    headingNumbering: 'legal',
    pageNumbers: { enabled: true, position: 'bottom-center', format: 'Page 1 of N', startFrom: 1 },
  },
});

// ─── 10. Canvas ─── Creative brief, workshop, pitch. ───
export const canvas = withOverrides('Canvas', {
  page: { maxWidth: '780px', background: '#fffcfa', backgroundMode: 'texture', texturePreset: 'dots', textureOpacity: 0.03 },
  typography: {
    baseFontFamily: "'Nunito', 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.75',
    baseColor: '#3b2f2f',
    contentDensity: 'airy',
  },
  elements: {
    h1: { fontFamily: "'Sora', 'Nunito', sans-serif", fontSize: '26pt', fontWeight: '700', color: '#ea580c', borderBottom: '3px solid #ea580c', headingStyle: 'overline', letterSpacing: '0.04em', textTransform: 'uppercase', headingBorderColor: '#ea580c' },
    h2: { fontFamily: "'Sora', 'Nunito', sans-serif", fontSize: '18pt', fontWeight: '600', color: '#ea580c', headingStyle: 'pill', headingBorderColor: '#ea580c', letterSpacing: '0.02em' },
    h3: { fontFamily: "'Nunito', sans-serif", fontSize: '15pt', fontWeight: '600', color: '#c74b2e' },
    paragraph: { color: '#4a3c3c', lineHeight: '1.8' },
    blockquote: { borderLeft: '4px solid #ea580c', background: '#fff7ed', fontStyle: 'italic', quoteStyle: 'background' },
    code_inline: { background: '#ffedd5', color: '#c2410c' },
    code_block: { background: '#2d1f1f', color: '#f5d0c5', borderRadius: '10px', accentBar: true, accentBarColor: '#ea580c' },
    image: { borderRadius: '12px', shadow: 'lg' },
    link: { color: '#ea580c', hoverColor: '#c74b2e', linkStyle: 'underline' },
    table: { headerBackground: '#fff7ed', borderStyle: 'striped' },
    hr: { style: 'decorative', color: '#ea580c', thickness: '2px' },
    list_ordered: { style: 'alpha', listMarkerColor: '#ea580c' },
    list_unordered: { style: 'custom', customBullet: '\u2192', listMarkerColor: '#ea580c' },
  },
  document: {
    coverPage: { enabled: true, layout: 'centered' },
    pageNumbers: { enabled: true, position: 'bottom-center', format: '1', startFrom: 1 },
  },
});

// ─── 11. Folio ─── Reference work, course reader, manual. ───
export const folio = withOverrides('Folio', {
  page: { maxWidth: '740px', background: '#fffbf5', backgroundMode: 'texture', texturePreset: 'paper', textureOpacity: 0.04 },
  typography: {
    baseFontFamily: "'Merriweather', Georgia, serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.7',
    baseColor: '#2d2d2d',
  },
  elements: {
    h1: { fontFamily: "'Libre Baskerville', 'Merriweather', serif", fontSize: '22pt', fontWeight: '700', color: '#2d6a4f', borderBottom: '2px solid #2d6a4f', paddingBottom: '8px', headingStyle: 'underline', headingBorderColor: '#2d6a4f', letterSpacing: '0.02em' },
    h2: { fontFamily: "'Libre Baskerville', 'Merriweather', serif", fontSize: '18pt', fontWeight: '600', color: '#2d6a4f', headingStyle: 'left-bar', headingBorderColor: '#2d6a4f', letterSpacing: '0.01em' },
    h3: { fontFamily: "'Merriweather', Georgia, serif", fontSize: '15pt', fontWeight: '600', color: '#40916c' },
    paragraph: { color: '#3d3d3d' },
    blockquote: { borderLeft: '4px solid #2d6a4f', background: '#fdf8ef', fontStyle: 'italic', quoteStyle: 'background' },
    code_inline: { background: '#ecfdf5', color: '#2d6a4f' },
    code_block: { background: '#1a3a2a', color: '#d4e8dc', borderRadius: '6px' },
    image: { borderRadius: '4px', shadow: 'sm' },
    link: { color: '#2d6a4f', hoverColor: '#1b4332', linkStyle: 'underline' },
    table: { headerBackground: '#ecfdf5', borderStyle: 'bordered' },
    hr: { style: 'decorative', color: '#a7c4b5', thickness: '2px' },
    list_ordered: { style: 'hierarchical', listMarkerColor: '#2d6a4f' },
    list_unordered: { listMarkerColor: '#2d6a4f' },
  },
  document: {
    coverPage: { enabled: true, layout: 'centered' },
    tableOfContents: { enabled: true, depth: 3, title: 'Contents', style: 'dotted-leaders', indentSize: 24 },
    headingNumbering: 'decimal',
    pageNumbers: { enabled: true, position: 'bottom-center', format: '1', startFrom: 1 },
  },
});

// ─── 12. Protocol ─── SOP, runbook, checklist. Zero fluff. ───
export const protocol = withOverrides('Protocol', {
  page: { maxWidth: '800px', backgroundMode: 'texture', texturePreset: 'grid', textureOpacity: 0.02 },
  typography: {
    baseFontFamily: "'Barlow', 'Helvetica Neue', sans-serif",
    baseFontSize: '11pt',
    baseLineHeight: '1.6',
    baseColor: '#334155',
    contentDensity: 'compact',
  },
  elements: {
    h1: { fontFamily: "'Barlow', sans-serif", fontSize: '22pt', fontWeight: '700', color: '#1e293b', headingStyle: 'left-bar', headingBorderColor: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase' },
    h2: { fontFamily: "'Barlow', sans-serif", fontSize: '16pt', fontWeight: '600', color: '#1e293b', headingStyle: 'background', headingBorderColor: '#475569', letterSpacing: '0.03em' },
    h3: { fontFamily: "'Barlow', sans-serif", fontSize: '14pt', fontWeight: '600', color: '#475569', letterSpacing: '0.01em' },
    paragraph: { color: '#475569', lineHeight: '1.6' },
    blockquote: { borderLeft: '4px solid #475569', background: '#f8fafc', fontStyle: 'normal', quoteStyle: 'border-left' },
    code_inline: { background: '#f1f5f9', color: '#475569' },
    code_block: { background: '#1e293b', color: '#e2e8f0', borderRadius: '4px', border: '1px solid #334155' },
    table: { borderStyle: 'bordered', headerBackground: '#f1f5f9', fontSize: '10pt' },
    link: { color: '#475569', hoverColor: '#1e293b', linkStyle: 'underline' },
    hr: { style: 'solid', color: '#cbd5e1', thickness: '1px' },
    list_ordered: { style: 'decimal', listMarkerColor: '#1e293b' },
    list_unordered: { style: 'square', listMarkerColor: '#475569' },
  },
  document: {
    tableOfContents: { enabled: true, depth: 2, title: 'Contents', style: 'simple' },
    pageNumbers: { enabled: true, position: 'bottom-right', format: 'Page 1 of N', startFrom: 1 },
  },
});

// ─── 13. Ink ─── Anti-template. iA Writer minimalism. ───
export const ink = withOverrides('Ink', {
  page: { maxWidth: '680px' },
  typography: {
    baseFontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    baseFontSize: '12pt',
    baseLineHeight: '1.6',
    baseColor: '#222222',
  },
  elements: {
    h1: { fontSize: '20pt', fontWeight: '700', color: '#222222', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '-0.02em' },
    h2: { fontSize: '17pt', fontWeight: '600', color: '#222222', borderBottom: 'none', headingStyle: 'plain', letterSpacing: '-0.01em' },
    h3: { fontSize: '14pt', fontWeight: '600', color: '#333333', headingStyle: 'plain' },
    paragraph: { color: '#333333' },
    blockquote: { borderLeft: 'none', background: 'transparent', fontStyle: 'normal', padding: '0 0 0 24px', quoteStyle: 'indented' },
    code_inline: { background: '#f4f4f4', color: '#333333', borderRadius: '3px' },
    code_block: { background: '#f8f8f8', color: '#333333', borderRadius: '4px', border: '1px solid #e5e7eb' },
    link: { color: '#222222', hoverColor: '#555555', linkStyle: 'underline' },
    table: { borderStyle: 'minimal', headerBackground: 'transparent', headerFontWeight: '600' },
    hr: { style: 'solid', color: '#e5e7eb', thickness: '1px' },
  },
});

/** All built-in templates */
export const builtInTemplates: Theme[] = [
  standard,
  manuscript,
  briefing,
  scholar,
  journal,
  dispatch,
  handbook,
  midnight,
  blueprint,
  canvas,
  folio,
  protocol,
  ink,
];
