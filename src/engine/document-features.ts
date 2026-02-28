import type { CoverPageData } from './cover-page-data';
import type { CoverPageLayout, HeadingNumbering, TocConfig } from './types/theme';
import { numberHeadings } from './heading-numbering';

/**
 * Build static HTML for the cover page (used in export).
 */
export function buildCoverPageHTML(data: CoverPageData, layout: CoverPageLayout): string {
  if (!data.title && !data.subtitle && !data.author) return '';

  const bgImage =
    data.imageUrl && layout === 'full-image'
      ? `<div class="pf-cover-bg-image" style="background-image:url(${escapeAttr(data.imageUrl)})"></div>`
      : '';

  const inlineImage =
    data.imageUrl && layout !== 'full-image'
      ? `<img src="${escapeAttr(data.imageUrl)}" alt="" class="pf-cover-image" />`
      : '';

  return `<div class="pf-cover-page pf-cover-${layout}">
  ${bgImage}
  <div class="pf-cover-content">
    ${inlineImage}
    ${data.title ? `<h1 class="pf-cover-title">${escapeHTML(data.title)}</h1>` : ''}
    ${data.subtitle ? `<p class="pf-cover-subtitle">${escapeHTML(data.subtitle)}</p>` : ''}
    ${data.author ? `<p class="pf-cover-author">${escapeHTML(data.author)}</p>` : ''}
    ${data.date ? `<p class="pf-cover-date">${escapeHTML(data.date)}</p>` : ''}
  </div>
</div>`;
}

/**
 * Extract headings from markdown source and build a TOC HTML block.
 */
export function buildTocHTML(markdown: string, config: TocConfig, headingNumbering?: HeadingNumbering): string {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: { level: number; text: string; id: string }[] = [];
  let match;
  let idx = 0;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    if (level > config.depth) continue;
    const text = match[2].replace(/[*_`[\]]/g, '');
    items.push({ level, text, id: `heading-${idx++}` });
  }

  if (items.length === 0) return '';

  const numbering = headingNumbering ?? config.numbering ?? 'none';
  const numbered = numberHeadings(items, numbering, config.depth);

  const listItems = numbered
    .map((item, i) => {
      const prefix = item.prefix ? `<span class="pf-toc-number">${escapeHTML(item.prefix)}</span>` : '';
      return `<li class="pf-toc-h${item.level}">${prefix}<a href="#${items[i].id}">${escapeHTML(item.text)}</a></li>`;
    })
    .join('\n    ');

  return `<div class="pf-toc">
  <h2 class="pf-toc-title">${escapeHTML(config.title)}</h2>
  <ul class="pf-toc-list">
    ${listItems}
  </ul>
</div>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
