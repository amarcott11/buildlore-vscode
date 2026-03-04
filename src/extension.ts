import * as vscode from 'vscode';
import { PreviewPanel } from './preview-panel';
import { showTemplatePicker, initStatusBar, updateStatusBar } from './template-picker';
import { exportHTML } from './export-html';
import { watchConfig } from './config';
import { builtInTemplates } from './engine/templates';

const BUILDLORE_URL = 'https://buildlore.com';

export function activate(context: vscode.ExtensionContext): void {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('buildlore.openPreview', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor?.document.languageId === 'markdown') {
        PreviewPanel.createOrShow(context, editor, false);
      }
    }),

    vscode.commands.registerCommand('buildlore.openPreviewToSide', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor?.document.languageId === 'markdown') {
        PreviewPanel.createOrShow(context, editor, true);
      }
    }),

    vscode.commands.registerCommand('buildlore.selectTemplate', async () => {
      await showTemplatePicker();
    }),

    vscode.commands.registerCommand('buildlore.exportHTML', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor?.document.languageId === 'markdown') {
        await exportHTML(context, editor.document);
      }
    }),

    vscode.commands.registerCommand('buildlore.exportPDF', () => {
      vscode.env.openExternal(
        vscode.Uri.parse(`${BUILDLORE_URL}?utm_source=vscode&utm_medium=export_pdf`),
      );
    }),
  );

  // Status bar
  initStatusBar(context);

  // Watch .buildlore.json for external changes
  context.subscriptions.push(
    watchConfig((config) => {
      const template = builtInTemplates.find((t) => t.name === config.template);
      if (template) {
        PreviewPanel.setTheme(template);
        updateStatusBar(config.template);
      }
    }),
  );

  // First-install welcome notification
  const hasShownWelcome = context.globalState.get<boolean>('buildlore.welcomeShown');
  if (!hasShownWelcome) {
    context.globalState.update('buildlore.welcomeShown', true);
    vscode.window
      .showInformationMessage(
        'Welcome to BuildLore! Preview styled markdown right here, or visit buildlore.com for PDF export, publishing, and more.',
        'Visit buildlore.com',
      )
      .then((action) => {
        if (action === 'Visit buildlore.com') {
          vscode.env.openExternal(
            vscode.Uri.parse(`${BUILDLORE_URL}?utm_source=vscode&utm_medium=welcome`),
          );
        }
      });
  }
}

export function deactivate(): void {
  // Disposables handle cleanup
}
