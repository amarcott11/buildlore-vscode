export interface FrontMatter {
  title: string;
  author: string;
  date: string;
  description: string;
  keywords: string;
}

const EMPTY: FrontMatter = { title: '', author: '', date: '', description: '', keywords: '' };

/**
 * Parse YAML front matter from markdown string.
 * Only handles simple key: value pairs (no nesting).
 */
export function parseFrontMatter(markdown: string): { meta: FrontMatter; body: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: { ...EMPTY }, body: markdown };

  const yaml = match[1];
  const body = match[2];
  const meta: FrontMatter = { ...EMPTY };

  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key in meta) {
      (meta as unknown as Record<string, string>)[key] = value;
    }
  }

  return { meta, body };
}

/**
 * Serialize front matter and body back to markdown.
 */
export function serializeFrontMatter(meta: FrontMatter, body: string): string {
  const hasValues = Object.values(meta).some((v) => v.trim() !== '');
  if (!hasValues) return body;

  const lines = ['---'];
  for (const [key, value] of Object.entries(meta)) {
    if (value.trim()) {
      lines.push(`${key}: "${value}"`);
    }
  }
  lines.push('---', '');

  return lines.join('\n') + body;
}
