import * as vscode from 'vscode';
import * as path from 'path';
import { renderMarkdown } from './engine/markdown';
import { compileThemeToCSS } from './engine/theme-compiler';
import { parseFrontMatter } from './engine/frontmatter';
import { buildTocHTML, buildCoverPageHTML } from './engine/document-features';
import { injectHeadingNumbers } from './engine/heading-inject';
import { extractGoogleFonts, buildGoogleFontsLink } from './engine/google-fonts';
import { builtInTemplates } from './engine/templates';
import { loadConfig } from './config';
import type { Theme } from './engine/types/theme';

export class PreviewPanel {
  private static _current: PreviewPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private _theme: Theme;
  private _disposables: vscode.Disposable[] = [];
  private _debounceTimer: ReturnType<typeof setTimeout> | undefined;

  static createOrShow(
    context: vscode.ExtensionContext,
    editor: vscode.TextEditor,
    toSide: boolean,
  ): void {
    const column = toSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active;

    if (PreviewPanel._current) {
      PreviewPanel._current._panel.reveal(column);
      PreviewPanel._current._update(editor.document);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'buildlorePreview',
      'BuildLore Preview',
      column,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, 'dist')),
          vscode.Uri.file(path.join(context.extensionPath, 'media')),
          ...(vscode.workspace.workspaceFolders?.map((f) => f.uri) ?? []),
        ],
      },
    );

    PreviewPanel._current = new PreviewPanel(panel, context);
    PreviewPanel._current._update(editor.document);
  }

  static setTheme(theme: Theme): void {
    if (!PreviewPanel._current) return;
    PreviewPanel._current._theme = theme;
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId === 'markdown') {
      PreviewPanel._current._update(editor.document);
    }
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._context = context;
    this._theme = this._loadTheme();

    // Set the static webview HTML shell
    this._panel.webview.html = this._getWebviewHtml();

    // Set context for when clauses
    vscode.commands.executeCommand('setContext', 'buildlore.previewActive', true);

    // Panel closed
    this._panel.onDidDispose(() => this._dispose(), null, this._disposables);

    // Re-render when panel becomes visible
    this._panel.onDidChangeViewState(() => {
      if (this._panel.visible) {
        const editor = vscode.window.activeTextEditor;
        if (editor?.document.languageId === 'markdown') {
          this._update(editor.document);
        }
      }
    }, null, this._disposables);

    // Live updates on text change (300ms debounce)
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === 'markdown' && this._panel.visible) {
        this._scheduleUpdate(e.document);
      }
    }, null, this._disposables);

    // Update when switching to a different markdown file
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document.languageId === 'markdown' && this._panel.visible) {
        this._update(editor.document);
      }
    }, null, this._disposables);
  }

  private _loadTheme(): Theme {
    const config = loadConfig();
    return builtInTemplates.find((t) => t.name === config.template) ?? builtInTemplates[0];
  }

  private _scheduleUpdate(document: vscode.TextDocument): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._update(document), 300);
  }

  private _update(document: vscode.TextDocument): void {
    const markdownText = document.getText();
    const { meta, body } = parseFrontMatter(markdownText);
    const theme = this._theme;
    const doc = theme.document;
    const headingNumbering = doc.headingNumbering ?? 'none';

    // Run the full rendering pipeline
    const renderedHtml = renderMarkdown(body);
    let html = injectHeadingNumbers(renderedHtml, headingNumbering);

    // Resolve local image paths for webview
    html = this._resolveImageSrcs(html, document.uri);

    const css = compileThemeToCSS(theme);

    const tocHTML = doc.tableOfContents.enabled
      ? buildTocHTML(body, doc.tableOfContents, headingNumbering)
      : '';

    const coverHTML = doc.coverPage.enabled
      ? buildCoverPageHTML(
          {
            title: meta.title || '',
            subtitle: meta.description || '',
            author: meta.author || '',
            date: meta.date || '',
            imageUrl: '',
          },
          doc.coverPage.layout,
        )
      : '';

    const googleFonts = buildGoogleFontsLink(extractGoogleFonts(theme));

    // Header/footer
    const headerContent = doc.header.enabled ? doc.header.content : '';
    const footerContent = doc.footer.enabled ? doc.footer.content : '';

    this._panel.webview.postMessage({
      type: 'update',
      html,
      css,
      tocHTML,
      coverHTML,
      googleFonts,
      headerContent,
      footerContent,
    });
  }

  /** Rewrite relative image src attributes to webview URIs */
  private _resolveImageSrcs(html: string, documentUri: vscode.Uri): string {
    const docDir = path.dirname(documentUri.fsPath);
    return html.replace(/src="([^"]+)"/g, (_match, src: string) => {
      // Skip http(s), data:, and vscode-webview URIs
      if (/^(https?:\/\/|data:|vscode-webview)/.test(src)) return `src="${src}"`;
      // Resolve relative to the document's directory
      const absPath = path.isAbsolute(src) ? src : path.join(docDir, src);
      const uri = this._panel.webview.asWebviewUri(vscode.Uri.file(absPath));
      return `src="${uri.toString()}"`;
    });
  }

  private _getWebviewHtml(): string {
    const webviewUri = this._panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._context.extensionPath, 'dist', 'webview.js')),
    );
    const cssUri = this._panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._context.extensionPath, 'media', 'preview.css')),
    );

    const csp = [
      `default-src 'none'`,
      `script-src ${this._panel.webview.cspSource}`,
      `style-src ${this._panel.webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src https://fonts.gstatic.com`,
      `img-src ${this._panel.webview.cspSource} https: data:`,
    ].join('; ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <link rel="stylesheet" href="${cssUri}">
</head>
<body>
  <div id="fonts-container"></div>
  <div id="styles-container"></div>
  <div class="pf-preview" id="content"></div>
  <script src="${webviewUri}"></script>
</body>
</html>`;
  }

  private _dispose(): void {
    PreviewPanel._current = undefined;
    vscode.commands.executeCommand('setContext', 'buildlore.previewActive', false);
    this._panel.dispose();
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    for (const d of this._disposables) d.dispose();
    this._disposables = [];
  }
}
