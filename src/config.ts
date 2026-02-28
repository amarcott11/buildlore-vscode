import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { builtInTemplates } from './engine/templates';

export interface BuildLoreConfig {
  template: string;
}

const VALID_TEMPLATE_NAMES = new Set(builtInTemplates.map((t) => t.name));

function getConfigPath(): string | undefined {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return undefined;
  return path.join(workspaceFolder.uri.fsPath, '.buildlore.json');
}

export function loadConfig(): BuildLoreConfig {
  const configPath = getConfigPath();
  if (!configPath) return { template: 'Clean Technical' };

  try {
    if (!fs.existsSync(configPath)) return { template: 'Clean Technical' };
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return { template: 'Clean Technical' };

    const obj = parsed as Record<string, unknown>;
    const template = typeof obj.template === 'string' && VALID_TEMPLATE_NAMES.has(obj.template)
      ? obj.template
      : 'Clean Technical';
    return { template };
  } catch {
    return { template: 'Clean Technical' };
  }
}

export async function saveConfig(config: BuildLoreConfig): Promise<void> {
  const configPath = getConfigPath();
  if (!configPath) return;
  const content = JSON.stringify(config, null, 2) + '\n';
  await fs.promises.writeFile(configPath, content, 'utf-8');
}

export function watchConfig(onChange: (config: BuildLoreConfig) => void): vscode.Disposable {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) return { dispose: () => {} };

  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(folder, '.buildlore.json'),
  );

  const handler = () => {
    const config = loadConfig();
    onChange(config);
  };

  watcher.onDidChange(handler);
  watcher.onDidCreate(handler);
  return watcher;
}
