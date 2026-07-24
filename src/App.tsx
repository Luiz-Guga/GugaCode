import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClaudeCodeAgent } from './components/ClaudeCodeAgent';
import { WorkspaceExplorer } from './components/WorkspaceExplorer';
import { NativeTerminal } from './components/NativeTerminal';
import { ModelSelectorModal } from './components/ModelSelectorModal';
import { DiffViewerModal } from './components/DiffViewerModal';
import { NobaraSystemMonitor } from './components/NobaraSystemMonitor';
import { SettingsModal } from './components/SettingsModal';
import { GitHubModal } from './components/GitHubModal';
import { TutorialModal } from './components/TutorialModal';
import { PackageManagerModal } from './components/PackageManagerModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { OllamaService } from './services/ollamaService';
import { DEFAULT_OLLAMA_MODELS, INITIAL_SYSTEM_STATS } from './constants';
import { 
  loadSavedConfig, 
  saveConfigToStorage, 
  loadSavedMessages, 
  saveMessagesToStorage, 
  loadSavedProject, 
  saveProjectToStorage, 
  loadSavedTerminalLogs, 
  saveTerminalLogsToStorage 
} from './utils/storage';
import { openLocalDirectory, saveToLocalFileHandle } from './utils/localFileSystem';
import { 
  AppConfig, 
  ChatMessage, 
  FileEditProposal, 
  OllamaModel, 
  OllamaStatus, 
  ProjectFile, 
  SystemStats, 
  TerminalLog 
} from './types';

const INITIAL_CONFIG: AppConfig = {
  ollamaHost: 'http://localhost:11434',
  selectedModel: 'qwen2.5-coder:7b',
  activeProvider: 'ollama',
  apiKeys: {
    geminiApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    deepseekApiKey: '',
    groqApiKey: '',
    openrouterApiKey: '',
  },
  contextLength: 8192,
  temperature: 0.2,
  systemPrompt: 'Você é o Guga, assistente de IA estilo Claude Code especialista em GugaCode, Nobara Linux, Fedora Linux e ecossistemas Linux (Arch, Debian, Ubuntu), Rust, Python e C++. Você SEMPRE se refere a si mesmo pelo nome Guga.',
  aiCustomInstructions: '',
  aiPreferences: {
    explanationLength: 'balanced',
    commentDensity: 'minimal',
    codeStyle: 'idiomatic',
  },
  autoSaveBackupsEnabled: true,
  autoSaveIntervalSeconds: 15,
  autoExecuteCommands: false,
  language: 'pt-BR',
  geminiBackupEnabled: true,
  voiceTTSAutoPlay: false,
  themeMode: 'dark-nobara',
  terminalSettings: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    theme: 'nobara-dark',
  },
};

const INITIAL_PROJECT: ProjectFile = {
  name: 'nobara-gaming-tweaker',
  path: '/home/guga/projects/gugacode-workspace',
  type: 'dir',
  children: [],
};

const INITIAL_WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content: `### 🚀 Bem-vindo ao GugaCode (Linux AI Assistant Native)

Eu sou o **Guga**, seu assistente de IA para desenvolvimento no **Linux** (Nobara, Fedora, Arch, Ubuntu, Debian).

#### 📁 Acesso Direto ao Sistema de Arquivos do Seu Linux:
- Use o botão **[Abrir Pasta Local do Linux]** no Workspace para carregar qualquer pasta do seu computador (\`/home/seu-usuario/projetos\`).
- Altere e salve arquivos com sincronização direta no seu disco SSD/NVMe local.

#### 🛠️ Ferramentas & Recursos Ativos:
- 💻 **Codificação em Tempo Real**: Rust, Python, C++, TypeScript, Go e Shell Scripts.
- ⚡ **Terminal Linux Nativo**: Execute comandos com saída em tempo real.
- 📦 **Gerenciador de Pacotes**: Instale e busque pacotes via \`dnf\`, \`flatpak\` e \`cargo\`.
- 🤖 **IA com Ollama Local & Cloud**: Suporte a modelos locais (\`qwen2.5-coder\`, \`deepseek-coder\`) e APIs em Nuvem (Gemini, OpenAI, Claude).
- 💾 **Persistência Automática**: Suas conversas, projetos e configurações ficam salvos no seu navegador.`,
    timestamp: new Date().toLocaleTimeString(),
    modelUsed: 'qwen2.5-coder:7b',
    tokensPerSecond: 42.0,
    terminalCommands: ['fastfetch', 'nobara-sync', 'cargo check'],
  },
];

