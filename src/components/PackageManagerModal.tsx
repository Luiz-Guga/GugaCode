import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Download, 
  Trash2, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Cpu, 
  HardDrive,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Language, t } from '../i18n';
import { TerminalLog } from '../types';

export interface PackageItem {
  id: string;
  name: string;
  displayName: string;
  type: 'dnf' | 'flatpak';
  category: 'Dev' | 'CLI' | 'System' | 'Media' | 'Gaming';
  version: string;
  description: string;
  installed: boolean;
  size: string;
}

const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: 'gcc',
    name: 'gcc',
    displayName: 'GCC (GNU Compiler Collection)',
    type: 'dnf',
    category: 'Dev',
    version: '14.2.1',
    description: 'Compiladores C, C++ e Fortran nativos para Linux Fedora / Nobara.',
    installed: true,
    size: '128 MB',
  },
  {
    id: 'rust',
    name: 'rust',
    displayName: 'Rust Programming Language & Cargo',
    type: 'dnf',
    category: 'Dev',
    version: '1.84.0',
    description: 'Linguagem de programação focada em performance e segurança de memória.',
    installed: true,
    size: '310 MB',
  },
  {
    id: 'python3-pip',
    name: 'python3-pip',
    displayName: 'Python3 Pip & Setup Tools',
    type: 'dnf',
    category: 'Dev',
    version: '24.0',
    description: 'Gerenciador oficial de pacotes Python para Nobara e Fedora Workstation.',
    installed: true,
    size: '18 MB',
  },
  {
    id: 'neovim',
    name: 'neovim',
    displayName: 'Neovim Editor CLI',
    type: 'dnf',
    category: 'CLI',
    version: '0.10.3',
    description: 'Vim-fork focado em extensibilidade e usabilidade extrema.',
    installed: false,
    size: '34 MB',
  },
  {
    id: 'fastfetch',
    name: 'fastfetch',
    displayName: 'Fastfetch System Info Tool',
    type: 'dnf',
    category: 'CLI',
    version: '2.34.0',
    description: 'Substituto ultra-rápido para o neofetch escrito em C puro.',
    installed: true,
    size: '4.2 MB',
  },
  {
    id: 'docker-ce',
    name: 'docker-ce',
    displayName: 'Docker Community Edition Engine',
    type: 'dnf',
    category: 'System',
    version: '27.5.1',
    description: 'Engine para execução e isolamento de containers Linux.',
    installed: false,
    size: '185 MB',
  },
  {
    id: 'com.visualstudio.code',
    name: 'com.visualstudio.code',
    displayName: 'Visual Studio Code (Flathub)',
    type: 'flatpak',
    category: 'Dev',
    version: '1.96.2',
    description: 'Editor de código-fonte multiplataforma empacotado em Flatpak sandbox.',
    installed: true,
    size: '240 MB',
  },
  {
    id: 'com.valvesoftware.Steam',
    name: 'com.valvesoftware.Steam',
    displayName: 'Steam Client (Flatpak Flathub)',
    type: 'flatpak',
    category: 'Gaming',
    version: '1.0.0.82',
    description: 'Plataforma oficial de jogos Valve otimizada para Nobara Linux.',
    installed: true,
    size: '420 MB',
  },
  {
    id: 'org.videolan.VLC',
    name: 'org.videolan.VLC',
    displayName: 'VLC Media Player',
    type: 'flatpak',
    category: 'Media',
    version: '3.0.21',
    description: 'Reprodutor de mídia e áudio completo com suporte a todos os codecs.',
    installed: false,
    size: '110 MB',
  },
  {
    id: 'com.discordapp.Discord',
    name: 'com.discordapp.Discord',
    displayName: 'Discord Flatpak App',
    type: 'flatpak',
    category: 'Media',
    version: '0.0.80',
    description: 'Aplicativo de bate-papo de voz e texto para comunidades de dev e jogos.',
    installed: false,
    size: '165 MB',
  },
  {
    id: 'org.gimp.GIMP',
    name: 'org.gimp.GIMP',
    displayName: 'GIMP Image Editor',
    type: 'flatpak',
    category: 'Media',
    version: '3.0.0-RC1',
    description: 'Manipulação de imagens e fotos profissional de código aberto.',
    installed: false,
    size: '380 MB',
  },
  {
    id: 'htop',
    name: 'htop',
    displayName: 'Htop Interactive Process Viewer',
    type: 'dnf',
    category: 'System',
    version: '3.3.0',
    description: 'Visualizador de processos interativo e colorido para o terminal.',
    installed: true,
    size: '2.1 MB',
  },
];

