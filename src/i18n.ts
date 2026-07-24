export type Language = 'pt-BR' | 'en';

export const translations = {
  'pt-BR': {
    // Brand
    brandName: 'GugaCode',
    brandBadge: 'Nobara & Fedora Linux',
    brandSubtitle: 'Assistente Claude Code CLI & Agente IA para Linux',
    
    // Navbar
    navAgent: 'Guga Agent',
    navWorkspace: 'Workspace & IDE',
    navTerminal: 'Terminal Linux',
    navTutorial: 'Tutorial',
    navSystemMonitor: 'Monitor de Hardware - Nobara & Fedora Linux',
    navSettings: 'Configurações',
    
    // Theme & Lang
    themeDarkNobara: 'Dark (Nobara)',
    themeLightFedora: 'Light (Fedora)',
    langPT: 'Português',
    langEN: 'English',
    
    // Agent Chat
    agentTitle: 'GugaCode Agent CLI',
    agentSubtitle: 'Assistente Autônomo de Código para Linux',
    chatPlaceholder: 'Descreva uma tarefa, peça um comando bash ou cole um erro...',
    sendBtn: 'Enviar',
    voiceBtn: 'Voz',
    listening: 'Ouvindo...',
    reasoningHeader: 'Raciocínio & Análise do Contexto GugaCode (Linux)',
    execCommand: 'Executar Comando',
    applyEdit: 'Aplicar Edição',
    viewDiff: 'Ver Diferenças (Diff)',
    clearChat: 'Limpar Chat',
    
    // Workspace & IDE
    workspaceTitle: 'GugaCode Workspace',
    workspaceBadge: 'Linux',
    filesHeader: 'ARQUIVOS DO PROJETO',
    newFile: 'Novo Arquivo',
    openGitHub: 'GitHub Sync',
    noFileSelected: 'Nenhum arquivo selecionado no editor',
    saveFile: 'Salvar Arquivo',
    
    // Native Terminal
    terminalHeader: 'guga@nobara-fedora: ~/projects (bash)',
    terminalKernel: 'Nobara & Fedora Linux Kernel 6.13.2-fsync',
    clearLogs: 'Limpar Logs',
    runCommandPlaceholder: 'Digite um comando bash (ex: dnf update, cargo check)...',
    
    // Modals
    saveAndClose: 'Salvar & Fechar',
    close: 'Fechar',
    
    // Settings Modal
    settingsTitle: 'Configurações & Preferências',
    settingsSubtitle: 'Provedores LLM, Ollama, Idioma, Tema Visual e Preferências do AI',
    tabApiKeys: 'Chaves de API (LLMs)',
    tabOllama: 'Ollama & Modelo',
    tabAiPersona: 'Preferências do AI',
    tabAppearance: 'Idioma & Aparência',
    tabVoice: 'Voz & Acessibilidade',
    activeProvider: 'Provedor LLM Ativo:',
    langSelect: 'Idioma da Interface:',
    themeSelect: 'Tema Visual:',
    ttsAutoPlay: 'Auto-Leitura de Respostas (TTS)',
    
    // AI Preferences
    aiCustomInstructionsLabel: 'Instruções Personalizadas do AI (Como o AI deve responder & codificar):',
    aiCustomInstructionsPlaceholder: 'Ex: Sempre responda de forma concisa em inglês. Prefira Rust idiomático com anyhow. Adicione comentários curtos explicando a lógica...',
    aiPresetFast: '⚡ Rápido & Direto',
    aiPresetEducational: '📚 Explicativo & Didático',
    aiPresetRust: '🦀 Foco em Rust & C++',
    aiPresetStrictTypes: '🛡️ TypeScript Estrito',
    aiCodeStyleLabel: 'Estilo de Resposta & Código:',
    aiExplanationLength: 'Tamanho da Explicação:',
    aiCommentDensity: 'Comentários no Código:',
    aiCodeStyle: 'Padrão de Código:',
    
    // Auto Backups
    autoSaveBackupsTitle: 'Auto-Backup (.gugacode/backups)',
    autoSaveEnabled: 'Auto-Backup Ativo',
    autoSaveDisabled: 'Auto-Backup Pausado',
    backupHistoryBtn: 'Histórico de Backups',
    backupRestoredMsg: 'Backup restaurado com sucesso!',
    noBackupsYet: 'Nenhum backup registrado em .gugacode/backups/',
    
    // Terminal Export
    exportLogsBtn: 'Exportar Logs',
    exportAsTxt: 'Exportar Texto (.txt)',
    exportAsMd: 'Exportar Markdown (.md)',
    copyAllLogs: 'Copiar Todos os Logs',
    logsExportedMsg: 'Logs exportados com sucesso!',
    
    // Git Hooks
    tabGitHooks: 'Git Hooks',
    gitHooksTitle: 'Gerenciador de Git Hooks',
    gitHooksSub: 'Automação de testes, linters e checagens antes de dar commit ou push',
    installHookBtn: 'Instalar Hook em .git/hooks/',
    testHookBtn: 'Executar e Testar Hook',
    hookInstalledMsg: 'Git Hook instalado e tornado executável (chmod +x) com sucesso!',
    hookTestRunning: 'Executando script do hook no terminal...',

    // Git Branches
    tabBranches: 'Branches',
    branchesTitle: 'Gerenciador Visual de Branches Git',
    branchesSub: 'Visualize, crie, troque e mescle (merge) ramos do repositório no workspace',
    createBranchBtn: 'Criar Nova Branch',
    mergeBranchBtn: 'Mesclar (Merge) Branch',
    currentBranchLabel: 'Branch Ativa',
    switchBranchBtn: 'Trocar (Checkout)',
    newBranchNamePlaceholder: 'nome-da-nova-branch (ex: feature/autenticacao)',
    mergeBranchPlaceholder: 'Selecione a branch para mesclar...',
    branchCreatedMsg: 'Branch criada e selecionada com sucesso!',
    branchMergedMsg: 'Branch mesclada com sucesso!',
    branchSwitchedMsg: 'Branch alterada com sucesso!',

    // Authorization
    authorizeBtn: 'Autorizar Alterações',
    authorizedBadge: 'Autorizado pelo Usuário',
    authorizeNotice: 'Requer autorização explícita antes de aplicar ações no sistema.',
    authorizeSuccessMsg: 'Alterações e comandos autorizados com sucesso!',

    // Package Manager DNF & Flatpak
    navPackageManager: 'Pacotes (DNF & Flatpak)',
    pkgTitle: 'Gerenciador de Pacotes DNF & Flatpak',
    pkgSub: 'Pesquise, instale e remova pacotes RPM (DNF) e Flathub (Flatpak) no workspace',
    tabAllPkgs: 'Todos',
    tabDnfPkgs: 'DNF (RPM)',
    tabFlatpakPkgs: 'Flatpak (Flathub)',
    tabInstalledPkgs: 'Instalados',
    pkgSearchPlaceholder: 'Pesquisar pacotes (ex: gcc, rust, python3, vlc, discord, htop)...',
    btnInstallPkg: 'Instalar Pacote',
    btnRemovePkg: 'Remover Pacote',
    customPkgInstall: 'Instalar Pacote Personalizado',
    pkgInstalling: 'Instalando pacote...',
    pkgRemoving: 'Removendo pacote...',
    pkgTerminalConsole: 'Logs do Terminal de Instalação',
    
    // Command Palette & Keyboard Shortcuts
    cmdPaletteTitle: 'Paleta de Comandos & Atalhos',
    cmdPaletteSub: 'Digite para pesquisar arquivos, alternar visões ou executar ações rapidamente',
    cmdPaletteSearchPlaceholder: 'Pesquisar arquivos, ferramentas ou comandos (ex: App.tsx, terminal, dnf, tema)...',
    cmdGroupActions: 'Ações & Visões Rápida',
    cmdGroupFiles: 'Arquivos do Projeto',
    cmdGroupSystem: 'Comandos do Sistema Linux',
    cmdViewAgent: 'Ir para o Guga Agent (IA Chat)',
    cmdViewWorkspace: 'Ir para o Editor de Código (Workspace)',
    cmdViewTerminal: 'Ir para o Terminal Linux Nativo',
    cmdOpenPackages: 'Abrir Gerenciador de Pacotes (DNF & Flatpak)',
    cmdOpenMonitor: 'Abrir Monitor do Sistema (Nobara Hardware)',
    cmdOpenGitHub: 'Abrir Sincronizador GitHub',
    cmdOpenModels: 'Selecionar / Baixar Modelos Ollama',
    cmdOpenSettings: 'Abrir Configurações do GugaCode',
    cmdOpenTutorial: 'Abrir Guia Extensivo & Tutorial',
    cmdExecNobaraSync: 'Executar nobara-sync (Atualização Nobara)',
    cmdExecDnfCheck: 'Executar dnf check-update (Verificar Pacotes RPM)',
    cmdExecGitStatus: 'Executar git status (Status do Repositório)',
    cmdToggleTheme: 'Alternar Tema Visual (Nobara Dark / Fedora Light)',
    cmdToggleLang: 'Alternar Idioma (Português / English)',
    cmdClearTerminal: 'Limpar Logs do Terminal',
    shortcutHintPalette: 'Pressione Ctrl+P ou Ctrl+K a qualquer momento para abrir a Paleta de Comandos',
    shortcutHintToggleView: 'Ctrl+J para alternar entre Agent, Editor e Terminal',
    
    // Terminal Appearance Settings
    terminalAppearanceTitle: 'Aparência do Terminal Nativo',
    terminalFontFamily: 'Fonte da Linha de Comando',
    terminalFontSize: 'Tamanho do Texto (px)',
    terminalTheme: 'Tema de Cores do Terminal',
    terminalPreview: 'Pré-visualização em Tempo Real',
    
    // Tutorial
    tutorialTitle: 'Guia Extensivo & Tutorial - GugaCode',
    tutorialSub: 'Aprenda a utilizar todas as funcionalidades do GugaCode no Nobara Linux, Fedora e outras distribuições.',
    tutNavIntro: 'Visão Geral',
    tutNavAgent: 'Guga Agent',
    tutNavOllama: 'Ollama Local',
    tutNavCloud: 'Provedores Cloud',
    tutNavGithub: 'GitHub Sincronização',
    tutNavTerminal: 'Terminal Linux',
    tutNavDistros: 'Suporte a Distros',
    
    // Welcome Msg
    welcomeTitle: '### 🚀 Bem-vindo ao GugaCode (Linux AI Coding Assistant)',
    welcomeIntro: 'Eu sou o **Guga**, seu assistente de IA estilo **Claude Code CLI**, otimizado para **Nobara Linux** e **Fedora Linux**, com suporte para Arch, Debian, Ubuntu e outras distribuições.',
    welcomeFeaturesTitle: '#### 🛠️ Funcionalidades Principais:',
    welcomeF1: '💻 **Codificação & Refatoração**: Leio, edito e crio arquivos em Rust, Python, C++, TypeScript e Bash.',
    welcomeF2: '📖 **Tutorial Extensivo**: Acesse o botão **[Tutorial]** no topo para o guia completo de todas as ferramentas.',
    welcomeF3: '⚡ **Terminal Nativo Integrado**: Executo comandos Linux (`nobara-sync`, `cargo run`, `git status`, `dnf update`, `flatpak`).',
    welcomeF4: '🐙 **Integração GitHub**: Clone repositórios públicos/privados e envie commits diretamente.',
    welcomeF5: '🤖 **Modelos Ollama Locais & Cloud**: Suporte a `qwen2.5-coder`, `deepseek-coder`, Gemini 2.5, GPT-4o, Claude 3.5 e Groq.',
    welcomeF6: '🎙️ **Voz & Áudio**: Ditado por voz em Português/Inglês e síntese de leitura (TTS).',
    welcomeF7: '🌐 **Suporte Multi-idioma & Tema**: Alterne entre Português e Inglês, Modo Escuro (Nobara) e Modo Claro (Fedora).',
    welcomeCTA: 'Clique em **[Tutorial]** no menu superior ou faça uma pergunta abaixo para começar!',
  },
  'en': {
    // Brand
    brandName: 'GugaCode',
    brandBadge: 'Nobara & Fedora Linux',
    brandSubtitle: 'Claude Code CLI Assistant & Linux AI Agent',
    
    // Navbar
    navAgent: 'Guga Agent',
    navWorkspace: 'Workspace & IDE',
    navTerminal: 'Linux Terminal',
    navTutorial: 'Tutorial',
    navSystemMonitor: 'Hardware Monitor - Nobara & Fedora Linux',
    navSettings: 'Settings',
    
    // Theme & Lang
    themeDarkNobara: 'Dark Mode (Nobara)',
    themeLightFedora: 'Light Mode (Fedora)',
    langPT: 'Português',
    langEN: 'English',
    
    // Agent Chat
    agentTitle: 'GugaCode Agent CLI',
    agentSubtitle: 'Autonomous AI Coding Assistant for Linux',
    chatPlaceholder: 'Describe a task, ask for bash commands or paste an error log...',
    sendBtn: 'Send',
    voiceBtn: 'Voice',
    listening: 'Listening...',
    reasoningHeader: 'Reasoning & GugaCode Context Analysis (Linux)',
    execCommand: 'Execute Command',
    applyEdit: 'Apply Edit',
    viewDiff: 'View Diff',
    clearChat: 'Clear Chat',
    
    // Workspace & IDE
    workspaceTitle: 'GugaCode Workspace',
    workspaceBadge: 'Linux',
    filesHeader: 'PROJECT FILES',
    newFile: 'New File',
    openGitHub: 'GitHub Sync',
    noFileSelected: 'No file selected in the editor',
    saveFile: 'Save File',
    
    // Native Terminal
    terminalHeader: 'guga@nobara-fedora: ~/projects (bash)',
    terminalKernel: 'Nobara & Fedora Linux Kernel 6.13.2-fsync',
    clearLogs: 'Clear Logs',
    runCommandPlaceholder: 'Type a bash command (e.g., dnf update, cargo check)...',
    
    // Modals
    saveAndClose: 'Save & Close',
    close: 'Close',
    
    // Settings Modal
    settingsTitle: 'Settings & Preferences',
    settingsSubtitle: 'LLM Providers, Ollama, Language, Visual Theme, and AI Preferences',
    tabApiKeys: 'API Keys (LLMs)',
    tabOllama: 'Ollama & Model',
    tabAiPersona: 'AI Preferences',
    tabAppearance: 'Language & Theme',
    tabVoice: 'Voice & Accessibility',
    activeProvider: 'Active LLM Provider:',
    langSelect: 'Interface Language:',
    themeSelect: 'Visual Theme:',
    ttsAutoPlay: 'Auto Read Responses (TTS)',
    
    // AI Preferences
    aiCustomInstructionsLabel: 'AI Custom Instructions (How the AI should answer & write code):',
    aiCustomInstructionsPlaceholder: 'e.g. Always reply concisely in English. Prefer idiomatic Rust with anyhow. Add brief code comments explaining logic...',
    aiPresetFast: '⚡ Fast & Direct',
    aiPresetEducational: '📚 Educational & Detailed',
    aiPresetRust: '🦀 Idiomatic Rust & C++',
    aiPresetStrictTypes: '🛡️ Strict TypeScript',
    aiCodeStyleLabel: 'Response & Coding Style:',
    aiExplanationLength: 'Explanation Detail Level:',
    aiCommentDensity: 'Code Comments Density:',
    aiCodeStyle: 'Coding Style Standard:',
    
    // Auto Backups
    autoSaveBackupsTitle: 'Auto-Backup (.gugacode/backups)',
    autoSaveEnabled: 'Auto-Backup Active',
    autoSaveDisabled: 'Auto-Backup Paused',
    backupHistoryBtn: 'Backup History',
    backupRestoredMsg: 'Backup restored successfully!',
    noBackupsYet: 'No backups recorded in .gugacode/backups/',
    
    // Terminal Export
    exportLogsBtn: 'Export Logs',
    exportAsTxt: 'Export Text (.txt)',
    exportAsMd: 'Export Markdown (.md)',
    copyAllLogs: 'Copy All Logs',
    logsExportedMsg: 'Logs exported successfully!',
    
    // Git Hooks
    tabGitHooks: 'Git Hooks',
    gitHooksTitle: 'Git Hooks Manager',
    gitHooksSub: 'Automate tests, linters, and checks before committing or pushing',
    installHookBtn: 'Install Hook into .git/hooks/',
    testHookBtn: 'Execute & Test Hook',
    hookInstalledMsg: 'Git Hook installed and made executable (chmod +x) successfully!',
    hookTestRunning: 'Executing hook script in terminal...',

    // Git Branches
    tabBranches: 'Branches',
    branchesTitle: 'Visual Git Branch Manager',
    branchesSub: 'View, create, switch, and merge repository branches in workspace',
    createBranchBtn: 'Create New Branch',
    mergeBranchBtn: 'Merge Branch',
    currentBranchLabel: 'Active Branch',
    switchBranchBtn: 'Switch (Checkout)',
    newBranchNamePlaceholder: 'new-branch-name (e.g., feature/auth)',
    mergeBranchPlaceholder: 'Select a branch to merge...',
    branchCreatedMsg: 'Branch created and selected successfully!',
    branchMergedMsg: 'Branch merged successfully!',
    branchSwitchedMsg: 'Branch switched successfully!',

    // Authorization
    authorizeBtn: 'Authorize Changes',
    authorizedBadge: 'Authorized by User',
    authorizeNotice: 'Requires explicit user authorization before applying actions.',
    authorizeSuccessMsg: 'Changes and commands authorized successfully!',

    // Package Manager DNF & Flatpak
    navPackageManager: 'Packages (DNF & Flatpak)',
    pkgTitle: 'DNF & Flatpak Package Manager',
    pkgSub: 'Search, install, and remove RPM (DNF) and Flathub (Flatpak) packages in workspace',
    tabAllPkgs: 'All',
    tabDnfPkgs: 'DNF (RPM)',
    tabFlatpakPkgs: 'Flatpak (Flathub)',
    tabInstalledPkgs: 'Installed',
    pkgSearchPlaceholder: 'Search packages (e.g., gcc, rust, python3, vlc, discord, htop)...',
    btnInstallPkg: 'Install Package',
    btnRemovePkg: 'Remove Package',
    customPkgInstall: 'Install Custom Package',
    pkgInstalling: 'Installing package...',
    pkgRemoving: 'Removing package...',
    pkgTerminalConsole: 'Package Terminal Output Logs',
    
    // Command Palette & Keyboard Shortcuts
    cmdPaletteTitle: 'Command Palette & Shortcuts',
    cmdPaletteSub: 'Type to search files, switch views, or execute actions quickly',
    cmdPaletteSearchPlaceholder: 'Search files, tools, or commands (e.g., App.tsx, terminal, dnf, theme)...',
    cmdGroupActions: 'Quick Actions & Views',
    cmdGroupFiles: 'Project Files',
    cmdGroupSystem: 'Linux System Commands',
    cmdViewAgent: 'Go to Guga Agent (AI Chat)',
    cmdViewWorkspace: 'Go to Code Editor (Workspace)',
    cmdViewTerminal: 'Go to Native Linux Terminal',
    cmdOpenPackages: 'Open Package Manager (DNF & Flatpak)',
    cmdOpenMonitor: 'Open System Monitor (Nobara Hardware)',
    cmdOpenGitHub: 'Open GitHub Sync',
    cmdOpenModels: 'Select / Download Ollama Models',
    cmdOpenSettings: 'Open GugaCode Settings',
    cmdOpenTutorial: 'Open Extensive Guide & Tutorial',
    cmdExecNobaraSync: 'Execute nobara-sync (Nobara Update)',
    cmdExecDnfCheck: 'Execute dnf check-update (Check RPM Packages)',
    cmdExecGitStatus: 'Execute git status (Repository Status)',
    cmdToggleTheme: 'Toggle Visual Theme (Nobara Dark / Fedora Light)',
    cmdToggleLang: 'Toggle Language (Português / English)',
    cmdClearTerminal: 'Clear Terminal Output Logs',
    shortcutHintPalette: 'Press Ctrl+P or Ctrl+K anytime to open the Command Palette',
    shortcutHintToggleView: 'Ctrl+J to switch between Agent, Editor, and Terminal',
    
    // Terminal Appearance Settings
    terminalAppearanceTitle: 'Native Terminal Appearance',
    terminalFontFamily: 'Terminal Font Family',
    terminalFontSize: 'Font Size (px)',
    terminalTheme: 'Terminal Color Theme',
    terminalPreview: 'Live Terminal Preview',
    
    // Tutorial
    tutorialTitle: 'Extensive Guide & Tutorial - GugaCode',
    tutorialSub: 'Learn how to use all GugaCode features on Nobara Linux, Fedora, and other Linux distros.',
    tutNavIntro: 'Overview',
    tutNavAgent: 'Guga Agent',
    tutNavOllama: 'Local Ollama',
    tutNavCloud: 'Cloud Providers',
    tutNavGithub: 'GitHub Sync',
    tutNavTerminal: 'Linux Terminal',
    tutNavDistros: 'Distro Support',
    
    // Welcome Msg
    welcomeTitle: '### 🚀 Welcome to GugaCode (Linux AI Coding Assistant)',
    welcomeIntro: 'I am **Guga**, your **Claude Code CLI** style AI assistant, optimized for **Nobara Linux** and **Fedora Linux**, with complete support for Arch, Debian, Ubuntu, and other distributions.',
    welcomeFeaturesTitle: '#### 🛠️ Key Features:',
    welcomeF1: '💻 **Coding & Refactoring**: Read, edit, and create files in Rust, Python, C++, TypeScript, and Bash.',
    welcomeF2: '📖 **Extensive Tutorial**: Click the **[Tutorial]** button at the top for a full guide on all tools.',
    welcomeF3: '⚡ **Integrated Native Terminal**: Run Linux commands (`nobara-sync`, `cargo run`, `git status`, `dnf update`, `flatpak`).',
    welcomeF4: '🐙 **GitHub Integration**: Clone public/private repositories and push commits directly.',
    welcomeF5: '🤖 **Local Ollama & Cloud Models**: Support for `qwen2.5-coder`, `deepseek-coder`, Gemini 2.5, GPT-4o, Claude 3.5, and Groq.',
    welcomeF6: '🎙️ **Voice & Audio**: Speech recognition in Portuguese/English and Text-To-Speech audio synthesis.',
    welcomeF7: '🌐 **Multilingual & Theme Support**: Switch between English and Portuguese, Dark Mode (Nobara) and Light Mode (Fedora).',
    welcomeCTA: 'Click **[Tutorial]** in the top menu or ask a question below to get started!',
  },
};

export function t(lang: Language, key: keyof typeof translations['pt-BR']): string {
  const dict = translations[lang] || translations['pt-BR'];
  return dict[key] || translations['pt-BR'][key] || key;
}