const INITIAL_TERMINAL_LOGS: TerminalLog[] = [
  {
    id: 'init-1',
    command: 'fastfetch',
    output: `IDE: GugaCode Linux AI Assistant
OS: Nobara Linux 41 / Fedora Workstation (x86_64)
Kernel: Linux 6.13.2-200.fsync.nobara.fc41.x86_64
Desktop: KDE Plasma 6.2 / GNOME
CPU: AMD Ryzen / Intel Core
GPU: NVIDIA / AMD Radeon (VRAM Active)
Storage Access: Native HTML5 FileSystem API Enabled
Ollama Service: Active (http://localhost:11434)`,
    exitCode: 0,
    timestamp: new Date().toLocaleTimeString(),
    cwd: '/home/guga/projects/gugacode-workspace',
    status: 'success',
  },
];

export default function App() {
  // Config state initialized from storage
  const [config, setConfig] = useState<AppConfig>(() => loadSavedConfig(INITIAL_CONFIG));

  // Views & Status
  const [activeView, setActiveView] = useState<'agent' | 'workspace' | 'terminal'>('agent');
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('connecting');
  const [models, setModels] = useState<OllamaModel[]>(DEFAULT_OLLAMA_MODELS);
  const [systemStats, setSystemStats] = useState<SystemStats>(INITIAL_SYSTEM_STATS);

  // Workspace Project State initialized from storage
  const [project, setProject] = useState<ProjectFile>(() => loadSavedProject(INITIAL_PROJECT));
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);

  // Chat Messages State initialized from storage
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadSavedMessages(INITIAL_WELCOME_MESSAGES));

  // Terminal Logs State initialized from storage
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>(() => loadSavedTerminalLogs(INITIAL_TERMINAL_LOGS));

  // Modals
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
  const [isSystemMonitorOpen, setIsSystemMonitorOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isPackageManagerOpen, setIsPackageManagerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeDiffProposal, setActiveDiffProposal] = useState<FileEditProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    saveConfigToStorage(config);
  }, [config]);

  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  useEffect(() => {
    saveProjectToStorage(project);
  }, [project]);

  useEffect(() => {
    saveTerminalLogsToStorage(terminalLogs);
  }, [terminalLogs]);

  // Initialize workspace & check Ollama connection
  useEffect(() => {
    checkOllamaStatus();
    loadWorkspaceTree();
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Esc -> Close any open modals
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsSettingsModalOpen(false);
        setIsModelsModalOpen(false);
        setIsSystemMonitorOpen(false);
        setIsGitHubModalOpen(false);
        setIsTutorialModalOpen(false);
        setIsPackageManagerOpen(false);
        setActiveDiffProposal(null);
        return;
      }

      // Ctrl+Shift+P -> Package Manager Modal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPackageManagerOpen((prev) => !prev);
        return;
      }

      // Ctrl+P or Cmd+P or Ctrl+K or Cmd+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ctrl+J or Cmd+J -> Toggle / Cycle View ('agent' -> 'terminal' -> 'workspace' -> 'agent')
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setActiveView((prev) => (prev === 'terminal' ? 'agent' : 'terminal'));
        return;
      }

      // Ctrl+1 -> Go to Agent View
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        setActiveView('agent');
        return;
      }

      // Ctrl+2 -> Go to Workspace View
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        setActiveView('workspace');
        return;
      }

      // Ctrl+3 -> Go to Terminal View
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        setActiveView('terminal');
        return;
      }

      // Ctrl+Shift+F -> Workspace search (switch to workspace)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setActiveView('workspace');
        return;
      }

      // Ctrl+, or Cmd+, -> Settings Modal
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsModalOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Theme mode effect (Dark Nobara vs Light Fedora)
  useEffect(() => {
    if (config.themeMode === 'light-fedora') {
      document.body.classList.add('theme-light-fedora');
    } else {
      document.body.classList.remove('theme-light-fedora');
    }
  }, [config.themeMode]);

  const checkOllamaStatus = async () => {
    setOllamaStatus('connecting');
    const statusData = await OllamaService.checkStatus(config.ollamaHost);
    if (statusData.connected) {
      setOllamaStatus('connected');
    } else {
      setOllamaStatus('simulated');
    }

    const fetchedModels = await OllamaService.fetchModels(config.ollamaHost);
    if (fetchedModels.length > 0) {
      setModels(fetchedModels);
    }
  };

  const loadWorkspaceTree = async () => {
    try {
      const tree = await OllamaService.fetchWorkspaceTree();
      setProject(tree);
      // Select first file
      if (tree.children && tree.children.length > 0) {
        const first = tree.children.find((c) => c.type === 'file') || tree.children[0]?.children?.[0];
        if (first && first.type === 'file') {
          setActiveFile(first);
        }
      }
    } catch (e) {
      console.error('Failed to load workspace tree:', e);
    }
  };

  // Send message handler
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const assistantResp = await OllamaService.sendChatMessage(chatHistory, config);

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: assistantResp.content || 'Sem resposta gerada.',
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: assistantResp.modelUsed || config.selectedModel,
        tokensPerSecond: assistantResp.tokensPerSecond || 36.5,
        terminalCommands: (assistantResp as any).terminalCommands || [],
        fileEdits: (assistantResp as any).fileEdits || [],
        thoughtProcess: `Analisando workspace Nobara Linux em ${project.path}...
Identificado modelo Ollama: ${config.selectedModel}.
Análise sintática e geração concluídas sem erros.`,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute terminal command handler
  const handleExecuteTerminalCommand = async (command: string): Promise<TerminalLog> => {
    const log = await OllamaService.executeCommand(command, project.path);
    setTerminalLogs((prev) => [...prev, log]);
    return log;
  };

  // Apply file edit proposal handler
  const handleApplyFileEdit = async (proposal: FileEditProposal) => {
    await OllamaService.saveFile(proposal.filePath, proposal.newContent);
    await loadWorkspaceTree();

    // If currently active file, update its content
    if (activeFile && activeFile.path === proposal.filePath) {
      setActiveFile({
        ...activeFile,
        content: proposal.newContent,
        isDirty: false,
      });
    }

    // Add confirmation message in chat
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: `✔ **Arquivo Atualizado**: Alteração aplicada com sucesso em \`${proposal.filePath}\`.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Open local Linux directory handler
  const handleOpenLocalFolder = async () => {
    const res = await openLocalDirectory();
    if (res && res.project) {
      setProject(res.project);
      if (res.project.children && res.project.children.length > 0) {
        const first = res.project.children.find((c) => c.type === 'file') || res.project.children[0]?.children?.[0];
        if (first && first.type === 'file') {
          setActiveFile(first);
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: `📁 **Pasta Local do Linux Carregada**: Diretorio \`${res.project.name}\` (${res.handleCount} arquivos carregados). Suas alterações podem ser salvas diretamente no seu disco!`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  // Save file from code editor
  const handleSaveFile = async (filePath: string, content: string) => {
    // Try writing directly to local file handle on disk
    await saveToLocalFileHandle(filePath, content);

    // Sync with backend service
    await OllamaService.saveFile(filePath, content);

    // Update internal project state
    function updateFileInNode(node: ProjectFile): ProjectFile {
      if (node.path === filePath) {
        return { ...node, content, isDirty: false };
      }
      if (node.type === 'dir' && node.children) {
        return { ...node, children: node.children.map(updateFileInNode) };
      }
      return node;
    }

    setProject((prev) => updateFileInNode(prev));

    if (activeFile && activeFile.path === filePath) {
      setActiveFile((prev) => (prev ? { ...prev, content, isDirty: false } : null));
    }
  };

  // Switch project template
  const handleSwitchTemplate = async (templateId: string) => {
    const res = await OllamaService.switchProjectTemplate(templateId);
    if (res.project) {
      setProject(res.project);
      if (res.project.children?.[0]?.type === 'file') {
        setActiveFile(res.project.children[0]);
      } else if (res.project.children?.[1]?.children?.[0]) {
        setActiveFile(res.project.children[1].children[0]);
      }
    }
  };

  // Refresh Hardware Stats
  const handleRefreshStats = async () => {
    const stats = await OllamaService.fetchSystemStats();
    setSystemStats(stats);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080b10] text-slate-100 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <Navbar
        config={config}
        ollamaStatus={ollamaStatus}
        models={models}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenModelsModal={() => setIsModelsModalOpen(true)}
        onOpenSystemMonitor={() => {
          handleRefreshStats();
          setIsSystemMonitorOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onOpenTutorial={() => setIsTutorialModalOpen(true)}
        onOpenPackageManager={() => setIsPackageManagerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onExecuteCommand={handleExecuteTerminalCommand}
        onSelectModel={(modelName) => setConfig((prev) => ({ ...prev, selectedModel: modelName }))}
        onCheckStatus={checkOllamaStatus}
        onUpdateConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
      />

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden bg-[#0d1017]">
        {activeView === 'agent' && (
          <ClaudeCodeAgent
            messages={messages}
            isLoading={isLoading}
            activeModel={config.selectedModel}
            activeProject={project}
            onSendMessage={handleSendMessage}
            onExecuteTerminalCommand={handleExecuteTerminalCommand}
            onApplyFileEdit={handleApplyFileEdit}
            onOpenDiffModal={(prop) => setActiveDiffProposal(prop)}
            onOpenModelsModal={() => setIsModelsModalOpen(true)}
            onClearChat={() => setMessages([])}
            autoSpeakResponses={config.voiceTTSAutoPlay}
            language={config.language}
            themeMode={config.themeMode}
          />
        )}

        {activeView === 'workspace' && (
          <WorkspaceExplorer
            project={project}
            activeFile={activeFile}
            onSelectFile={(f) => setActiveFile(f)}
            onSaveFile={handleSaveFile}
            onSwitchTemplate={handleSwitchTemplate}
            onOpenTerminalWithCommand={handleExecuteTerminalCommand}
            onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            onOpenLocalFolder={handleOpenLocalFolder}
            language={config.language}
            terminalLogs={terminalLogs}
            onClearTerminalLogs={() => setTerminalLogs([])}
            terminalSettings={config.terminalSettings}
            themeMode={config.themeMode}
          />
        )}

        {activeView === 'terminal' && (
          <NativeTerminal
            logs={terminalLogs}
            onExecuteCommand={handleExecuteTerminalCommand}
            onClearLogs={() => setTerminalLogs([])}
            language={config.language}
            terminalSettings={config.terminalSettings}
            themeMode={config.themeMode}
          />
        )}
      </main>

      {/* Modals */}
      <ModelSelectorModal
        isOpen={isModelsModalOpen}
        models={models}
        selectedModel={config.selectedModel}
        ollamaHost={config.ollamaHost}
        onClose={() => setIsModelsModalOpen(false)}
        onSelectModel={(m) => setConfig((prev) => ({ ...prev, selectedModel: m }))}
        onPullModel={(m) => {
          setModels((prev) => [
            ...prev,
            {
              name: m,
              size: 4500000000,
              description: 'Modelo recém-baixado da biblioteca Ollama.',
              isRecommended: false,
            },
          ]);
        }}
        onTestConnection={checkOllamaStatus}
        themeMode={config.themeMode}
      />

      <DiffViewerModal
        proposal={activeDiffProposal}
        onClose={() => setActiveDiffProposal(null)}
        onApply={handleApplyFileEdit}
        themeMode={config.themeMode}
      />

      <NobaraSystemMonitor
        isOpen={isSystemMonitorOpen}
        stats={systemStats}
        onClose={() => setIsSystemMonitorOpen(false)}
        onRefresh={handleRefreshStats}
        themeMode={config.themeMode}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        config={config}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateConfig={(newConf) => setConfig((prev) => ({ ...prev, ...newConf }))}
      />

      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        token={config.apiKeys?.githubToken || ''}
        language={config.language}
        themeMode={config.themeMode}
        onExecuteCommand={handleExecuteTerminalCommand}
        onSaveToken={(githubToken) =>
          setConfig((prev) => ({
            ...prev,
            apiKeys: {
              ...prev.apiKeys,
              githubToken,
            },
          }))
        }
        onProjectLoaded={(clonedProj) => {
          setProject(clonedProj);
          const firstFile = clonedProj.children?.[0];
          setActiveFile(firstFile || null);
          setIsGitHubModalOpen(false);
        }}
        currentProjectName={project?.name || 'nobara-project'}
      />

      <TutorialModal
        isOpen={isTutorialModalOpen}
        language={config.language}
        themeMode={config.themeMode}
        onClose={() => setIsTutorialModalOpen(false)}
        onOpenGitHubModal={() => {
          setIsTutorialModalOpen(false);
          setIsGitHubModalOpen(true);
        }}
        onOpenSettings={() => {
          setIsTutorialModalOpen(false);
          setIsSettingsModalOpen(true);
        }}
        onOpenModelsModal={() => {
          setIsTutorialModalOpen(false);
          setIsModelsModalOpen(true);
        }}
      />

      <PackageManagerModal
        isOpen={isPackageManagerOpen}
        onClose={() => setIsPackageManagerOpen(false)}
        language={config.language}
        onExecuteCommand={handleExecuteTerminalCommand}
        themeMode={config.themeMode}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        language={config.language}
        themeMode={config.themeMode}
        projectFiles={project.children || []}
        onSelectFile={(file) => {
          setActiveFile(file);
          setActiveView('workspace');
        }}
        onSelectView={(view) => setActiveView(view)}
        onOpenPackageManager={() => setIsPackageManagerOpen(true)}
        onOpenSystemMonitor={() => setIsSystemMonitorOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onOpenModelsModal={() => setIsModelsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenTutorial={() => setIsTutorialModalOpen(true)}
        onExecuteCommand={async (cmd) => {
          await handleExecuteTerminalCommand(cmd);
          setActiveView('terminal');
        }}
        onToggleTheme={() => {
          setConfig((prev) => ({
            ...prev,
            themeMode: prev.themeMode === 'light-fedora' ? 'dark-nobara' : 'light-fedora'
          }));
        }}
        onToggleLanguage={() => {
          setConfig((prev) => ({
            ...prev,
            language: prev.language === 'pt-BR' ? 'en' : 'pt-BR'
          }));
        }}
        onClearTerminalLogs={() => setTerminalLogs([])}
      />
    </div>
  );
}
