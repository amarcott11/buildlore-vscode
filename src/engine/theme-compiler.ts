import type { Theme, TexturePreset } from './types/theme';

/** Returns CSS background-image value for a texture preset */
function textureCSS(preset: TexturePreset, opacity: number): string {
  const c = `rgba(0,0,0,${opacity})`;
  switch (preset) {
    case 'paper':
      return `repeating-linear-gradient(0deg, ${c} 0px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, ${c} 0px, transparent 1px, transparent 4px)`;
    case 'dots':
      return `radial-gradient(circle, ${c} 1px, transparent 1px)`;
    case 'grid':
      return `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`;
    case 'linen':
      return `linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%), linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%)`;
    case 'noise':
      return `repeating-linear-gradient(45deg, ${c} 0px, ${c} 1px, transparent 1px, transparent 3px), repeating-linear-gradient(-45deg, ${c} 0px, ${c} 1px, transparent 1px, transparent 3px)`;
    case 'lines':
      return `repeating-linear-gradient(0deg, ${c} 0px, ${c} 1px, transparent 1px, transparent 6px)`;
  }
}

/** Returns CSS background-size for a texture preset, or empty string if not needed */
function textureBgSize(preset: TexturePreset): string {
  switch (preset) {
    case 'dots': return '20px 20px';
    case 'grid': return '24px 24px';
    case 'linen': return '10px 10px';
    case 'noise': return '7px 7px';
    default: return '';
  }
}

/**
 * Compiles a Theme JSON object into a scoped CSS stylesheet string.
 * All rules are scoped under `.pf-preview` to prevent style leaks.
 */
