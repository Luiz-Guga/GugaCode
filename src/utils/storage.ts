import { AppConfig, ChatMessage, ProjectFile, TerminalLog } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'gugacode_config_v1',
  CHAT_MESSAGES: 'gugacode_chat_messages_v1',
  PROJECT: 'gugacode_active_project_v1',
  TERMINAL_LOGS: 'gugacode_terminal_logs_v1',
};

export function loadSavedConfig(defaultConfig: AppConfig): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw);
    return { ...defaultConfig, ...parsed };
  } catch (e) {
    return defaultConfig;
  }
}

export function saveConfigToStorage(config: AppConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
  }
}

export function loadSavedMessages(defaultMessages: ChatMessage[]): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (!raw) return defaultMessages;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMessages;
  } catch (e) {
    return defaultMessages;
  }
}

export function saveMessagesToStorage(messages: ChatMessage[]) {
  try {
    // Save up to 100 recent messages
    const trimmed = messages.slice(-100);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save messages to localStorage', e);
  }
}

export function loadSavedProject(defaultProject: ProjectFile): ProjectFile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT);
    if (!raw) return defaultProject;
    const parsed = JSON.parse(raw);
    return parsed && parsed.name ? parsed : defaultProject;
  } catch (e) {
    return defaultProject;
  }
}

export function saveProjectToStorage(project: ProjectFile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
  } catch (e) {
    console.error('Failed to save project to localStorage', e);
  }
}

export function loadSavedTerminalLogs(defaultLogs: TerminalLog[]): TerminalLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TERMINAL_LOGS);
    if (!raw) return defaultLogs;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultLogs;
  } catch (e) {
    return defaultLogs;
  }
}

export function saveTerminalLogsToStorage(logs: TerminalLog[]) {
  try {
    const trimmed = logs.slice(-50);
    localStorage.setItem(STORAGE_KEYS.TERMINAL_LOGS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save terminal logs to localStorage', e);
  }
}

export function clearAllAppData() {
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
  localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.PROJECT);
  localStorage.removeItem(STORAGE_KEYS.TERMINAL_LOGS);
}