interface PackageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onExecuteCommand: (cmd: string) => Promise<TerminalLog>;
  themeMode?: string;
}

export const PackageManagerModal: React.FC<PackageManagerModalProps> = ({
  isOpen,
  onClose,
  language,
  onExecuteCommand,
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  const [packages, setPackages] = useState<PackageItem[]>(DEFAULT_PACKAGES);
  const [activeTab, setActiveTab] = useState<'all' | 'dnf' | 'flatpak' | 'installed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customPackageInput, setCustomPackageInput] = useState<string>('');
  const [customPackageType, setCustomPackageType] = useState<'dnf' | 'flatpak'>('dnf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleInstallPackage = async (pkg: PackageItem) => {
    setIsProcessing(true);
    setStatusNotification({ type: 'info', text: `${t(language, 'pkgInstalling')} ${pkg.displayName}...` });

    const cmd = pkg.type === 'dnf' 
      ? `sudo dnf install -y ${pkg.name}` 
      : `flatpak install -y flathub ${pkg.name}`;

    try {
      const res = await onExecuteCommand(cmd);
      setTerminalOutput(res.output || `[OK] Comandos executados para ${pkg.name}`);

      // Update local installed state
      setPackages((prev) =>
        prev.map((item) => (item.id === pkg.id ? { ...item, installed: true } : item))
      );

      setStatusNotification({
        type: 'success',
        text: `Pacote '${pkg.displayName}' instalado com sucesso via ${pkg.type.toUpperCase()}!`,
      });
    } catch (err: any) {
      setStatusNotification({
        type: 'error',
        text: `Falha ao instalar o pacote ${pkg.name}: ${err.message || err}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePackage = async (pkg: PackageItem) => {
    setIsProcessing(true);
    setStatusNotification({ type: 'info', text: `${t(language, 'pkgRemoving')} ${pkg.displayName}...` });

    const cmd = pkg.type === 'dnf' 
      ? `sudo dnf remove -y ${pkg.name}` 
      : `flatpak uninstall -y ${pkg.name}`;

    try {
      const res = await onExecuteCommand(cmd);
      setTerminalOutput(res.output || `[OK] Pacote ${pkg.name} removido com sucesso.`);

      // Update local installed state
      setPackages((prev) =>
        prev.map((item) => (item.id === pkg.id ? { ...item, installed: false } : item))
      );

      setStatusNotification({
        type: 'success',
        text: `Pacote '${pkg.displayName}' removido do sistema!`,
      });
    } catch (err: any) {
      setStatusNotification({
        type: 'error',
        text: `Falha ao remover o pacote ${pkg.name}: ${err.message || err}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstallCustom = async () => {
    const trimmed = customPackageInput.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    setStatusNotification({ type: 'info', text: `Instalando pacote personalizado '${trimmed}'...` });

    const cmd = customPackageType === 'dnf'
      ? `sudo dnf install -y ${trimmed}`
      : `flatpak install -y flathub ${trimmed}`;

    try {
      const res = await onExecuteCommand(cmd);
      setTerminalOutput(res.output || `[OK] Comandos executados para ${trimmed}`);

      // Check if package already exists in list or add it
      const existing = packages.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
      if (existing) {
        setPackages((prev) =>
          prev.map((item) => (item.id === existing.id ? { ...item, installed: true } : item))
        );
      } else {
        const newPkgItem: PackageItem = {
          id: `custom-${Date.now()}`,
          name: trimmed,
          displayName: trimmed,
          type: customPackageType,
          category: 'CLI',
          version: '1.0.0',
          description: `Pacote personalizado do repositório ${customPackageType.toUpperCase()}.`,
          installed: true,
          size: 'Custom',
        };
        setPackages((prev) => [newPkgItem, ...prev]);
      }

      setStatusNotification({
        type: 'success',
        text: `Pacote '${trimmed}' instalado com sucesso no sistema!`,
      });
      setCustomPackageInput('');
    } catch (err: any) {
      setStatusNotification({
        type: 'error',
        text: `Erro ao instalar ${trimmed}: ${err.message || err}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncRepos = async () => {
    setIsProcessing(true);
    setStatusNotification({ type: 'info', text: 'Sincronizando repositórios DNF e Flathub...' });
    try {
      const res = await onExecuteCommand('sudo dnf check-update && flatpak update --no-deploy');
      setTerminalOutput(res.output || '[OK] Repositórios sincronizados.');
      setStatusNotification({
        type: 'success',
        text: 'Repositórios DNF & Flatpak atualizados com sucesso!',
      });
    } catch (err) {
      setStatusNotification({ type: 'error', text: 'Erro ao sincronizar repositórios.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter packages based on activeTab, selectedCategory, and searchQuery
  const filteredPackages = packages.filter((pkg) => {
    // Tab filter
    if (activeTab === 'dnf' && pkg.type !== 'dnf') return false;
    if (activeTab === 'flatpak' && pkg.type !== 'flatpak') return false;
    if (activeTab === 'installed' && !pkg.installed) return false;

    // Category filter
    if (selectedCategory !== 'All' && pkg.category !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = pkg.name.toLowerCase().includes(q);
      const matchDisplay = pkg.displayName.toLowerCase().includes(q);
      const matchDesc = pkg.description.toLowerCase().includes(q);
      return matchName || matchDisplay || matchDesc;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className={`border w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0f1420] border-[#232f48] text-slate-200'
      }`}>
        
        {/* Header Bar */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141b2b] border-[#1e2a42]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/30 border border-emerald-400/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-bold font-mono flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <span>{t(language, 'pkgTitle')}</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 px-2 py-0.5 rounded-full font-bold">
                  Fedora / Nobara
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {t(language, 'pkgSub')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncRepos}
              disabled={isProcessing}
              className="bg-[#1e2a42] hover:bg-[#283859] text-slate-200 px-3 py-1.5 rounded-xl border border-[#2f4066] transition-all flex items-center gap-1.5 text-xs font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Sincronizar Repos</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f2a40] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusNotification && (
          <div
            className={`px-5 py-2.5 text-xs font-mono flex items-center justify-between shrink-0 ${
              statusNotification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-b border-emerald-800'
                : statusNotification.type === 'error'
                ? 'bg-red-950/90 text-red-300 border-b border-red-800'
                : 'bg-cyan-950/90 text-cyan-300 border-b border-cyan-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : statusNotification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              )}
              <span>{statusNotification.text}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-slate-400 hover:text-white text-xs underline"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#121826] border-b border-[#1f2b45] space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-[#0a0d16] p-1 rounded-xl border border-[#212d46] text-xs font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(language, 'tabAllPkgs')} ({packages.length})
              </button>
              <button
                onClick={() => setActiveTab('dnf')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'dnf'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(language, 'tabDnfPkgs')} ({packages.filter((p) => p.type === 'dnf').length})
              </button>
              <button
                onClick={() => setActiveTab('flatpak')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'flatpak'
                    ? 'bg-cyan-700 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(language, 'tabFlatpakPkgs')} ({packages.filter((p) => p.type === 'flatpak').length})
              </button>
              <button
                onClick={() => setActiveTab('installed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'installed'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(language, 'tabInstalledPkgs')} ({packages.filter((p) => p.installed).length})
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono hidden md:inline">Categoria:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#0b0f19] border border-[#25324d] text-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="All">Todas as Categorias</option>
                <option value="Dev">Dev & Compiladores</option>
                <option value="CLI">CLI & Utilitários</option>
                <option value="System">Sistema & Containers</option>
                <option value="Media">Mídia & Design</option>
                <option value="Gaming">Jogos & Steam</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, 'pkgSearchPlaceholder')}
              className="w-full bg-[#0b0f19] border border-[#222f48] focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-xs font-mono focus:outline-none shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Content Body: Package List & Terminal Console Output */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          
          {/* Custom Package Quick Install Box */}
          <div className="bg-[#121927] border border-[#23314c] p-3.5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-200 font-semibold">{t(language, 'customPkgInstall')}:</span>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <select
                value={customPackageType}
                onChange={(e) => setCustomPackageType(e.target.value as 'dnf' | 'flatpak')}
                className="bg-[#0c101a] border border-[#273653] text-cyan-300 rounded-lg px-2.5 py-1.5 focus:outline-none font-bold"
              >
                <option value="dnf">DNF (RPM)</option>
                <option value="flatpak">Flatpak (Flathub)</option>
              </select>
              <input
                type="text"
                value={customPackageInput}
                onChange={(e) => setCustomPackageInput(e.target.value)}
                placeholder="nome-do-pacote (ex: zsh, htop, obs-studio...)"
                className="flex-1 bg-[#0c101a] border border-[#273653] focus:border-cyan-500 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleInstallCustom}
                disabled={isProcessing || !customPackageInput.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            </div>
          </div>

          {/* Package Grid */}
          {filteredPackages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono space-y-2 border border-dashed border-[#23314c] rounded-2xl">
              <Package className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm">Nenhum pacote encontrado para a busca "{searchQuery}".</p>
              <p className="text-xs text-slate-500">
                Você pode instalar diretamente usando o campo de 'Instalar Pacote Personalizado' acima.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    pkg.installed
                      ? 'bg-[#121b2b] border-emerald-600/50'
                      : 'bg-[#111624] border-[#202c44] hover:bg-[#151c2e]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-white font-mono flex items-center gap-2">
                          <span>{pkg.displayName}</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Comando: <code className="text-cyan-300 font-bold">{pkg.name}</code>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${
                            pkg.type === 'dnf'
                              ? 'bg-blue-950 text-blue-300 border-blue-700'
                              : 'bg-cyan-950 text-cyan-300 border-cyan-700'
                          }`}
                        >
                          {pkg.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{pkg.size}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="pt-2 border-t border-[#1d273c] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#1a2336] text-slate-300 border border-[#2b3a58] px-2 py-0.5 rounded">
                        v{pkg.version}
                      </span>
                      {pkg.installed ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Instalado
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Pronto para instalar</span>
                      )}
                    </div>

                    <div>
                      {pkg.installed ? (
                        <button
                          onClick={() => handleRemovePackage(pkg)}
                          disabled={isProcessing}
                          className="bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 font-bold shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstallPackage(pkg)}
                          disabled={isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 font-bold shadow shadow-emerald-950/50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Instalar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Terminal Output Logs Console */}
          {terminalOutput && (
            <div className="mt-4 bg-[#090d16] border border-[#202c45] p-3.5 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#1b253b] pb-2">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  {t(language, 'pkgTerminalConsole')}
                </span>
                <button
                  onClick={() => setTerminalOutput(null)}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Limpar Log
                </button>
              </div>
              <pre className="text-emerald-300 bg-[#05080e] p-3 rounded-lg overflow-x-auto max-h-48 custom-scrollbar text-[11px] leading-snug whitespace-pre-wrap">
                {terminalOutput}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1e2a42] bg-[#121826] flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              DNF: RPM Fedora Official Repos
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Flatpak: Flathub Sandbox
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#1e283d] hover:bg-[#283652] text-slate-200 px-4 py-1.5 rounded-lg border border-[#2d3d5d] transition-colors font-bold"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
