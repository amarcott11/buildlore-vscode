import * as vscode from 'vscode';
import { builtInTemplates } from './engine/templates';
import { PreviewPanel } from './preview-panel';
import { saveConfig, loadConfig } from './config';

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  'Standard': 'Clean default — Inter, blue accents, underline headings',
  'Manuscript': 'Ebook prose — Lora + Playfair, drop caps, cover page',
  'Briefing': 'Business report — Source Sans, navy, TOC + numbering',
  'Scholar': 'Academic paper — Crimson Text, double-spaced, roman lists',
  'Journal': 'Blog/essay — Source Serif + DM Serif, terracotta accent',
  'Dispatch': 'Newsletter — Inter + Space Grotesk, red overline headings',
  'Handbook': 'Product docs — DM Sans, violet, Stripe/Tailwind style',
  'Midnight': 'Dark mode — gradient bg, sky-blue accents, mermaid dark',
  'Blueprint': 'Technical spec — IBM Plex Sans, legal numbering, dashed HR',
  'Canvas': 'Creative brief — Nunito + Sora, orange, dots texture',
  'Folio': 'Reference work — Merriweather, forest green, paper texture',
  'Protocol': 'SOP/runbook — Barlow, slate, grid texture, compact',
  'Ink': 'Anti-template — system-ui, no decoration, iA Writer minimal',
};

let statusBarItem: vscode.StatusBarItem | undefined;

export function initStatusBar(context: vscode.ExtensionContext): void {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'buildlore.selectTemplate';
  statusBarItem.tooltip = 'Click to switch BuildLore template';
  context.subscriptions.push(statusBarItem);
  updateStatusBarFromConfig();
  statusBarItem.show();
}

export function updateStatusBar(templateName: string): void {
  if (statusBarItem) {
    statusBarItem.text = `$(paintcan) BL: ${templateName}`;
  }
}

function updateStatusBarFromConfig(): void {
  const config = loadConfig();
  updateStatusBar(config.template);
}

const PREMIUM_TEMPLATES: { label: string; description: string }[] = [
  { label: '$(lock) Magazine Spread', description: 'Multi-column editorial layout — buildlore.com' },
  { label: '$(lock) Executive Brief', description: 'Boardroom-ready, polished — buildlore.com' },
  { label: '$(lock) Developer Docs', description: 'API-style, syntax-highlighted — buildlore.com' },
];

const BUILDLORE_URL = 'https://buildlore.com';

export async function showTemplatePicker(): Promise<void> {
  const config = loadConfig();
  const currentName = config.template;

  const items: vscode.QuickPickItem[] = builtInTemplates.map((t) => ({
    label: t.name === currentName ? `$(check) ${t.name}` : t.name,
    description: TEMPLATE_DESCRIPTIONS[t.name] ?? '',
  }));

  // Premium locked templates
  items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });
  for (const pt of PREMIUM_TEMPLATES) {
    items.push({ label: pt.label, description: pt.description });
  }

  // CTA link
  items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });
  items.push({
    label: '$(link-external) Explore more templates on buildlore.com',
    description: '',
    alwaysShow: true,
  });

  const picked = await vscode.window.showQuickPick(items, {
    title: 'BuildLore: Select Template',
    placeHolder: 'Choose a template for your markdown preview',
  });

  if (!picked) return;

  // Handle premium template selection → open website
  if (picked.label.startsWith('$(lock)')) {
    vscode.env.openExternal(
      vscode.Uri.parse(`${BUILDLORE_URL}?utm_source=vscode&utm_medium=premium_template`),
    );
    return;
  }

  // Handle "Explore more" link
  if (picked.label.startsWith('$(link-external)')) {
    vscode.env.openExternal(
      vscode.Uri.parse(`${BUILDLORE_URL}?utm_source=vscode&utm_medium=template_picker`),
    );
    return;
  }

  // Strip the checkmark icon prefix if present
  const templateName = picked.label.replace(/^\$\(check\) /, '');
  const template = builtInTemplates.find((t) => t.name === templateName);
  if (!template) return;

  // Apply to preview
  PreviewPanel.setTheme(template);

  // Persist to .buildlore.json
  await saveConfig({ template: templateName });

  // Update status bar
  updateStatusBar(templateName);
}
