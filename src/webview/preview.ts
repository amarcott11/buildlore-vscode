// This runs inside the VS Code webview (browser context).
// It receives messages from the extension host and updates the DOM.

declare function acquireVsCodeApi(): { postMessage(msg: unknown): void };
const _vscode = acquireVsCodeApi();
void _vscode; // keep reference to prevent GC

interface UpdateMessage {
  type: 'update';
  html: string;
  css: string;
  tocHTML: string;
  coverHTML: string;
  googleFonts: string;
  headerContent: string;
  footerContent: string;
}

window.addEventListener('message', (event: MessageEvent<UpdateMessage>) => {
  const message = event.data;
  if (message.type !== 'update') return;

  // Save scroll position
  const scrollY = window.scrollY;

  // Update Google Fonts link
  const fontsContainer = document.getElementById('fonts-container')!;
  if (message.googleFonts) {
    fontsContainer.innerHTML = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="${message.googleFonts}" rel="stylesheet">
    `;
  } else {
    fontsContainer.innerHTML = '';
  }

  // Update theme CSS
  const stylesContainer = document.getElementById('styles-container')!;
  stylesContainer.innerHTML = `<style>${message.css}</style>`;

  // Build content
  const parts: string[] = [];

  if (message.headerContent) {
    parts.push(`<div class="pf-doc-header">${escapeHTML(message.headerContent)}</div>`);
  }
  if (message.coverHTML) {
    parts.push(message.coverHTML);
  }
  if (message.tocHTML) {
    parts.push(message.tocHTML);
  }
  parts.push(message.html);
  if (message.footerContent) {
    parts.push(`<div class="pf-doc-footer">${escapeHTML(message.footerContent)}</div>`);
  }

  const content = document.getElementById('content')!;
  content.innerHTML = parts.join('');

  // Restore scroll position
  window.scrollTo(0, scrollY);
});

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
