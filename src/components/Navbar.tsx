import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Cpu, 
  Settings, 
  FolderTree, 
  MessageSquare, 
  Box, 
  RefreshCw, 
  AlertCircle,
  Code2,
  Sparkles,
  Github,
  BookOpen,
  Sun,
  Moon,
  Globe,
  Package,
  SlidersHorizontal,
  ChevronDown,
  Command
} from 'lucide-react';
import { AppConfig, OllamaStatus, OllamaModel } from '../types';
import { t } from '../i18n';

interface NavbarProps {
  config: AppConfig;
  ollamaStatus: OllamaStatus;
  models: OllamaModel[];
  activeView: 'agent' | 'workspace' | 'terminal';
  setActiveView: (view: 'agent' | 'workspace' | 'terminal') => void;
  onOpenModelsModal: () => void;
  onOpenSystemMonitor: () => void;
  onOpenSettings: () => void;
  onOpenGitHubModal: () => void;
  onOpenTutorial: () => void;
  onOpenPackageManager: () => void;
  onOpenCommandPalette?: () => void;
  onExecuteCommand?: (cmd: string) => void;
  onSelectModel: (modelName: string) => void;
  onCheckStatus: () => void;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  ollamaStatus,
  models,
  activeView,
  setActiveView,
  onOpenModelsModal,
  onOpenSystemMonitor,
  onOpenSettings,
  onOpenGitHubModal,
  onOpenTutorial,
  onOpenPackageManager,
  onOpenCommandPalette,
  onExecuteCommand,
  onSelectModel,
  onCheckStatus,
  onUpdateConfig,
}) => {
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const lang = config.language || 'pt-BR';
  const isLight = config.themeMode === 'light-fedora';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    onUpdateConfig({ language: lang === 'pt-BR' ? 'en' : 'pt-BR' });
    setIsToolsMenuOpen(false);
  };

  const toggleTheme = () => {
    onUpdateConfig({ themeMode: isLight ? 'dark-nobara' : 'light-fedora' });
    setIsToolsMenuOpen(false);
  };

  const runQuickCmd = (cmd: string) => {
    if (onExecuteCommand) {
      onExecuteCommand(cmd);
    } else {
      setActiveView('terminal');
    }
  };

  return (
    <div className={`flex flex-col border-b select-none relative z-30 ${
      isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-[#0f131d] border-[#232a3b] text-slate-200'
    }`}>
      <header className="px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Brand & OS Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/30">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base tracking-tight font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Guga<span className="text-emerald-500">Code</span>
                </span>
                <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                  isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                }`}>
                  {t(lang, 'brandBadge')}
                </span>
              </div>
              <p className={`text-[11px] hidden lg:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t(lang, 'brandSubtitle')}
              </p>
            </div>
          </div>

          {/* Ollama Status Pill */}
          <div className={`h-5 w-[1px] mx-1 hidden md:block ${isLight ? 'bg-slate-300' : 'bg-[#232a3b]'}`} />

          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#161c2b] border-[#273248]'
          }`}>
            <button
              onClick={onCheckStatus}
              title="Ollama Connection Status"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              {ollamaStatus === 'connected' ? (
                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ollama Local ON
                </span>
              ) : ollamaStatus === 'simulated' ? (
                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Ollama Engine (Simulated)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Ollama Offline
                </span>
              )}
              <RefreshCw className={`w-3 h-3 hover:text-emerald-500 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        <div className={`flex items-center p-1 rounded-xl border ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#141926] border-[#252f44]'
        }`}>
          <button
            id="nav-agent-tab"
            onClick={() => setActiveView('agent')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'agent'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30 font-semibold'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2638]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t(lang, 'navAgent')}</span>
          </button>

          <button
            id="nav-workspace-tab"
            onClick={() => setActiveView('workspace')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'workspace'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30 font-semibold'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2638]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>{t(lang, 'navWorkspace')}</span>
          </button>

          <button
            id="nav-terminal-tab"
            onClick={() => setActiveView('terminal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'terminal'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30 font-semibold'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2638]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t(lang, 'navTerminal')}</span>
          </button>
        </div>

        {/* Primary Actions & Clean Tools Dropdown */}
        <div className="flex items-center gap-2">
          {/* Command Palette Trigger Button */}
          {onOpenCommandPalette && (
            <button
              id="cmd-palette-btn"
              onClick={onOpenCommandPalette}
              title={t(lang, 'cmdPaletteTitle')}
              className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#161c2b] hover:bg-[#1e263a] border-[#273248] text-slate-200'
              }`}
            >
              <Command className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden xl:inline text-[11px] font-semibold">Comandos</span>
              <kbd className={`hidden sm:inline px-1.5 py-0.5 rounded text-[10px] border ${
                isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-[#0a0f1a] text-slate-400 border-[#232f48]'
              }`}>
                Ctrl+P
              </kbd>
            </button>
          )}

          {/* Model Selector Pill */}
          <button
            id="model-selector-btn"
            onClick={onOpenModelsModal}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#161c2b] hover:bg-[#1e263a] border-[#273248] text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold truncate max-w-[100px] sm:max-w-[130px]">
              {config.selectedModel}
            </span>
            <span className={`text-[10px] border px-1.5 py-0.2 rounded font-sans hidden sm:inline ${
              isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
            }`}>
              Ollama
            </span>
          </button>

          {/* Package Manager Button */}
          <button
            id="package-manager-btn"
            onClick={onOpenPackageManager}
            title={t(lang, 'navPackageManager')}
            className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#161c2b] hover:bg-[#1e263a] border-[#273248] text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-cyan-500" />
            <span className="hidden sm:inline">{t(lang, 'navPackageManager')}</span>
          </button>

          {/* Organized Tools & Options Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              id="tools-menu-btn"
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              title="Ferramentas & Configurações"
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                isToolsMenuOpen
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                  : isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#161c2b] hover:bg-[#1e263a] border-[#273248] text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline font-semibold">Ferramentas</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Content */}
            {isToolsMenuOpen && (
              <div className={`absolute right-0 mt-2 w-64 border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#121826] border-[#2a3650] text-slate-200'
              }`}>
                <div className={`px-3 py-1.5 border-b text-[10px] font-bold uppercase tracking-wider font-mono flex items-center justify-between ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-[#212b40] text-slate-400'
                }`}>
                  <span>Ferramentas & Opções</span>
                  <span className="text-emerald-500">GugaCode</span>
                </div>

                {/* Command Palette Item */}
                {onOpenCommandPalette && (
                  <button
                    id="cmd-palette-item"
                    onClick={() => {
                      onOpenCommandPalette();
                      setIsToolsMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors font-mono ${
                      isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1c263c] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Command className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Paleta de Comandos</span>
                    </div>
                    <kbd className={`px-1.5 py-0.5 rounded text-[10px] border ${
                      isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-[#0a0f1a] text-slate-400 border-[#232f48]'
                    }`}>
                      Ctrl+P
                    </kbd>
                  </button>
                )}

                {/* System Monitor */}
                <button
                  id="system-monitor-item"
                  onClick={() => {
                    onOpenSystemMonitor();
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors font-mono ${
                    isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1c263c] text-slate-200'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t(lang, 'navSystemMonitor')}</span>
                </button>

                {/* GitHub Sync */}
                <button
                  id="github-sync-item"
                  onClick={() => {
                    onOpenGitHubModal();
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors font-mono ${
                    isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1c263c] text-slate-200'
                  }`}
                >
                  <Github className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Sincronizar GitHub</span>
                </button>

                {/* Tutorial Guide */}
                <button
                  id="tutorial-item"
                  onClick={() => {
                    onOpenTutorial();
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors font-mono ${
                    isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1c263c] text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t(lang, 'navTutorial')}</span>
                </button>

                {/* Settings */}
                <button
                  id="app-settings-item"
                  onClick={() => {
                    onOpenSettings();
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors font-mono ${
                    isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1c263c] text-slate-200'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{t(lang, 'navSettings')}</span>
                </button>

                <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-[#212b40]'}`} />

                {/* Fast Terminal Commands Sub-Group */}
                <div className="px-3 py-1">
                  <div className={`text-[10px] font-bold font-mono mb-1.5 flex items-center gap-1.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <Terminal className="w-3 h-3 text-emerald-500" />
                    <span>Comandos Rápidos</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                    <button
                      onClick={() => { runQuickCmd('nobara-sync'); setIsToolsMenuOpen(false); }}
                      className={`p-1 rounded text-left truncate border transition-colors ${
                        isLight ? 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-800' : 'bg-[#151c2d] hover:bg-[#1f2a42] border-[#25334d] text-emerald-400'
                      }`}
                    >
                      ⚡ nobara-sync
                    </button>
                    <button
                      onClick={() => { runQuickCmd('sudo dnf check-update'); setIsToolsMenuOpen(false); }}
                      className={`p-1 rounded text-left truncate border transition-colors ${
                        isLight ? 'bg-slate-50 hover:bg-cyan-50 border-slate-200 text-slate-800' : 'bg-[#151c2d] hover:bg-[#1f2a42] border-[#25334d] text-cyan-400'
                      }`}
                    >
                      📦 dnf update
                    </button>
                    <button
                      onClick={() => { runQuickCmd('git status'); setIsToolsMenuOpen(false); }}
                      className={`p-1 rounded text-left truncate border transition-colors ${
                        isLight ? 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800' : 'bg-[#151c2d] hover:bg-[#1f2a42] border-[#25334d] text-amber-400'
                      }`}
                    >
                      🌿 git status
                    </button>
                    <button
                      onClick={() => { runQuickCmd('fastfetch'); setIsToolsMenuOpen(false); }}
                      className={`p-1 rounded text-left truncate border transition-colors ${
                        isLight ? 'bg-slate-50 hover:bg-purple-50 border-slate-200 text-slate-800' : 'bg-[#151c2d] hover:bg-[#1f2a42] border-[#25334d] text-purple-400'
                      }`}
                    >
                      🖥️ fastfetch
                    </button>
                    <button
                      onClick={() => { runQuickCmd('cargo check'); setIsToolsMenuOpen(false); }}
                      className={`p-1 rounded text-left truncate border transition-colors ${
                        isLight ? 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-800' : 'bg-[#151c2d] hover:bg-[#1f2a42] border-[#25334d] text-emerald-400'
                      }`}
                    >
                      🦀 cargo check
                    </button>
                    <button
                      onClick={() => { runQuickCmd('clear'); setIsToolsMenuOpen(false); }}
                      className={`p-1 rounded text-left truncate border transition-colors ${
                        isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#151c2d] hover:bg-[#1f2a42] border-[#25334d] text-slate-400'
                      }`}
                    >
                      🧹 clear
                    </button>
                  </div>
                </div>

                <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-[#212b40]'}`} />

                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors font-mono ${
                    isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1c263c] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-cyan-500" />
                    <span>Idioma / Language</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#1a2338] text-cyan-300 border-[#2b3a5c]'
                  }`}>
                    {lang === 'pt-BR' ? 'Português (PT)' : 'English (EN)'}
                  </span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors font-mono ${
                    isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1c263c] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isLight ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    )}
                    <span>Tema Visual</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#1a2338] text-slate-300 border-[#2b3a5c]'
                  }`}>
                    {isLight ? 'Fedora Light' : 'Nobara Dark'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar strip with direct command buttons as requested */}
      <div className={`px-4 py-1.5 border-t flex items-center gap-2 overflow-x-auto text-xs font-mono ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0b0e16] border-[#1d2433] text-slate-300'
      }`}>
        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 shrink-0">
          <Terminal className="w-3.5 h-3.5" />
          Barra de Comandos:
        </span>

        <button
          onClick={() => runQuickCmd('nobara-sync')}
          className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold transition-all hover:scale-105 shrink-0 ${
            isLight ? 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-800 hover:border-emerald-400' : 'bg-[#141b29] hover:bg-[#1e283d] border-[#26334c] text-emerald-400 hover:border-emerald-500'
          }`}
          title="Executar nobara-sync"
        >
          ⚡ nobara-sync
        </button>

        <button
          onClick={() => runQuickCmd('sudo dnf check-update')}
          className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold transition-all hover:scale-105 shrink-0 ${
            isLight ? 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-800 hover:border-emerald-400' : 'bg-[#141b29] hover:bg-[#1e283d] border-[#26334c] text-cyan-400 hover:border-cyan-500'
          }`}
          title="Executar dnf check-update"
        >
          📦 dnf update
        </button>

        <button
          onClick={() => runQuickCmd('git status')}
          className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold transition-all hover:scale-105 shrink-0 ${
            isLight ? 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-800 hover:border-emerald-400' : 'bg-[#141b29] hover:bg-[#1e283d] border-[#26334c] text-amber-400 hover:border-amber-500'
          }`}
          title="Verificar git status"
        >
          🌿 git status
        </button>

        <button
          onClick={() => runQuickCmd('fastfetch')}
          className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold transition-all hover:scale-105 shrink-0 ${
            isLight ? 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-800 hover:border-emerald-400' : 'bg-[#141b29] hover:bg-[#1e283d] border-[#26334c] text-purple-400 hover:border-purple-500'
          }`}
          title="Exibir informações do sistema"
        >
          🖥️ fastfetch
        </button>

        <button
          onClick={() => runQuickCmd('cargo check')}
          className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold transition-all hover:scale-105 shrink-0 ${
            isLight ? 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-800 hover:border-emerald-400' : 'bg-[#141b29] hover:bg-[#1e283d] border-[#26334c] text-emerald-400 hover:border-emerald-500'
          }`}
          title="Verificar projeto Rust"
        >
          🦀 cargo check
        </button>

        <button
          onClick={() => runQuickCmd('clear')}
          className={`px-2.5 py-0.5 rounded border text-[11px] transition-all hover:scale-105 shrink-0 ${
            isLight ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-[#141b29] hover:bg-[#1e283d] border-[#26334c] text-slate-400'
          }`}
          title="Limpar terminal"
        >
          🧹 clear
        </button>
      </div>
    </div>
  );
};


