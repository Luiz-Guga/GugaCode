import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Terminal, 
  FileCode, 
  Sparkles, 
  Package, 
  Cpu, 
  Github, 
  Box, 
  Settings, 
  BookOpen, 
  Globe, 
  Moon, 
  Sun,
  Command,
  ArrowRight,
  Code2,
  Trash2,
  Keyboard
} from 'lucide-react';
import { ProjectFile } from '../types';
import { Language, t } from '../i18n';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  projectFiles: ProjectFile[];
  onSelectFile: (file: ProjectFile) => void;
  onSelectView: (view: 'agent' | 'workspace' | 'terminal') => void;
  onOpenPackageManager: () => void;
  onOpenSystemMonitor: () => void;
  onOpenGitHubModal: () => void;
  onOpenModelsModal: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onExecuteCommand: (cmd: string) => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onClearTerminalLogs: () => void;
  themeMode?: string;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'action' | 'file' | 'command';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  language,
  projectFiles,
  onSelectFile,
  onSelectView,
  onOpenPackageManager,
  onOpenSystemMonitor,
  onOpenGitHubModal,
  onOpenModelsModal,
  onOpenSettings,
  onOpenTutorial,
  onExecuteCommand,
  onToggleTheme,
  onToggleLanguage,
  onClearTerminalLogs,
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Flatten project files recursively for search
  const getAllFiles = (files: ProjectFile[]): ProjectFile[] => {
    let result: ProjectFile[] = [];
    for (const f of files) {
      if (f.type === 'file') {
        result.push(f);
      }
      if (f.children && f.children.length > 0) {
        result = result.concat(getAllFiles(f.children));
      }
    }
    return result;
  };

  const flatFiles = getAllFiles(projectFiles);

  // Define built-in items
  const items: CommandItem[] = [
    // Views
    {
      id: 'view-agent',
      title: t(language, 'cmdViewAgent'),
      category: 'action',
      icon: <Sparkles className="w-4 h-4 text-red-400" />,
      shortcut: 'Ctrl+J',
      action: () => { onSelectView('agent'); onClose(); }
    },
    {
      id: 'view-workspace',
      title: t(language, 'cmdViewWorkspace'),
      category: 'action',
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
      shortcut: 'Ctrl+J',
      action: () => { onSelectView('workspace'); onClose(); }
    },
    {
      id: 'view-terminal',
      title: t(language, 'cmdViewTerminal'),
      category: 'action',
      icon: <Terminal className="w-4 h-4 text-green-400" />,
      shortcut: 'Ctrl+J',
      action: () => { onSelectView('terminal'); onClose(); }
    },
    // Modals
    {
      id: 'open-packages',
      title: t(language, 'cmdOpenPackages'),
      category: 'action',
      icon: <Package className="w-4 h-4 text-cyan-400" />,
      shortcut: 'Ctrl+Shift+P',
      action: () => { onOpenPackageManager(); onClose(); }
    },
    {
      id: 'open-monitor',
      title: t(language, 'cmdOpenMonitor'),
      category: 'action',
      icon: <Cpu className="w-4 h-4 text-red-400" />,
      action: () => { onOpenSystemMonitor(); onClose(); }
    },
    {
      id: 'open-github',
      title: t(language, 'cmdOpenGitHub'),
      category: 'action',
      icon: <Github className="w-4 h-4 text-slate-200" />,
      action: () => { onOpenGitHubModal(); onClose(); }
    },
    {
      id: 'open-models',
      title: t(language, 'cmdOpenModels'),
      category: 'action',
      icon: <Box className="w-4 h-4 text-amber-400" />,
      action: () => { onOpenModelsModal(); onClose(); }
    },
    {
      id: 'open-settings',
      title: t(language, 'cmdOpenSettings'),
      category: 'action',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      shortcut: 'Ctrl+,',
      action: () => { onOpenSettings(); onClose(); }
    },
    {
      id: 'open-tutorial',
      title: t(language, 'cmdOpenTutorial'),
      category: 'action',
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      action: () => { onOpenTutorial(); onClose(); }
    },
    // Quick Actions
    {
      id: 'toggle-theme',
      title: t(language, 'cmdToggleTheme'),
      category: 'action',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      action: () => { onToggleTheme(); onClose(); }
    },
    {
      id: 'toggle-lang',
      title: t(language, 'cmdToggleLang'),
      category: 'action',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      action: () => { onToggleLanguage(); onClose(); }
    },
    {
      id: 'clear-terminal',
      title: t(language, 'cmdClearTerminal'),
      category: 'action',
      icon: <Trash2 className="w-4 h-4 text-red-400" />,
      action: () => { onClearTerminalLogs(); onClose(); }
    },
    // System Linux Commands
    {
      id: 'cmd-nobara-sync',
      title: t(language, 'cmdExecNobaraSync'),
      category: 'command',
      icon: <Terminal className="w-4 h-4 text-red-400" />,
      action: () => { onExecuteCommand('nobara-sync'); onClose(); }
    },
    {
      id: 'cmd-dnf-check',
      title: t(language, 'cmdExecDnfCheck'),
      category: 'command',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      action: () => { onExecuteCommand('dnf check-update'); onClose(); }
    },
    {
      id: 'cmd-git-status',
      title: t(language, 'cmdExecGitStatus'),
      category: 'command',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      action: () => { onExecuteCommand('git status'); onClose(); }
    },
    // Project Files
    ...flatFiles.map((file) => ({
      id: `file-${file.path}`,
      title: `${file.name}  (${file.path.replace(/^\/workspace\/?/, '')})`,
      category: 'file' as const,
      icon: <FileCode className="w-4 h-4 text-red-400" />,
      action: () => {
        onSelectFile(file);
        onSelectView('workspace');
        onClose();
      }
    }))
  ];

  // Filter items based on user search query
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150">
      <div 
        className={`border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] ${
          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0f1420] border-[#232d42] text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className={`border-b p-4 flex items-center gap-3 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141b2b] border-[#222d43]'
        }`}>
          <Search className={`w-5 h-5 shrink-0 ${isLight ? 'text-emerald-600' : 'text-red-400'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t(language, 'cmdPaletteSearchPlaceholder')}
            className={`w-full bg-transparent focus:outline-none font-mono text-sm ${
              isLight ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-500'
            }`}
          />
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#1f2a40]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Filtered Items */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 font-mono text-xs">
          {filteredItems.length === 0 ? (
            <div className={`p-8 text-center ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Nenhum resultado encontrado para "<span className={isLight ? 'text-slate-800 font-bold' : 'text-slate-300'}>{query}</span>"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold'
                        : 'bg-red-950/70 border border-red-700/60 text-white'
                      : isLight
                        ? 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        : 'hover:bg-[#161f30] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.shortcut && (
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] ${
                        isLight ? 'bg-slate-200 border-slate-300 text-slate-700 font-semibold' : 'bg-[#101624] border-[#26334a] text-slate-400'
                      }`}>
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                      isSelected
                        ? isLight ? 'text-emerald-700 translate-x-0.5' : 'text-red-400 translate-x-0.5'
                        : 'text-slate-400'
                    }`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Shortcuts Legend Footer */}
        <div className={`border-t px-4 py-2 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#0b0e17] border-[#1a2336] text-slate-400'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Keyboard className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-red-400'}`} /> <kbd className={`px-1 rounded ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-[#161e30] text-slate-300'}`}>↑↓</kbd> Navegar</span>
            <span className="flex items-center gap-1"><kbd className={`px-1 rounded ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-[#161e30] text-slate-300'}`}>↵</kbd> Selecionar</span>
            <span className="flex items-center gap-1"><kbd className={`px-1 rounded ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-[#161e30] text-slate-300'}`}>ESC</kbd> Fechar</span>
          </div>
          <div>
            <kbd className={`px-1 rounded font-bold ${isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-[#161e30] text-red-400'}`}>Ctrl+P</kbd> Paleta
          </div>
        </div>
      </div>
    </div>
  );
};
