import * as vscode from 'vscode';
import { builtInTemplates } from './engine/templates';
import { PreviewPanel } from './preview-panel';
import { saveConfig, loadConfig } from './config';

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  'Clean Technical': 'Left-bar headings, blue accents, Inter font',
  'Ebook Modern': 'Serif, drop caps, justified, airy spacing',
  'Product Guide': 'Purple accents, compact, uppercase headings',
  'Academic': 'Times serif, justified, roman numerals, TOC',
  'Newsletter': 'Red overline headings, wide letter-spacing',
  'Craft Pattern': 'Playfair Display, warm earth tones, custom bullets',
  'Minimal': 'System-ui, tight spacing, plain headings',
  'Dark': 'Dark background, blue accents, cyan markers',
  "Maker's Guide": 'Sage green, heart bullets, decorative HR',
  'Step by Step': 'IKEA-style monochrome, Barlow font',
  'Creative Workshop': 'Coral-orange, Nunito, arrow bullets',
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

export async function showTemplatePicker(): Promise<void> {
  const config = loadConfig();
  const currentName = config.template;

  const items: vscode.QuickPickItem[] = builtInTemplates.map((t) => ({
    label: t.name === currentName ? `$(check) ${t.name}` : t.name,
    description: TEMPLATE_DESCRIPTIONS[t.name] ?? '',
  }));

  const picked = await vscode.window.showQuickPick(items, {
    title: 'BuildLore: Select Template',
    placeHolder: 'Choose a template for your markdown preview',
  });

  if (!picked) return;

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
