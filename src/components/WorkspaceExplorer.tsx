import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Save, 
  Plus, 
  Trash2, 
  RotateCcw,
  Code2,
  FileCode,
  Search,
  Check,
  Terminal,
  Cpu,
  Github,
  Download,
  History,
  ShieldCheck,
  Clock,
  Columns,
  Rows,
  Maximize2,
  Play,
  X,
  Filter,
  GitCommit
} from 'lucide-react';
import { ProjectFile, TerminalLog, TerminalAppearanceSettings } from '../types';
import { OllamaService } from '../services/ollamaService';
import { BackupsModal } from './BackupsModal';
import { NativeTerminal } from './NativeTerminal';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { Language, t } from '../i18n';
import { getGitBlameForLine } from '../utils/gitBlame';

interface WorkspaceExplorerProps {
  project: ProjectFile;
  activeFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onSaveFile: (filePath: string, content: string) => void;
  onSwitchTemplate: (templateId: string) => void;
  onOpenTerminalWithCommand?: (cmd: string) => void;
  onOpenGitHubModal?: () => void;
  onOpenLocalFolder?: () => void;
  language?: Language;
  terminalLogs?: TerminalLog[];
  onClearTerminalLogs?: () => void;
  terminalSettings?: TerminalAppearanceSettings;
  themeMode?: string;
}

