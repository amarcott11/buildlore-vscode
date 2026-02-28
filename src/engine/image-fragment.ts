export interface ImageFragmentData {
  width?: number;         // 1-99 percentage
  nocaption?: boolean;
  align?: 'left' | 'center' | 'right';
  radius?: string;        // e.g. '8px'
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  capsize?: string;       // e.g. '9pt'
  capcolor?: string;      // stored WITH '#' prefix internally
  capalign?: 'left' | 'center' | 'right';
  cappos?: 'above' | 'below';
  capstyle?: 'normal' | 'italic';
}

/**
 * Parse a URL's fragment into ImageFragmentData.
 * E.g. "https://img.png#width=50&align=right&capcolor=6b7280"
 *   -> { baseUrl: "https://img.png", data: { width: 50, align: 'right', capcolor: '#6b7280' } }
 */
export function parseImageFragment(url: string): { baseUrl: string; data: ImageFragmentData } {
  const hashIdx = url.indexOf('#');
  if (hashIdx === -1) return { baseUrl: url, data: {} };

  const baseUrl = url.slice(0, hashIdx);
  const fragment = url.slice(hashIdx + 1);
  const data: ImageFragmentData = {};

  for (const param of fragment.split('&')) {
    const eqIdx = param.indexOf('=');
    const key = eqIdx === -1 ? param : param.slice(0, eqIdx);
    const val = eqIdx === -1 ? '' : param.slice(eqIdx + 1);

    switch (key) {
      case 'width': {
        const pct = parseInt(val, 10);
        if (pct > 0 && pct < 100) data.width = pct;
        break;
      }
      case 'nocaption':
        data.nocaption = true;
        break;
      case 'align':
        if (val === 'left' || val === 'center' || val === 'right') data.align = val;
        break;
      case 'radius':
        if (val) data.radius = val;
        break;
      case 'shadow':
        if (val === 'none' || val === 'sm' || val === 'md' || val === 'lg') data.shadow = val;
        break;
      case 'capsize':
        if (val) data.capsize = val;
        break;
      case 'capcolor':
        if (val) data.capcolor = '#' + val;
        break;
      case 'capalign':
        if (val === 'left' || val === 'center' || val === 'right') data.capalign = val;
        break;
      case 'cappos':
        if (val === 'above' || val === 'below') data.cappos = val;
        break;
      case 'capstyle':
        if (val === 'normal' || val === 'italic') data.capstyle = val;
        break;
    }
  }

  return { baseUrl, data };
}

/**
 * Build a URL fragment string (no leading '#') from ImageFragmentData.
 * Only emits non-default (non-undefined) values.
 */
export function buildImageFragment(data: ImageFragmentData): string {
  const parts: string[] = [];

  if (data.width !== undefined) parts.push(`width=${data.width}`);
  if (data.nocaption) parts.push('nocaption');
  if (data.align) parts.push(`align=${data.align}`);
  if (data.radius) parts.push(`radius=${data.radius}`);
  if (data.shadow) parts.push(`shadow=${data.shadow}`);
  if (data.capsize) parts.push(`capsize=${data.capsize}`);
  if (data.capcolor) parts.push(`capcolor=${data.capcolor.replace('#', '')}`);
  if (data.capalign) parts.push(`capalign=${data.capalign}`);
  if (data.cappos) parts.push(`cappos=${data.cappos}`);
  if (data.capstyle) parts.push(`capstyle=${data.capstyle}`);

  return parts.join('&');
}
