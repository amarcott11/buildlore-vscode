/**
 * Automated screenshot generator for BuildLore templates.
 *
 * Renders sample markdown through each built-in template and captures
 * screenshots using Playwright (headless Chromium).
 *
 * Usage:
 *   npx playwright install chromium
 *   npx ts-node scripts/generate-screenshots.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';

import { renderMarkdown } from '../src/engine/markdown';
import { compileThemeToCSS, generateExportHTML } from '../src/engine/theme-compiler';
import { parseFrontMatter } from '../src/engine/frontmatter';
import { injectHeadingNumbers } from '../src/engine/heading-inject';
import { buildTocHTML, buildCoverPageHTML } from '../src/engine/document-features';
import { extractGoogleFonts, buildGoogleFontsLink } from '../src/engine/google-fonts';
import { builtInTemplates } from '../src/engine/templates';
import type { Theme } from '../src/engine/types/theme';

const IMAGES_DIR = path.resolve(__dirname, '..', 'images');
const SAMPLE_MD = path.resolve(__dirname, 'sample.md');

// Gallery screenshots: consistent viewport
const GALLERY_WIDTH = 900;
const GALLERY_HEIGHT = 700;

// Hero screenshot: wider viewport for a showcase shot
const HERO_WIDTH = 1200;
const HERO_HEIGHT = 800;

// Which template to use for the hero screenshot (index into builtInTemplates)
const HERO_TEMPLATE_INDEX = 0; // Clean Technical

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface BuildOptions {
  /** Skip cover page and TOC so the screenshot shows document content */
  skipCoverAndToc?: boolean;
}

function buildFullHTML(template: Theme, markdownSource: string, opts: BuildOptions = {}): string {
  const { meta, body } = parseFrontMatter(markdownSource);

  // Render markdown to HTML
  let html = renderMarkdown(body);

  // Inject heading numbers if configured
  const headingNumbering = template.document.headingNumbering ?? 'none';
  html = injectHeadingNumbers(html, headingNumbering);

  // Compile theme CSS
  const css = compileThemeToCSS(template);

  // Build cover page and TOC unless skipped (gallery shots skip these)
  let coverPageHTML = '';
  if (!opts.skipCoverAndToc) {
    if (template.document.coverPage.enabled) {
      const coverData = {
        title: meta.title || 'BuildLore Style Guide',
        subtitle: meta.description || '',
        author: meta.author || '',
        date: meta.date || '',
        imageUrl: '',
      };
      coverPageHTML += buildCoverPageHTML(coverData, template.document.coverPage.layout);
    }

    if (template.document.tableOfContents.enabled) {
      coverPageHTML += buildTocHTML(body, template.document.tableOfContents, headingNumbering);
    }
  }

  // Google Fonts
  const googleFonts = extractGoogleFonts(template);
  const googleFontsLink = buildGoogleFontsLink(googleFonts);

  // Header / footer content
  const headerContent = template.document.header.enabled ? template.document.header.content : '';
  const footerContent = template.document.footer.enabled ? template.document.footer.content : '';

  return generateExportHTML(html, css, {
    title: meta.title || template.name,
    coverPageHTML,
    tocEnabled: false, // Disable sidebar TOC for screenshots — keep it clean
    headerContent,
    footerContent,
    responsive: false,
    showWatermark: false,
    googleFontsLink,
  });
}

async function main() {
  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Read sample markdown (normalize Windows \r\n to \n for front matter parsing)
  const markdownSource = fs.readFileSync(SAMPLE_MD, 'utf-8').replace(/\r\n/g, '\n');

  console.log('Launching browser...');
  const browser = await chromium.launch();

  try {
    // --- Generate gallery screenshots (one per template) ---
    for (let i = 0; i < builtInTemplates.length; i++) {
      const template = builtInTemplates[i];
      const slug = slugify(template.name);
      const outPath = path.join(IMAGES_DIR, `template-${slug}.png`);

      console.log(`  [${i + 1}/${builtInTemplates.length}] ${template.name} → ${path.basename(outPath)}`);

      const fullHTML = buildFullHTML(template, markdownSource, { skipCoverAndToc: true });

      const page = await browser.newPage({
        viewport: { width: GALLERY_WIDTH, height: GALLERY_HEIGHT },
      });

      await page.setContent(fullHTML, { waitUntil: 'networkidle' });

      // Wait for Google Fonts to finish loading
      await page.evaluate(() => document.fonts.ready);

      // Small delay for any final rendering
      await page.waitForTimeout(300);

      await page.screenshot({ path: outPath, type: 'png' });
      await page.close();
    }

    // --- Generate hero screenshot ---
    {
      const heroTemplate = builtInTemplates[HERO_TEMPLATE_INDEX];
      const heroPath = path.join(IMAGES_DIR, 'screenshot-preview.png');

      console.log(`  [hero] ${heroTemplate.name} → screenshot-preview.png`);

      const fullHTML = buildFullHTML(heroTemplate, markdownSource);

      const page = await browser.newPage({
        viewport: { width: HERO_WIDTH, height: HERO_HEIGHT },
      });

      await page.setContent(fullHTML, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      await page.screenshot({ path: heroPath, type: 'png' });
      await page.close();
    }

    console.log(`\nDone! ${builtInTemplates.length + 1} screenshots saved to images/`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Screenshot generation failed:', err);
  process.exit(1);
});