export function compileThemeToCSS(theme: Theme): string {
  const s = (selector: string) => `.pf-preview ${selector}`;
  const { page, typography, elements, document: doc } = theme;

  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  };

  // filter: drop-shadow() renders better in Chromium PDF than box-shadow
  const dropShadowMap: Record<string, string> = {
    none: 'none',
    sm: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))',
    md: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
    lg: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))',
  };

  const densityScale: Record<string, number> = { compact: 0.65, normal: 1, airy: 1.5 };
  const density = densityScale[typography.contentDensity ?? 'normal'] ?? 1;
  const d = (value: string) => {
    if (density === 1) return value;
    const match = value.match(/^([\d.]+)(rem|em|px|pt|in)$/);
    if (!match) return value;
    return `${(parseFloat(match[1]) * density).toFixed(3)}${match[2]}`;
  };

  const lines: string[] = [];

  // -- Compute background properties --
  const bgMode = page.backgroundMode ?? 'solid';
  const bgColor = page.background;
  let bgImage = 'none';
  let bgSize = '';
  if (bgMode === 'gradient') {
    const dir = page.gradientDirection ?? 'to bottom';
    const color2 = page.gradientColor2 ?? bgColor;
    bgImage = `linear-gradient(${dir}, ${bgColor}, ${color2})`;
  } else if (bgMode === 'texture') {
    const preset = page.texturePreset ?? 'paper';
    const opacity = page.textureOpacity ?? 0.08;
    bgImage = textureCSS(preset, opacity);
    bgSize = textureBgSize(preset);
  }

  // -- Root / page --
  lines.push(`
.pf-preview {
  font-family: ${typography.baseFontFamily};
  font-size: ${typography.baseFontSize};
  line-height: ${typography.baseLineHeight};
  color: ${typography.baseColor};
  background-color: ${bgColor};
  background-image: ${bgImage};${bgSize ? `\n  background-size: ${bgSize};` : ''}
  max-width: ${page.maxWidth};
  margin: 0 auto;
  padding: ${page.margins.top} ${page.margins.right} ${page.margins.bottom} ${page.margins.left};
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (max-width: 768px) {
  .pf-preview {
    padding: 16px !important;
  }
}`);

  // -- Headings --
  for (let i = 1; i <= 6; i++) {
    const key = `h${i}` as keyof typeof elements;
    const h = elements[key] as Theme['elements']['h1'];
    const decoration = h.headingStyle ?? (h.borderBottom && h.borderBottom !== 'none' && h.borderBottom !== '' ? 'underline' : 'plain');
    const accentColor = h.headingBorderColor ?? h.color;

    let decorCSS = '';
    switch (decoration) {
      case 'underline':
        decorCSS = `  border-bottom: ${h.headingBorderColor ? h.borderBottom.replace(/[^ ]+$/, accentColor) : h.borderBottom};\n  padding-bottom: ${h.paddingBottom};`;
        break;
      case 'overline':
        decorCSS = `  border-top: ${h.headingBorderColor ? h.borderBottom.replace(/[^ ]+$/, accentColor) : h.borderBottom.replace('bottom', 'top')};\n  padding-top: ${h.paddingBottom};\n  border-bottom: none;`;
        break;
      case 'background':
        decorCSS = `  background: ${accentColor}11;\n  padding: 6px 10px;\n  border-radius: 4px;\n  border-bottom: none;`;
        break;
      case 'left-bar':
        decorCSS = `  border-left: 4px solid ${accentColor};\n  padding-left: 12px;\n  border-bottom: none;`;
        break;
      case 'pill':
        decorCSS = `  background: ${accentColor}15;\n  border-radius: 999px;\n  display: inline-block;\n  padding: 3px 13px;\n  border-bottom: none;`;
        break;
      case 'plain':
      default:
        decorCSS = `  border-bottom: none;\n  padding-bottom: 0;`;
        break;
    }

    lines.push(`
${s(`.pf-h${i}`)} {
  font-family: ${h.fontFamily};
  font-size: ${h.fontSize};
  font-weight: ${h.fontWeight};
  color: ${h.color};
  text-align: ${h.alignment};
  margin-top: ${d(h.marginTop)};
  margin-bottom: ${d(h.marginBottom)};
  text-transform: ${h.textTransform};
  line-height: 1.3;
${h.letterSpacing ? `  letter-spacing: ${h.letterSpacing};` : ''}
${decorCSS}
${h.pageBreakBefore ? '  page-break-before: always;' : ''}
}`);
  }

  // -- Paragraph --
  const p = elements.paragraph;
  lines.push(`
${s('.pf-paragraph')} {
  font-size: ${p.fontSize};
  line-height: ${p.lineHeight};
  margin-top: 0;
  margin-bottom: ${d(p.marginBottom)};
  color: ${p.color};
  text-indent: ${p.firstLineIndent};
  text-align: ${p.textAlign ?? 'left'};
}`);

  // -- Drop cap --
  if (p.dropCap) {
    const h1Color = elements.h1.color;
    lines.push(`
${s('.pf-h1 + .pf-paragraph::first-letter')},
${s('.pf-h2 + .pf-paragraph::first-letter')},
${s('.pf-h3 + .pf-paragraph::first-letter')} {
  float: left;
  font-size: 3.2em;
  line-height: 0.85;
  padding-right: 2px;
  font-weight: 700;
  color: ${h1Color};
}`);
  }

  // -- Blockquote --
  const bq = elements.blockquote;
  const quoteStyle = bq.quoteStyle ?? 'border-left';
  let bqCSS = '';
  switch (quoteStyle) {
    case 'border-left':
      bqCSS = `  border-left: ${bq.borderLeft};\n  background: ${bq.background};`;
      break;
    case 'background':
      bqCSS = `  border-left: none;\n  background: ${bq.background};\n  border-radius: 8px;`;
      break;
    case 'quote-marks':
      bqCSS = `  border-left: none;\n  background: transparent;\n  position: relative;\n  padding-left: 40px;`;
      break;
    case 'indented':
      bqCSS = `  border-left: none;\n  background: transparent;\n  padding-left: 32px;\n  padding-right: 32px;`;
      break;
  }
  lines.push(`
${s('.pf-blockquote')} {
  padding: ${bq.padding};
  font-style: ${bq.fontStyle};
  margin: 0 0 ${d(bq.marginBottom)} 0;
${bqCSS}
}`);

  if (quoteStyle === 'quote-marks') {
    lines.push(`
${s('.pf-blockquote::before')} {
  content: "\\201C";
  position: absolute;
  left: 0;
  top: -2px;
  font-size: 48px;
  line-height: 1;
  color: ${bq.borderLeft.split(' ').pop() ?? '#999'};
  font-family: Georgia, serif;
}`);
  }

  // -- Inline code --
  const ci = elements.code_inline;
  lines.push(`
${s('.pf-code-inline')} {
  font-family: ${ci.fontFamily};
  font-size: ${ci.fontSize};
  background: ${ci.background};
  padding: ${ci.padding};
  border-radius: ${ci.borderRadius};
  color: ${ci.color};
}`);

  // -- Code block --
  const cb = elements.code_block;
  const cbAccentBar = cb.accentBar ? `\n  border-left: 4px solid ${cb.accentBarColor ?? '#3b82f6'};` : '';
  const cbBorder = cb.border && cb.border !== 'none' ? `\n  border: ${cb.border};` : '';
  lines.push(`
${s('.pf-code-block')} {
  font-family: ${cb.fontFamily};
  font-size: ${cb.fontSize};
  background: ${cb.background};
  color: ${cb.color};
  padding: ${cb.padding};
  border-radius: ${cb.borderRadius};
  overflow-x: auto;
  margin: 0 0 ${d('16px')} 0;${cbAccentBar}${cbBorder}
}
${s('.pf-code-block code')} {
  font-family: inherit;
  font-size: inherit;
  background: none;
  padding: 0;
  color: inherit;
}`);

  // -- Image --
  const img = elements.image;
  const flexAlign =
    img.alignment === 'center' ? 'center'
      : img.alignment === 'right' ? 'flex-end'
        : 'flex-start';
  const captionPosition = img.captionPosition ?? 'below';
  const captionAbove = captionPosition === 'above';
  lines.push(`
${s('.pf-image')} {
  display: flex;
  flex-direction: column;
  align-items: ${flexAlign};
  margin-bottom: 16px;
}
${s('.pf-image img')} {
  max-width: ${img.maxWidth};
  border-radius: ${img.borderRadius};
  box-shadow: ${shadowMap[img.shadow] || 'none'};
}
${s('.pf-image figcaption')} {
  align-self: stretch;
  font-size: ${img.captionFontSize};
  color: ${img.captionColor};
  text-align: ${img.captionAlign ?? 'center'};
  font-style: ${img.captionFontStyle ?? 'normal'};
${captionAbove ? '  order: -1;\n  margin-bottom: 8px;' : '  margin-top: 8px;'}
}`);

  // -- Table --
  const tbl = elements.table;
  const tblLayout = tbl.tableLayout ?? 'auto';
  const stripedRule =
    tbl.borderStyle === 'striped'
      ? `\n${s('.pf-table tbody tr:nth-child(even)')} { background: ${tbl.headerBackground}; }`
      : '';
  const tableBorder =
    tbl.borderStyle === 'minimal' ? 'border: none;' : 'border: 1px solid #e5e7eb;';
  const cellBorder =
    tbl.borderStyle === 'minimal'
      ? 'border: none; border-bottom: 1px solid #e5e7eb;'
      : 'border: 1px solid #e5e7eb;';
  lines.push(`
${s('.pf-table-wrapper')} {
  overflow-x: auto;
  max-width: 100%;
}
${s('.pf-table')} {
  width: 100%;
  border-collapse: collapse;
  font-size: ${tbl.fontSize};
  margin-bottom: 16px;
  ${tableBorder}
  ${tblLayout === 'fixed' ? 'table-layout: fixed;' : ''}
}
${s('.pf-table th')},
${s('.pf-table td')} {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
${s('.pf-table th')} {
  background: ${tbl.headerBackground};
  font-weight: ${tbl.headerFontWeight};
  padding: ${tbl.cellPadding};
  text-align: left;
  ${cellBorder}
}
${s('.pf-table td')} {
  padding: ${tbl.cellPadding};
  ${cellBorder}
}${stripedRule}`);

  // -- Link --
  const lnk = elements.link;
  const linkDeco = lnk.linkStyle ?? (lnk.underline ? 'underline' : 'none');
  const linkDecoCSS = linkDeco === 'underline' ? 'underline'
    : linkDeco === 'dotted' ? 'underline' : 'none';
  const linkDecoStyle = linkDeco === 'dotted' ? '\n  text-decoration-style: dotted;' : '';
  lines.push(`
${s('.pf-link')} {
  color: ${lnk.color};
  text-decoration: ${linkDecoCSS};${linkDecoStyle}
}
${s('.pf-link:hover')} {
  color: ${lnk.hoverColor};${linkDeco === 'hover-only' ? '\n  text-decoration: underline;' : ''}
}`);

  // -- Horizontal rule --
  const hr = elements.hr;
  // Apply density to margin (format: "32px 0")
  const hrMarginParts = hr.margin.split(' ');
  const hrMargin = hrMarginParts.length >= 2 ? `${d(hrMarginParts[0])} ${hrMarginParts.slice(1).join(' ')}` : d(hr.margin);
  lines.push(`
${s('.pf-hr')} {
  border: none;
  border-top: ${hr.thickness} ${hr.style === 'decorative' ? 'double' : hr.style} ${hr.color};
  width: ${hr.width};
  margin: ${hrMargin};
}`);

  // -- Ordered list --
  const ol = elements.list_ordered;
  lines.push(`
${s('.pf-list-ordered')} {
  padding-left: ${ol.indentPerLevel};
  margin-bottom: 16px;
  list-style-type: ${ol.style === 'hierarchical' ? 'decimal' : ol.style === 'alpha' ? 'lower-alpha' : ol.style === 'roman' ? 'lower-roman' : 'decimal'};
}
${s('.pf-list-ordered li')} {
  margin-bottom: ${ol.itemSpacing};
}${ol.listMarkerColor ? `
${s('.pf-list-ordered li::marker')} {
  color: ${ol.listMarkerColor};
}` : ''}`);

  // -- Unordered list --
  const ul = elements.list_unordered;
  const ulStyleType =
    ul.style === 'custom' ? `"${ul.customBullet} "` :
      ul.style === 'dash' ? '"– "' :
        ul.style;
  lines.push(`
${s('.pf-list-unordered')} {
  padding-left: ${ul.indentPerLevel};
  margin-bottom: 16px;
  list-style-type: ${ulStyleType};
}
${s('.pf-list-unordered li')} {
  margin-bottom: ${ul.itemSpacing};
}${ul.listMarkerColor ? `
${s('.pf-list-unordered li::marker')} {
  color: ${ul.listMarkerColor};
}` : ''}`);

  // -- Mermaid --
  const mmd = elements.mermaid;
  if (mmd) {
    lines.push(`
${s('.pf-mermaid')} {
  background: ${mmd.background};
  border-radius: ${mmd.borderRadius};
  padding: 16px;
  text-align: center;
  overflow-x: auto;
  margin-bottom: 16px;
}
${s('.pf-mermaid svg')} {
  max-width: 100%;
  height: auto;
}
${s('.pf-mermaid-error')} {
  color: #dc2626;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-align: left;
  white-space: pre-wrap;
  padding: 12px;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}
${s('.pf-mermaid-loading')} {
  color: #94a3b8;
  font-size: 13px;
  padding: 24px 0;
}`);
  }

  // -- Cover page --
  lines.push(`
${s('.pf-cover-page')} {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 48px 32px;
  margin-bottom: 32px;
  border-bottom: 2px solid ${elements.hr.color};
  position: relative;
  overflow: hidden;
}
${s('.pf-cover-centered')} { text-align: center; }
${s('.pf-cover-left-aligned')} .pf-cover-content { text-align: left; align-self: flex-start; }
${s('.pf-cover-full-image')} { color: white; }
${s('.pf-cover-bg-image')} {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
}
${s('.pf-cover-full-image')} .pf-cover-bg-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
}
${s('.pf-cover-content')} { position: relative; z-index: 1; }
${s('.pf-cover-title')} {
  font-size: 28pt;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 12px;
  color: ${elements.h1.color};
}
${s('.pf-cover-full-image')} .pf-cover-title { color: white; }
${s('.pf-cover-subtitle')} {
  font-size: 15pt;
  color: ${typography.baseColor};
  opacity: 0.8;
  margin-bottom: 24px;
}
${s('.pf-cover-author')} {
  font-size: 13pt;
  font-weight: 500;
  color: ${elements.link.color};
  margin-bottom: 4px;
}
${s('.pf-cover-date')} {
  font-size: 11pt;
  color: ${typography.baseColor};
  opacity: 0.6;
}
${s('.pf-cover-image')} {
  max-width: 200px;
  border-radius: 8px;
  margin-bottom: 24px;
}`);

  // -- TOC styles (vary by style setting) --
  const tocStyle = doc.tableOfContents.style;
  const isIndented = tocStyle === 'indented' || tocStyle === 'dotted-leaders';
  const tocIndent = doc.tableOfContents.indentSize ?? 20;

  lines.push(`
${s('.pf-toc')} {
  margin-bottom: 32px;
  page-break-after: always;
}
${s('.pf-toc-title')} {
  font-size: 16pt;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${elements.h1.color};
}
${s('.pf-toc-list')} {
  list-style: none;
  padding: 0;
  margin: 0;
}
${s('.pf-toc-list li')} {
  padding-top: 5px;
  padding-bottom: 5px;
  ${tocStyle === 'dotted-leaders' ? 'display: flex; align-items: baseline;' : ''}
}
${s('.pf-toc-list a')} {
  color: ${elements.link.color};
  text-decoration: none;
  ${tocStyle === 'dotted-leaders' ? 'flex-shrink: 0;' : ''}
}
${s('.pf-toc-list a:hover')} {
  text-decoration: underline;
}
${s('.pf-toc-number')} {
  font-variant-numeric: tabular-nums;
  margin-right: 2px;
}
${s('.pf-heading-number')} {
  font-variant-numeric: tabular-nums;
}`);

  // Indentation per heading level (only for indented & dotted-leaders styles)
  if (isIndented) {
    for (let i = 2; i <= 6; i++) {
      lines.push(`${s(`.pf-toc-h${i}`)} { padding-left: ${tocIndent * (i - 1)}px; }`);
    }
  } else {
    // Simple: flat list, smaller font for deeper levels
    lines.push(`
${s('.pf-toc-h2')} { padding-left: 0; }
${s('.pf-toc-h3')} { padding-left: 0; font-size: 0.95em; }
${s('.pf-toc-h4')} { padding-left: 0; font-size: 0.9em; }
${s('.pf-toc-h5')} { padding-left: 0; font-size: 0.85em; }
${s('.pf-toc-h6')} { padding-left: 0; font-size: 0.8em; }`);
  }

  // Dotted leaders decoration
  if (tocStyle === 'dotted-leaders') {
    lines.push(`
${s('.pf-toc-list li::after')} {
  content: '';
  flex: 1;
  border-bottom: 1px dotted #ccc;
  margin: 0 8px;
  min-width: 32px;
}`);
  }

  // H1 styling in TOC — make it visually distinct
  lines.push(`
${s('.pf-toc-h1')} {
  font-weight: 600;
}
${s('.pf-toc-h1 a')} {
  font-weight: 600;
}`)

  // -- Header / Footer (visible in preview when enabled) --
  if (doc.header.enabled) {
    lines.push(`
${s('.pf-doc-header')} {
  font-size: ${doc.header.fontSize};
  color: ${doc.header.color};
  text-align: center;
  padding-bottom: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  white-space: pre-line;
}`);
  }
  if (doc.footer.enabled) {
    lines.push(`
${s('.pf-doc-footer')} {
  font-size: ${doc.footer.fontSize};
  color: ${doc.footer.color};
  text-align: center;
  padding-top: 8px;
  margin-top: 32px;
  border-top: 1px solid #e5e7eb;
  white-space: pre-line;
}`);
  }

  // -- Print styles --
  lines.push(`
@media print {
  .pf-preview {
    max-width: none;
    padding: ${page.margins.top} ${page.margins.right} ${page.margins.bottom} ${page.margins.left};
    background-color: ${bgColor};
    background-image: ${bgImage};${bgSize ? `\n    background-size: ${bgSize};` : ''}
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }

  @page {
    size: ${page.size === 'custom' ? 'auto' : page.size} ${page.orientation};
    margin: 0;
  }

  /* Prevent orphaned headings */
  .pf-preview .pf-h1,
  .pf-preview .pf-h2,
  .pf-preview .pf-h3,
  .pf-preview .pf-h4,
  .pf-preview .pf-h5,
  .pf-preview .pf-h6 {
    break-after: avoid;
  }

  /* Keep images together; swap box-shadow for drop-shadow (renders better in PDF) */
  .pf-preview .pf-image {
    break-inside: avoid;
  }
  .pf-preview .pf-image img {
    box-shadow: none;
    filter: ${dropShadowMap[img.shadow] || 'none'};
  }

  /* Keep code blocks together when small */
  .pf-preview .pf-code-block {
    break-inside: avoid;
  }

  /* Keep tables together when possible */
  .pf-preview .pf-table {
    break-inside: avoid;
    table-layout: fixed;
    width: 100%;
  }

  .pf-preview .pf-table-wrapper {
    overflow: visible;
  }

  /* Keep blockquotes together */
  .pf-preview .pf-blockquote {
    break-inside: avoid;
  }

  /* Keep mermaid diagrams together */
  .pf-preview .pf-mermaid {
    break-inside: avoid;
  }

  /* Cover page always on its own page */
  .pf-preview .pf-cover-page {
    break-after: page;
    min-height: 100vh;
    border-bottom: none;
  }

  /* TOC on its own page */
  .pf-preview .pf-toc {
    break-after: page;
  }

  /* Keep watermark together */
  .pf-preview .pf-watermark {
    break-inside: avoid;
  }
}`);

  return lines.join('\n');
}

