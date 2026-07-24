export type OllamaStatus = 'connected' | 'disconnected' | 'simulated' | 'connecting';

export interface OllamaModel {
  name: string;
  modified_at?: string;
  size?: number; // bytes
  digest?: string;
  details?: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
  description?: string;
  isRecommended?: boolean;
  category?: 'coding' | 'general' | 'fast' | 'reasoning';
}

export interface ToolCall {
  id: string;
  tool: 'read_file' | 'write_file' | 'run_command' | 'list_dir' | 'search_workspace';
  args: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
}

export interface FileEditProposal {
  filePath: string;
  oldContent: string;
  newContent: string;
  summary: string;
  applied?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  toolCalls?: ToolCall[];
  fileEdits?: FileEditProposal[];
  terminalCommands?: string[];
  tokensPerSecond?: number;
  totalTokens?: number;
  thoughtProcess?: string;
  authorized?: boolean;
}

export interface ProjectFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  content?: string;
  language?: string;
  size?: number;
  modified?: string;
  children?: ProjectFile[];
  isDirty?: boolean;
}

export interface TerminalLog {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: string;
  cwd: string;
  status: 'running' | 'success' | 'error';
}

export interface GitBlameLine {
  commitHash: string;
  author: string;
  date: string;
  message: string;
}

export interface SystemStats {
  osName: string;
  kernel: string;
  cpuModel: string;
  cpuUsage: number; // percentage
  ramUsedGB: number;
  ramTotalGB: number;
  gpuModel: string;
  vramUsedGB: number;
  vramTotalGB: number;
  ollamaVramUsageGB: number;
  activeThreads: number;
  diskUsedGB?: number;
  diskTotalGB?: number;
  diskUsagePercent?: number;
}

export type LLMProvider = 'ollama' | 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'openrouter';

export interface ApiKeysConfig {
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  deepseekApiKey: string;
  groqApiKey: string;
  openrouterApiKey: string;
  githubToken?: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  public_repos: number;
  total_private_repos?: number;
  bio?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  clone_url: string;
  description: string | null;
  updated_at: string;
  default_branch: string;
  stargazers_count: number;
  language: string | null;
}

export interface FileBackup {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  timestamp: string;
  size: number;
}

export interface AICodingPreferences {
  explanationLength: 'brief' | 'balanced' | 'step-by-step';
  commentDensity: 'none' | 'minimal' | 'thorough';
  codeStyle: 'idiomatic' | 'concise' | 'strict';
}

export type TerminalTheme = 'nobara-dark' | 'dracula' | 'nord' | 'solarized-dark' | 'monokai' | 'fedora-light';

export interface TerminalAppearanceSettings {
  fontFamily: string;
  fontSize: number;
  theme: TerminalTheme;
}

export interface AppConfig {
  ollamaHost: string;
  selectedModel: string;
  activeProvider: LLMProvider;
  apiKeys: ApiKeysConfig;
  contextLength: number; // e.g. 8192, 16384, 32768
  temperature: number;
  systemPrompt: string;
  aiCustomInstructions: string;
  aiPreferences: AICodingPreferences;
  autoExecuteCommands: boolean;
  language: 'pt-BR' | 'en';
  geminiBackupEnabled: boolean;
  voiceTTSAutoPlay: boolean;
  themeMode: 'dark-nobara' | 'light-fedora' | 'dark-obsidian' | 'cyberpunk';
  terminalSettings?: TerminalAppearanceSettings;
  autoSaveBackupsEnabled: boolean;
  autoSaveIntervalSeconds: number;
}
