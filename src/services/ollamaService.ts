import { AppConfig, ChatMessage, OllamaModel, ProjectFile, SystemStats, TerminalLog } from '../types';

export class OllamaService {
  static async checkStatus(host: string) {
    try {
      const res = await fetch(`/api/ollama/status?host=${encodeURIComponent(host)}`);
      return await res.json();
    } catch {
      return { connected: false, host, mode: 'simulated' };
    }
  }

  static async fetchModels(host: string): Promise<OllamaModel[]> {
    try {
      const res = await fetch(`/api/ollama/tags?host=${encodeURIComponent(host)}`);
      const data = await res.json();
      return data.models || [];
    } catch {
      return [];
    }
  }

  static async pullModel(modelName: string, host: string) {
    const res = await fetch('/api/ollama/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName, host }),
    });
    return await res.json();
  }

  static async sendChatMessage(
    messages: { role: string; content: string }[],
    config: AppConfig
  ): Promise<Partial<ChatMessage>> {
    const res = await fetch('/api/ollama/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: config.selectedModel,
        systemPrompt: config.systemPrompt,
        aiCustomInstructions: config.aiCustomInstructions,
        aiPreferences: config.aiPreferences,
        host: config.ollamaHost,
        useGemini: config.geminiBackupEnabled,
        activeProvider: config.activeProvider,
        apiKeys: config.apiKeys,
      }),
    });
    return await res.json();
  }

  static async fetchWorkspaceTree(): Promise<ProjectFile> {
    const res = await fetch('/api/workspace/tree');
    return await res.json();
  }

  static async saveFile(filePath: string, content: string) {
    const res = await fetch('/api/workspace/file/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content }),
    });
    return await res.json();
  }

  static async createBackup(filePath: string, content: string) {
    const res = await fetch('/api/workspace/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content }),
    });
    return await res.json();
  }

  static async fetchBackups(filePath?: string) {
    const url = filePath ? `/api/workspace/backups/list?filePath=${encodeURIComponent(filePath)}` : '/api/workspace/backups/list';
    const res = await fetch(url);
    return await res.json();
  }

  static async restoreBackup(backupId: string) {
    const res = await fetch('/api/workspace/backups/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupId }),
    });
    return await res.json();
  }

  static async executeCommand(command: string, cwd?: string): Promise<TerminalLog> {
    const res = await fetch('/api/workspace/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, cwd }),
    });
    return await res.json();
  }

  static async fetchSystemStats(): Promise<SystemStats> {
    const res = await fetch('/api/system/stats');
    return await res.json();
  }

  static async switchProjectTemplate(templateId: string) {
    const res = await fetch('/api/workspace/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId }),
    });
    return await res.json();
  }
}
