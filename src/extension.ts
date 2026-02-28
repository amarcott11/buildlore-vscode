import * as vscode from 'vscode';
import { PreviewPanel } from './preview-panel';
import { showTemplatePicker, initStatusBar, updateStatusBar } from './template-picker';
import { exportHTML } from './export-html';
import { watchConfig } from './config';
import { builtInTemplates } from './engine/templates';

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
}

export function deactivate(): void {
  // Disposables handle cleanup
}
