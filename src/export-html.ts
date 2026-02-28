import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { renderMarkdown } from './engine/markdown';
import { compileThemeToCSS, generateExportHTML } from './engine/theme-compiler';
import { parseFrontMatter } from './engine/frontmatter';
import { buildCoverPageHTML, buildTocHTML } from './engine/document-features';
import { injectHeadingNumbers } from './engine/heading-inject';
import { extractGoogleFonts, buildGoogleFontsLink } from './engine/google-fonts';
import { builtInTemplates } from './engine/templates';
import { loadConfig } from './config';
import type { Theme } from './engine/types/theme';

export async function exportHTML(
  _context: vscode.ExtensionContext,
  document: vscode.TextDocument,
): Promise<void> {
  // Get current theme
  const config = loadConfig();
  const theme: Theme = builtInTemplates.find((t) => t.name === config.template)
    ?? builtInTemplates[0];

  // Run the pipeline
  const { meta, body } = parseFrontMatter(document.getText());
  const headingNumbering = theme.document.headingNumbering ?? 'none';
  const renderedHtml = renderMarkdown(body);
  const html = injectHeadingNumbers(renderedHtml, headingNumbering);
  const css = compileThemeToCSS(theme);

  const tocHTML = theme.document.tableOfContents.enabled
    ? buildTocHTML(body, theme.document.tableOfContents, headingNumbering)
    : '';

  const coverHTML = theme.document.coverPage.enabled
    ? buildCoverPageHTML(
        {
          title: meta.title || '',
          subtitle: meta.description || '',
          author: meta.author || '',
          date: meta.date || '',
          imageUrl: '',
        },
        theme.document.coverPage.layout,
      )
    : '';

  const googleFonts = buildGoogleFontsLink(extractGoogleFonts(theme));
  const headerContent = theme.document.header.enabled ? theme.document.header.content : '';
  const footerContent = theme.document.footer.enabled ? theme.document.footer.content : '';

  const fullHTML = generateExportHTML(html, css, {
    title: meta.title || path.basename(document.fileName, '.md'),
    coverPageHTML: coverHTML + tocHTML,
    tocEnabled: theme.document.tableOfContents.enabled,
    headerContent,
    footerContent,
    responsive: true,
    showWatermark: false,
    googleFontsLink: googleFonts,
  });

  // Default filename based on current document name
  const defaultFilename = path.basename(document.fileName, '.md') + '.html';
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  const defaultUri = workspaceFolder
    ? vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, defaultFilename))
    : undefined;

  const saveUri = await vscode.window.showSaveDialog({
    defaultUri,
    filters: { 'HTML Files': ['html'] },
    title: 'Export as HTML',
  });

  if (!saveUri) return;

  await fs.promises.writeFile(saveUri.fsPath, fullHTML, 'utf-8');

  const action = await vscode.window.showInformationMessage(
    `Exported to ${path.basename(saveUri.fsPath)}`,
    'Open in Browser',
    'Reveal in Explorer',
  );

  if (action === 'Open in Browser') {
    vscode.env.openExternal(saveUri);
  } else if (action === 'Reveal in Explorer') {
    vscode.commands.executeCommand('revealFileInOS', saveUri);
  }
}
