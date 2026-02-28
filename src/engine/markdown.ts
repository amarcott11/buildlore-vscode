import MarkdownIt from 'markdown-it';
import { parseImageFragment } from './image-fragment';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

// Add class hooks to rendered elements for theme targeting
md.renderer.rules.fence = (tokens, idx, _options, _env, _self) => {
  const token = tokens[idx];
  const lang = token.info.trim();
  if (lang === 'mermaid') {
    const encoded = typeof btoa === 'function'
      ? btoa(unescape(encodeURIComponent(token.content)))
      : Buffer.from(token.content).toString('base64');
    return `<div class="pf-mermaid" data-mermaid="${encoded}"><div class="pf-mermaid-loading">Loading diagram...</div></div>`;
  }
  const langClass = lang ? ` data-lang="${lang}"` : '';
  const code = md.utils.escapeHtml(token.content);
  return `<pre class="pf-code-block"${langClass}><code>${code}</code></pre>`;
};

md.renderer.rules.code_inline = (tokens, idx) => {
  const code = md.utils.escapeHtml(tokens[idx].content);
  return `<code class="pf-code-inline">${code}</code>`;
};

// Wrap blockquotes
const defaultBlockquoteOpen =
  md.renderer.rules.blockquote_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.blockquote_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'pf-blockquote');
  return defaultBlockquoteOpen(tokens, idx, options, env, self);
};

// Wrap tables
const defaultTableOpen =
  md.renderer.rules.table_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'pf-table');
  return '<div class="pf-table-wrapper">' + defaultTableOpen(tokens, idx, options, env, self);
};

// Close table wrapper
const defaultTableClose =
  md.renderer.rules.table_close ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
  return defaultTableClose(tokens, idx, options, env, self) + '</div>';
};

// Wrap images — parse multi-param fragments and generate per-image inline styles
const imgShadowMap: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
};

md.renderer.rules.image = (tokens, idx, options, _env, self) => {
  const token = tokens[idx];
  const rawSrc = token.attrGet('src') || '';
  const alt = self.renderInlineAsText(token.children || [], options, _env);
  const title = token.attrGet('title') || '';

  const { baseUrl, data } = parseImageFragment(rawSrc);

  // Always keep title on <img> for hover/accessibility
  const titleAttr = title ? ` title="${md.utils.escapeHtml(title)}"` : '';

  // --- Figure inline styles (per-image alignment override) ---
  const figStyles: string[] = [];
  if (data.align) {
    const flexVal = data.align === 'center' ? 'center' : data.align === 'right' ? 'flex-end' : 'flex-start';
    figStyles.push(`align-items: ${flexVal}`);
  }
  const figStyleAttr = figStyles.length > 0 ? ` style="${figStyles.join('; ')}"` : '';

  // --- Img inline styles ---
  const imgStyles: string[] = [];
  if (data.width) imgStyles.push(`width: ${data.width}%`);
  if (data.radius) imgStyles.push(`border-radius: ${data.radius}`);
  if (data.shadow) imgStyles.push(`box-shadow: ${imgShadowMap[data.shadow] || 'none'}`);
  const imgStyleAttr = imgStyles.length > 0 ? ` style="${imgStyles.join('; ')}"` : '';

  // --- Caption ---
  let captionHTML = '';
  if (!data.nocaption) {
    const captionText = title || alt;
    if (captionText) {
      const capStyles: string[] = [];
      if (data.capsize) capStyles.push(`font-size: ${data.capsize}`);
      if (data.capcolor) capStyles.push(`color: ${data.capcolor}`);
      if (data.capalign) capStyles.push(`text-align: ${data.capalign}`);
      if (data.capstyle) capStyles.push(`font-style: ${data.capstyle}`);
      if (data.cappos === 'above') {
        capStyles.push('order: -1');
        capStyles.push('margin-bottom: 8px');
        capStyles.push('margin-top: 0');
      }
      const capStyleAttr = capStyles.length > 0 ? ` style="${capStyles.join('; ')}"` : '';
      captionHTML = `<figcaption${capStyleAttr}>${md.utils.escapeHtml(captionText)}</figcaption>`;
    }
  }

  return `<figure class="pf-image"${figStyleAttr}><img src="${md.utils.escapeHtml(baseUrl)}" alt="${md.utils.escapeHtml(alt)}"${titleAttr}${imgStyleAttr} />${captionHTML}</figure>`;
};

// Add class hooks to headings
for (let level = 1; level <= 6; level++) {
  const tag = `heading_open` as const;
  const prev = md.renderer.rules[tag];
  md.renderer.rules[tag] = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.tag === `h${level}`) {
      token.attrJoin('class', `pf-h${level}`);
    }
    if (prev) return prev(tokens, idx, options, env, self);
    return self.renderToken(tokens, idx, options);
  };
}

// Add class to paragraphs
const defaultParagraphOpen =
  md.renderer.rules.paragraph_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.paragraph_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'pf-paragraph');
  return defaultParagraphOpen(tokens, idx, options, env, self);
};

// Add class to links
const defaultLinkOpen =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'pf-link');
  return defaultLinkOpen(tokens, idx, options, env, self);
};

// Add class to hr
const defaultHrRule =
  md.renderer.rules.hr ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.hr = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'pf-hr');
  return defaultHrRule(tokens, idx, options, env, self);
};

// Add classes to lists
const defaultOrderedListOpen =
  md.renderer.rules.ordered_list_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.ordered_list_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'pf-list-ordered');
  return defaultOrderedListOpen(tokens, idx, options, env, self);
};

const defaultBulletListOpen =
  md.renderer.rules.bullet_list_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.bullet_list_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'pf-list-unordered');
  return defaultBulletListOpen(tokens, idx, options, env, self);
};

export function renderMarkdown(source: string): string {
  return md.render(source);
}