export interface ExportHTMLOptions {
  title?: string;
  coverPageHTML?: string;
  tocEnabled?: boolean;
  headerContent?: string;
  footerContent?: string;
  responsive?: boolean;
  showWatermark?: boolean;
  googleFontsLink?: string;
}

/**
 * Generates a self-contained HTML document from rendered markdown + theme CSS.
 */
export function generateExportHTML(
  html: string,
  css: string,
  options: ExportHTMLOptions = {},
): string {
  const {
    title = 'BuildLore Document',
    coverPageHTML = '',
    tocEnabled = false,
    headerContent = '',
    footerContent = '',
    responsive = true,
    showWatermark = false,
    googleFontsLink = '',
  } = options;

  const responsiveCSS = responsive
    ? `
    @media (max-width: 768px) {
      .pf-preview { padding: 16px !important; }
      .pf-preview .pf-h1 { font-size: 18pt !important; }
      .pf-preview .pf-h2 { font-size: 15pt !important; }
      .pf-preview .pf-code-block { padding: 12px !important; }
      .pf-preview .pf-table { font-size: 9pt !important; }
      .pf-export-toc-sidebar { display: none !important; }
    }
    body { margin: 0; }
    .pf-export-wrapper { display: flex; min-height: 100vh; }
    .pf-export-main { flex: 1; }
    .pf-export-toc-sidebar {
      width: 260px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      border-right: 1px solid #e5e7eb;
      padding: 24px 16px;
      background: #f9fafb;
      font-size: 10pt;
      flex-shrink: 0;
    }
    .pf-export-toc-sidebar h3 {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin: 0 0 12px 0;
    }
    .pf-export-toc-sidebar ul { list-style: none; padding: 0; margin: 0; }
    .pf-export-toc-sidebar li { padding: 3px 0; }
    .pf-export-toc-sidebar a { color: #374151; text-decoration: none; }
    .pf-export-toc-sidebar a:hover { color: #2563eb; }
    .pf-export-toc-sidebar .toc-h2 { padding-left: 12px; }
    .pf-export-toc-sidebar .toc-h3 { padding-left: 24px; }
    @media print {
      .pf-export-toc-sidebar { display: none !important; }
      .pf-export-wrapper { display: block; }
    }`
    : 'body { margin: 0; }';

  const tocScript = tocEnabled
    ? `<script>
document.addEventListener('DOMContentLoaded', function() {
  var headings = document.querySelectorAll('.pf-preview .pf-h1, .pf-preview .pf-h2, .pf-preview .pf-h3');
  var sidebar = document.querySelector('.pf-export-toc-sidebar ul');
  if (!sidebar || headings.length === 0) return;
  headings.forEach(function(h, i) {
    var id = 'heading-' + i;
    h.id = id;
    var li = document.createElement('li');
    li.className = 'toc-' + h.tagName.toLowerCase().replace('pf-', '');
    var cls = Array.from(h.classList).find(function(c) { return c.match(/pf-h[1-6]/); });
    if (cls) li.className = 'toc-' + cls.replace('pf-', '');
    var a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = h.textContent;
    li.appendChild(a);
    sidebar.appendChild(li);
  });
});
</script>`
    : '';

  const sidebarHTML = tocEnabled
    ? `<nav class="pf-export-toc-sidebar"><h3>Contents</h3><ul></ul></nav>`
    : '';

  const googleFontsHTML = googleFontsLink
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${googleFontsLink}" rel="stylesheet">`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  ${googleFontsHTML}
  <style>${css}\n${responsiveCSS}</style>
</head>
<body>
  <div class="pf-export-wrapper">
    ${sidebarHTML}
    <div class="pf-export-main">
      <div class="pf-preview">
        ${headerContent ? `<div class="pf-doc-header">${escapeHTML(headerContent)}</div>` : ''}
        ${coverPageHTML}
        <div>${html}</div>
        ${footerContent ? `<div class="pf-doc-footer">${escapeHTML(footerContent)}</div>` : ''}
        ${showWatermark ? `<div class="pf-watermark" style="text-align:center;padding:24px 0 8px;margin-top:32px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Made with <a href="https://buildlore.com" style="color:#6b7280;text-decoration:underline;" target="_blank" rel="noopener">BuildLore</a></div>` : ''}
      </div>
    </div>
  </div>
  ${tocScript}
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