export const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({
  project,
  activeFile,
  onSelectFile,
  onSaveFile,
  onSwitchTemplate,
  onOpenTerminalWithCommand,
  onOpenGitHubModal,
  onOpenLocalFolder,
  language = 'pt-BR',
  terminalLogs = [],
  onClearTerminalLogs = () => {},
  terminalSettings,
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  const [fileContent, setFileContent] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'single' | 'horizontal' | 'vertical'>('single');
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    [project.path]: true,
    [`${project.path}/src`]: true,
    [`${project.path}/.gugacode`]: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBackupsModalOpen, setIsBackupsModalOpen] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [autoBackupActive, setAutoBackupActive] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'highlight'>('edit');
  const [showGitBlame, setShowGitBlame] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Recursively gather all files across the project for global search
  const allProjectFiles = React.useMemo(() => {
    const files: ProjectFile[] = [];
    const traverse = (node: ProjectFile) => {
      if (node.type === 'file') {
        files.push(node);
      } else if (node.type === 'dir' && node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(project);
    return files;
  }, [project]);

  // Global search filtering by file name and relative path
  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return allProjectFiles.filter((file) => {
      const relPath = file.path.startsWith(project.path)
        ? file.path.slice(project.path.length + 1)
        : file.path;
      return file.name.toLowerCase().includes(term) || relPath.toLowerCase().includes(term);
    });
  }, [allProjectFiles, searchTerm, project.path]);

  // Expand parent directories of a file so it stays visible in the tree when search is cleared
  const expandParentDirs = (filePath: string) => {
    const relPath = filePath.startsWith(project.path)
      ? filePath.slice(project.path.length + 1)
      : filePath;
    const parts = relPath.split('/');
    let current = project.path;
    const toExpand: Record<string, boolean> = { [current]: true };
    for (let i = 0; i < parts.length - 1; i++) {
      current = `${current}/${parts[i]}`;
      toExpand[current] = true;
    }
    setExpandedDirs((prev) => ({ ...prev, ...toExpand }));
  };

  const handleSelectFileFromSearch = (file: ProjectFile) => {
    expandParentDirs(file.path);
    onSelectFile(file);
  };

  // Sync editor content when activeFile changes
  React.useEffect(() => {
    if (activeFile && activeFile.type === 'file') {
      setFileContent(activeFile.content || '');
    }
  }, [activeFile]);

  // Periodic Auto-Backup to .gugacode/backups
  useEffect(() => {
    if (!autoBackupActive || !activeFile || activeFile.type !== 'file' || !fileContent) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Debounced auto-backup 4 seconds after last keypress
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const res = await OllamaService.createBackup(activeFile.path, fileContent);
        if (res && res.success) {
          setLastBackupTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.warn('Auto-backup error:', e);
      }
    }, 4000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [fileContent, activeFile, autoBackupActive]);

  const toggleDirectory = (dirPath: string) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [dirPath]: !prev[dirPath],
    }));
  };

  const handleSave = async () => {
    if (activeFile && activeFile.type === 'file') {
      onSaveFile(activeFile.path, fileContent);
      setSavedSuccess(true);
      
      // Also trigger explicit backup snapshot to .gugacode/backups
      try {
        const res = await OllamaService.createBackup(activeFile.path, fileContent);
        if (res && res.success) {
          setLastBackupTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        // ignore
      }

      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  // Render tree item recursively
  const renderTree = (item: ProjectFile, depth = 0) => {
    const isDir = item.type === 'dir';
    const isExpanded = expandedDirs[item.path];
    const isSelected = activeFile?.path === item.path;

    if (searchTerm && item.type === 'file' && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return (
      <div key={item.path} style={{ paddingLeft: `${depth * 12 + 8}px` }}>
        {isDir ? (
          <div
            onClick={() => toggleDirectory(item.path)}
            className={`flex items-center gap-1.5 py-1 px-2 text-xs rounded cursor-pointer select-none font-mono ${
              isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-[#1f283d]'
            }`}
          >
            {isExpanded ? (
              <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            )}
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{item.name}</span>
          </div>
        ) : (
          <div
            onClick={() => onSelectFile(item)}
            className={`flex items-center gap-1.5 py-1 px-2 text-xs rounded cursor-pointer font-mono transition-colors ${
              isSelected
                ? isLight
                  ? 'bg-emerald-100 text-emerald-900 border-l-2 border-emerald-600 font-bold'
                  : 'bg-red-950/80 text-white border-l-2 border-red-500 font-medium'
                : isLight
                  ? 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-[#1a2336] hover:text-white'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-red-400'}`} />
            <span className="truncate">{item.name}</span>
            {item.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto" />}
          </div>
        )}

        {isDir && isExpanded && item.children && (
          <div className="flex flex-col">
            {item.children.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Estimate lines and characters
  const lineCount = fileContent.split('\n').length;
  const charCount = fileContent.length;

  return (
    <div className={`flex h-full w-full overflow-hidden ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0b0e14] text-slate-200'}`}>
      {/* Sidebar File Explorer */}
      <div className={`w-72 flex flex-col h-full shrink-0 border-r ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f1420] border-[#232d42]'}`}>
        {/* Template Quick Switcher */}
        <div className={`p-3 border-b space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131929] border-[#232d42]'}`}>
          <div className={`text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>GugaCode Workspace</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
              isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'text-red-400 bg-red-950 border-red-800/40'
            }`}>
              Linux
            </span>
          </div>

          <select
            onChange={(e) => onSwitchTemplate(e.target.value)}
            className={`w-full text-xs rounded-lg p-2 focus:outline-none font-mono border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                : 'bg-[#182033] border-[#2c3954] text-slate-200 focus:border-red-500'
            }`}
          >
            <option value="rust-cli">🦀 Rust CLI (Gaming Tweaker)</option>
            <option value="python-ai">🐍 Python AI (Ollama Bridge)</option>
          </select>

          {onOpenLocalFolder && (
            <button
              onClick={onOpenLocalFolder}
              id="open-local-folder-btn"
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all border shadow-sm ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  : 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-500/60'
              }`}
              title="Abrir qualquer pasta do seu computador Linux e editar arquivos com salvamento direto no disco local"
            >
              <Folder className="w-3.5 h-3.5 text-emerald-200" />
              <span>Abrir Pasta Local</span>
            </button>
          )}

          {onOpenGitHubModal && (
            <button
              onClick={onOpenGitHubModal}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#192236] hover:bg-[#232f4a] text-slate-200 border-[#2c3c5e]'
              }`}
            >
              <Github className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`} />
              <span>Clonar do GitHub</span>
              <Download className="w-3 h-3 text-emerald-400 ml-auto" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className={`p-2.5 border-b ${isLight ? 'border-slate-200 bg-white' : 'border-[#232d42]'}`}>
          <div className="relative flex items-center">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar arquivos no projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchTerm('');
                } else if (e.key === 'Enter' && searchResults.length > 0) {
                  handleSelectFileFromSearch(searchResults[0]);
                }
              }}
              className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-md focus:outline-none font-mono border ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 placeholder-slate-400'
                  : 'bg-[#141b2a] border-[#273248] text-slate-200 focus:border-red-500 placeholder-slate-500'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute right-2 top-2 p-0.5 rounded transition-colors ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#1f283d]'
                }`}
                title="Limpar busca (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tree Directory View OR Global Search Results */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-400">
          {searchTerm.trim() ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 font-mono text-[11px]">
                <span className={`font-semibold flex items-center gap-1.5 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <Search className="w-3.5 h-3.5 text-emerald-500" />
                  Resultados ({searchResults.length})
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300' 
                      : 'bg-[#182033] hover:bg-[#202c45] text-slate-400 border-[#2a3854]'
                  }`}
                >
                  Limpar
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className={`p-4 text-center rounded-xl border my-2 space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#121826] border-[#222f46] text-slate-400'
                }`}>
                  <p className="text-xs font-mono">Nenhum arquivo encontrado para &quot;{searchTerm}&quot;</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold"
                  >
                    Ver Todos os Arquivos
                  </button>
                </div>
              ) : (
                searchResults.map((file) => {
                  const isSelected = activeFile?.path === file.path;
                  const relPath = file.path.startsWith(project.path)
                    ? file.path.slice(project.path.length + 1)
                    : file.path;
                  const folderPath = relPath.includes('/') 
                    ? relPath.substring(0, relPath.lastIndexOf('/'))
                    : '';
                  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

                  return (
                    <div
                      key={file.path}
                      onClick={() => handleSelectFileFromSearch(file)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer font-mono transition-all ${
                        isSelected
                          ? isLight
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                            : 'bg-red-950/80 border-red-500 text-white font-bold shadow-sm'
                          : isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                            : 'bg-[#121826] hover:bg-[#192236] border-[#202a3f] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-emerald-600' : 'text-red-400'}`} />
                          <span className="truncate font-semibold text-xs">{file.name}</span>
                        </div>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase font-bold shrink-0 ${
                          isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#1b253a] text-slate-400'
                        }`}>
                          {ext}
                        </span>
                      </div>
                      {folderPath && (
                        <div className={`text-[10px] mt-1 flex items-center gap-1 truncate ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{folderPath}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <>
              <div className={`text-[11px] font-mono px-2 mb-1.5 flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">{project.path}</span>
              </div>
              {renderTree(project)}
            </>
          )}
        </div>

        {/* Context Stats */}
        <div className={`p-3 border-t text-[11px] font-mono flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#131929] border-[#232d42] text-slate-400'
        }`}>
          <span>Tamanho: ~{(charCount / 1024).toFixed(1)} KB</span>
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Ready for Ollama
          </span>
        </div>
      </div>

      {/* Code Editor / File Viewer Area */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${isLight ? 'bg-white' : 'bg-[#0d111a]'}`}>
        {activeFile && activeFile.type === 'file' ? (
          <>
            {/* Editor Header Bar */}
            <div className={`border-b px-4 py-2 flex flex-wrap items-center justify-between gap-2 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-[#121724] border-[#232d42] text-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <FileCode className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-red-400'}`} />
                <span className={`font-mono text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  {activeFile.path}
                </span>
                {fileContent !== activeFile.content && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-mono font-semibold">
                    Modificado
                  </span>
                )}
              </div>

              {/* Header Right Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    searchInputRef.current?.focus();
                    searchInputRef.current?.select();
                  }}
                  className={`flex items-center gap-1.5 border px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-[#182133] hover:bg-[#202c45] border-[#2d3e61] text-slate-300'
                  }`}
                  title="Focar na busca global de arquivos no projeto"
                >
                  <Search className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Buscar Arquivo</span>
                </button>
                {/* Split View, Syntax Highlighting & Git Blame Toggle Controls */}
                <div className={`flex items-center p-1 rounded-lg border text-xs font-mono gap-1 ${
                  isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#0a0e17]' + ' border-[#232f48]'
                }`}>
                  <button
                    onClick={() => setViewMode(v => v === 'edit' ? 'highlight' : 'edit')}
                    title={viewMode === 'edit' ? "Ativar Modo Destaque de Sintaxe (Syntax Highlighting)" : "Voltar para Edição"}
                    className={`px-2 py-1 rounded transition-colors text-[11px] font-bold flex items-center gap-1 ${
                      viewMode === 'highlight'
                        ? 'bg-emerald-600 text-white'
                        : isLight ? 'text-slate-700 hover:bg-slate-300' : 'text-slate-300 hover:bg-[#1a2336]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{viewMode === 'highlight' ? 'Sintaxe Destacada' : 'Sintaxe'}</span>
                  </button>

                  <button
                    id="git-blame-toggle-btn"
                    onClick={() => setShowGitBlame(!showGitBlame)}
                    title={showGitBlame ? "Ocultar anotações do Git Blame" : "Exibir autor e data de commit por linha (Git Blame)"}
                    className={`px-2 py-1 rounded transition-colors text-[11px] font-bold flex items-center gap-1 ${
                      showGitBlame
                        ? 'bg-emerald-600 text-white'
                        : isLight ? 'text-slate-700 hover:bg-slate-300' : 'text-slate-300 hover:bg-[#1a2336]'
                    }`}
                  >
                    <GitCommit className={`w-3.5 h-3.5 ${showGitBlame ? 'text-white' : 'text-amber-400'}`} />
                    <span>Git Blame</span>
                  </button>

                  <div className={`w-[1px] h-4 ${isLight ? 'bg-slate-300' : 'bg-[#212d45]'}`} />

                  <button
                    onClick={() => setSplitMode('single')}
                    title="Painel Único (Editor Tela Cheia)"
                    className={`p-1 rounded transition-colors ${
                      splitMode === 'single'
                        ? 'bg-emerald-600 text-white font-bold'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSplitMode('horizontal')}
                    title="Split Lado a Lado (Editor + Terminal)"
                    className={`p-1 rounded transition-colors ${
                      splitMode === 'horizontal'
                        ? 'bg-emerald-600 text-white font-bold'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSplitMode('vertical')}
                    title="Split Empilhado (Editor + Terminal)"
                    className={`p-1 rounded transition-colors ${
                      splitMode === 'vertical'
                        ? 'bg-emerald-600 text-white font-bold'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Rows className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  id="open-backups-modal-btn"
                  onClick={() => setIsBackupsModalOpen(true)}
                  className={`flex items-center gap-1.5 border px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                      : 'bg-[#182133] hover:bg-[#202c45] border-[#2d3e61] text-amber-300'
                  }`}
                  title="Ver histórico de cópias de segurança em .gugacode/backups/"
                >
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{t(language, 'backupHistoryBtn')}</span>
                </button>

                {onOpenTerminalWithCommand && activeFile.name.endsWith('.rs') && (
                  <button
                    onClick={() => onOpenTerminalWithCommand('cargo run')}
                    className={`flex items-center gap-1.5 border px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      isLight
                        ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                        : 'bg-[#1a2336] hover:bg-[#232f48] border-[#2b3a58] text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-red-500" />
                    <span>cargo run</span>
                  </button>
                )}

                {onOpenTerminalWithCommand && activeFile.name.endsWith('.py') && (
                  <button
                    onClick={() => onOpenTerminalWithCommand('python3 main.py')}
                    className={`flex items-center gap-1.5 border px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      isLight
                        ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                        : 'bg-[#1a2336] hover:bg-[#232f48] border-[#2b3a58] text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-emerald-600" />
                    <span>python main.py</span>
                  </button>
                )}

                <button
                  id="save-file-btn"
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all shadow-sm ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvo!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split Content Area */}
            <div
              className={`flex-1 overflow-hidden ${
                splitMode === 'horizontal'
                  ? 'flex flex-row'
                  : splitMode === 'vertical'
                  ? 'flex flex-col'
                  : 'flex flex-col'
              }`}
            >
              {/* Code Text Area or Syntax Highlighter View */}
              <div
                className={`flex overflow-hidden font-mono text-xs ${
                  splitMode === 'horizontal'
                    ? `w-1/2 border-r ${isLight ? 'border-slate-200' : 'border-[#202a3f]'}`
                    : splitMode === 'vertical'
                    ? `h-1/2 border-b ${isLight ? 'border-slate-200' : 'border-[#202a3f]'}`
                    : 'flex-1 h-full'
                }`}
              >
                {viewMode === 'highlight' ? (
                  <SyntaxHighlighter
                    code={fileContent}
                    language={activeFile.name.split('.').pop() || 'typescript'}
                    themeMode={themeMode}
                    showLineNumbers={true}
                    showGitBlame={showGitBlame}
                    filePath={activeFile.path}
                    className="flex-1 h-full"
                  />
                ) : (
                  <>
                    {/* Line Numbers */}
                    <div className={`w-12 py-3 text-right pr-3 select-none border-r leading-relaxed shrink-0 ${
                      isLight ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-[#0a0d14] text-slate-600 border-[#1a2233]'
                    }`}>
                      {Array.from({ length: lineCount }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    {/* Git Blame Gutter Column in Edit Mode */}
                    {showGitBlame && (
                      <div className={`select-none py-3 px-2 border-r leading-relaxed shrink-0 w-48 sm:w-56 font-mono text-[10px] overflow-y-hidden ${
                        isLight ? 'bg-slate-100/90 text-slate-600 border-slate-300' : 'bg-[#090d16] text-slate-400 border-[#1b253b]'
                      }`}>
                        {Array.from({ length: lineCount }).map((_, i) => {
                          const lineText = fileContent.split('\n')[i] || '';
                          const blame = getGitBlameForLine(activeFile.path, i, lineText);
                          return (
                            <div
                              key={i}
                              className="truncate flex items-center justify-between gap-1 h-[1.375rem] px-1 hover:bg-emerald-500/10 rounded transition-colors"
                              title={`${blame.commitHash} • ${blame.author}: ${blame.message} (${blame.date})`}
                            >
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                                {blame.author}
                              </span>
                              <span className="text-[9px] opacity-70 shrink-0 font-sans">
                                {blame.date}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Textarea Code Input */}
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      spellCheck={false}
                      className={`flex-1 p-3 leading-relaxed focus:outline-none resize-none font-mono ${
                        isLight
                          ? 'bg-white text-slate-900 selection:bg-emerald-200'
                          : 'bg-[#0d111a] text-slate-100 selection:bg-red-900/60'
                      }`}
                    />
                  </>
                )}
              </div>

              {/* Embedded Native Terminal in Split View Mode */}
              {splitMode !== 'single' && (
                <div
                  className={`overflow-hidden ${
                    splitMode === 'horizontal' ? 'w-1/2 h-full' : 'h-1/2 w-full'
                  }`}
                >
                  <NativeTerminal
                    logs={terminalLogs}
                    onExecuteCommand={onOpenTerminalWithCommand || (() => {})}
                    onClearLogs={onClearTerminalLogs}
                    language={language}
                    terminalSettings={terminalSettings}
                    themeMode={themeMode}
                  />
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div className={`border-t px-4 py-1.5 text-[11px] font-mono flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#0e121c] border-[#20293d] text-slate-400'
            }`}>
              <div className="flex items-center gap-3">
                <span>Linhas: <span className={isLight ? 'text-slate-900 font-bold' : 'text-slate-200'}>{lineCount}</span> | Caracteres: <span className={isLight ? 'text-slate-900 font-bold' : 'text-slate-200'}>{charCount}</span></span>
                <span className="text-slate-400">|</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>.gugacode/backups {lastBackupTime ? `(Último: ${lastBackupTime})` : '(Ativo)'}</span>
                </span>
              </div>
              <div className="text-emerald-600 dark:text-red-400 font-bold flex items-center gap-1">
                <Code2 className="w-3 h-3" />
                <span>GugaCode Workspace Engine {splitMode !== 'single' && '(Split Active)'}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Code2 className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-slate-200 font-semibold text-sm mb-1 font-mono">
              Nenhum arquivo selecionado
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Clique em um arquivo na barra lateral para visualizar e editar o código do seu projeto Nobara Linux.
            </p>
          </div>
        )}
      </div>

      <BackupsModal
        isOpen={isBackupsModalOpen}
        onClose={() => setIsBackupsModalOpen(false)}
        activeFile={activeFile}
        language={language}
        onRestoreSuccess={(filePath, restoredContent) => {
          if (activeFile && activeFile.path === filePath) {
            setFileContent(restoredContent);
          }
          onSaveFile(filePath, restoredContent);
        }}
      />
    </div>
  );
};
