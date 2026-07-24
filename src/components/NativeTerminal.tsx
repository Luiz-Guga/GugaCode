import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  Copy, 
  Check, 
  CornerDownLeft,
  Download,
  FileText,
  FileCode,
  Share2,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { TerminalLog, TerminalAppearanceSettings } from '../types';
import { Language, t } from '../i18n';

interface NativeTerminalProps {
  logs: TerminalLog[];
  onExecuteCommand: (command: string) => void;
  onClearLogs: () => void;
  language?: Language;
  terminalSettings?: TerminalAppearanceSettings;
  themeMode?: string;
}

const getThemeStyles = (theme?: string, themeMode?: string) => {
  const activeTheme = (themeMode === 'light-fedora' && (!theme || theme === 'nobara-dark')) ? 'fedora-light' : (theme || (themeMode === 'light-fedora' ? 'fedora-light' : 'nobara-dark'));

  switch (activeTheme) {
    case 'dracula':
      return {
        bg: 'bg-[#282a36]',
        headerBg: 'bg-[#21222c]',
        headerBorder: 'border-[#44475a]',
        logBg: 'bg-[#1e1f29]',
        logBorder: 'border-[#44475a]',
        inputBg: 'bg-[#21222c]',
        inputBorder: 'border-[#44475a]',
        text: 'text-[#f8f8f2]',
        promptUser: 'text-[#50fa7b]',
        promptDir: 'text-[#bd93f9]',
        promptDollar: 'text-[#ff79c6]',
      };
    case 'nord':
      return {
        bg: 'bg-[#2e3440]',
        headerBg: 'bg-[#242933]',
        headerBorder: 'border-[#4c566a]',
        logBg: 'bg-[#3b4252]',
        logBorder: 'border-[#4c566a]',
        inputBg: 'bg-[#242933]',
        inputBorder: 'border-[#4c566a]',
        text: 'text-[#eceff4]',
        promptUser: 'text-[#a3be8c]',
        promptDir: 'text-[#88c0d0]',
        promptDollar: 'text-[#81a1c1]',
      };
    case 'solarized-dark':
      return {
        bg: 'bg-[#002b36]',
        headerBg: 'bg-[#073642]',
        headerBorder: 'border-[#0f4e5e]',
        logBg: 'bg-[#073642]',
        logBorder: 'border-[#0f4e5e]',
        inputBg: 'bg-[#002b36]',
        inputBorder: 'border-[#0f4e5e]',
        text: 'text-[#839496]',
        promptUser: 'text-[#859900]',
        promptDir: 'text-[#268bd2]',
        promptDollar: 'text-[#b58900]',
      };
    case 'monokai':
      return {
        bg: 'bg-[#272822]',
        headerBg: 'bg-[#1e1f1c]',
        headerBorder: 'border-[#3e3d32]',
        logBg: 'bg-[#1e1f1c]',
        logBorder: 'border-[#3e3d32]',
        inputBg: 'bg-[#1e1f1c]',
        inputBorder: 'border-[#3e3d32]',
        text: 'text-[#f8f8f2]',
        promptUser: 'text-[#a6e22e]',
        promptDir: 'text-[#66d9ef]',
        promptDollar: 'text-[#f92672]',
      };
    case 'fedora-light':
      return {
        bg: 'bg-[#f8fafc]',
        headerBg: 'bg-[#e2e8f0]',
        headerBorder: 'border-[#cbd5e1]',
        logBg: 'bg-[#ffffff]',
        logBorder: 'border-[#e2e8f0]',
        inputBg: 'bg-[#f1f5f9]',
        inputBorder: 'border-[#cbd5e1]',
        text: 'text-slate-900',
        promptUser: 'text-blue-600',
        promptDir: 'text-cyan-600',
        promptDollar: 'text-red-600',
      };
    case 'nobara-dark':
    default:
      return {
        bg: 'bg-[#090c12]',
        headerBg: 'bg-[#101522]',
        headerBorder: 'border-[#212b3e]',
        logBg: 'bg-[#0e121a]',
        logBorder: 'border-[#1b2333]',
        inputBg: 'bg-[#0c1018]',
        inputBorder: 'border-[#1e2738]',
        text: 'text-slate-100',
        promptUser: 'text-emerald-400',
        promptDir: 'text-cyan-400',
        promptDollar: 'text-red-400',
      };
  }
};

export const NativeTerminal: React.FC<NativeTerminalProps> = ({
  logs,
  onExecuteCommand,
  onClearLogs,
  language = 'pt-BR',
  terminalSettings,
  themeMode = 'dark-nobara',
}) => {
  const [inputCmd, setInputCmd] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fontFam = terminalSettings?.fontFamily || "'JetBrains Mono', monospace";
  const fontSize = terminalSettings?.fontSize || 12;
  const themeStyle = getThemeStyles(terminalSettings?.theme, themeMode);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;
    onExecuteCommand(inputCmd);
    setInputCmd('');
  };

  const copyLog = (output: string, id: string) => {
    navigator.clipboard.writeText(output);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showNotification = (msg: string) => {
    setExportFeedback(msg);
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const generateMarkdownLogs = () => {
    const dateStr = new Date().toLocaleString();
    let md = `# GugaCode Terminal Logs Report\n\n`;
    md += `**Environment:** Nobara / Fedora Linux (Kernel 6.13.2-fsync)\n`;
    md += `**Date:** ${dateStr}\n`;
    md += `**Total Commands Recorded:** ${logs.length}\n\n`;
    md += `---\n\n`;

    if (logs.length === 0) {
      md += `*No terminal logs recorded yet.*\n`;
      return md;
    }

    logs.forEach((log, index) => {
      md += `### ${index + 1}. \`${log.command}\`\n`;
      md += `- **Time:** \`${log.timestamp}\`\n`;
      md += `- **Directory:** \`${log.cwd}\`\n\n`;
      md += `\`\`\`bash\n${log.output || '(No output produced)'}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });

    return md;
  };

  const generateTextLogs = () => {
    const dateStr = new Date().toLocaleString();
    let txt = `===================================================================\n`;
    txt += `GugaCode Terminal Logs - Nobara & Fedora Linux Workstation\n`;
    txt += `Generated: ${dateStr}\n`;
    txt += `Total Commands: ${logs.length}\n`;
    txt += `===================================================================\n\n`;

    if (logs.length === 0) {
      txt += `(No terminal logs recorded yet)\n`;
      return txt;
    }

    logs.forEach((log, index) => {
      txt += `[${log.timestamp}] nobara@workstation:${log.cwd} $ ${log.command}\n`;
      txt += `-------------------------------------------------------------------\n`;
      txt += `${log.output || '(No output produced)'}\n\n`;
    });

    return txt;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdownLogs();
    const filename = `gugacode-terminal-logs-${new Date().toISOString().slice(0, 10)}.md`;
    downloadFile(md, filename, 'text/markdown;charset=utf-8');
    setIsExportMenuOpen(false);
    showNotification(t(language, 'logsExportedMsg'));
  };

  const handleExportText = () => {
    const txt = generateTextLogs();
    const filename = `gugacode-terminal-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    downloadFile(txt, filename, 'text/plain;charset=utf-8');
    setIsExportMenuOpen(false);
    showNotification(t(language, 'logsExportedMsg'));
  };

  const handleCopyAllLogs = () => {
    const md = generateMarkdownLogs();
    navigator.clipboard.writeText(md);
    setIsExportMenuOpen(false);
    showNotification(language === 'en' ? 'All logs copied to clipboard!' : 'Todos os logs copiados para a área de transferência!');
  };

  return (
    <div 
      className={`flex flex-col h-full w-full ${themeStyle.bg} ${themeStyle.text} font-mono overflow-hidden relative transition-colors duration-200`}
      style={{ fontFamily: fontFam }}
    >
      {/* Terminal Header Bar */}
      <div className={`${themeStyle.headerBg} border-b ${themeStyle.headerBorder} px-4 py-2 flex items-center justify-between text-xs select-none z-20`}>
        <div className="flex items-center gap-2">
          {/* Linux Window Control Circles */}
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          <TerminalIcon className="w-4 h-4 text-red-400" />
          <span className="font-bold">
            guga@nobara-fedora: ~/projects (bash)
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-80">
          <span className="hidden sm:inline-block text-[11px] bg-black/20 border border-current/20 px-2 py-0.5 rounded">
            Nobara & Fedora Linux Kernel 6.13.2-fsync
          </span>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="bg-[#182133] hover:bg-red-950/80 hover:text-white border border-[#2d3e61] text-amber-300 px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5"
              title="Exportar logs do terminal para compartilhar com a comunidade"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(language, 'exportLogsBtn')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-[#121826] border border-[#283858] rounded-xl shadow-2xl py-1 z-30 font-mono text-xs text-slate-200">
                <button
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-3 py-2 hover:bg-[#1c263c] hover:text-white flex items-center gap-2 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>{t(language, 'exportAsMd')}</span>
                </button>
                <button
                  onClick={handleExportText}
                  className="w-full text-left px-3 py-2 hover:bg-[#1c263c] hover:text-white flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{t(language, 'exportAsTxt')}</span>
                </button>
                <div className="border-t border-[#232f48] my-1" />
                <button
                  onClick={handleCopyAllLogs}
                  className="w-full text-left px-3 py-2 hover:bg-[#1c263c] hover:text-white flex items-center gap-2 transition-colors text-amber-300"
                >
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>{t(language, 'copyAllLogs')}</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClearLogs}
            title="Limpar logs do terminal"
            className="hover:text-red-400 p-1.5 hover:bg-black/20 rounded transition-colors ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Export Feedback Toast Notification */}
      {exportFeedback && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-200 px-4 py-2 text-xs flex items-center gap-2 font-mono animate-fadeIn z-10">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Preset Quick Commands Ribbon */}
      <div className={`${themeStyle.headerBg} border-b ${themeStyle.headerBorder} px-3 py-1.5 flex items-center gap-2 overflow-x-auto text-xs opacity-90`}>
        <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0 opacity-60">
          Atalhos Nobara:
        </span>
        {[
          { label: 'fastfetch', cmd: 'fastfetch' },
          { label: 'nobara-sync', cmd: 'nobara-sync' },
          { label: 'ollama ps', cmd: 'ollama ps' },
          { label: 'cargo run', cmd: 'cargo run' },
          { label: 'git status', cmd: 'git status' },
          { label: 'python3 main.py', cmd: 'python3 main.py' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => onExecuteCommand(item.cmd)}
            className="bg-black/20 hover:bg-red-950/80 border border-current/20 hover:border-red-600 px-2.5 py-1 rounded text-xs transition-all shrink-0 font-mono flex items-center gap-1"
          >
            <Play className="w-3 h-3 text-red-400" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal Body Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 selection:bg-red-900/60 selection:text-white">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-2 py-12">
            <TerminalIcon className="w-10 h-10 opacity-40" />
            <p className="text-xs">Nenhum log gravado no terminal ainda.</p>
            <p className="text-[11px] opacity-70">Execute comandos abaixo ou utilize os atalhos rápidos do Nobara Linux.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`${themeStyle.logBg} border ${themeStyle.logBorder} rounded-lg p-3 space-y-2 shadow-sm`}>
              {/* Command Header */}
              <div className="flex items-center justify-between border-b border-current/10 pb-1.5">
                <div className="flex items-center gap-2 font-mono" style={{ fontSize: `${fontSize}px` }}>
                  <span className={`${themeStyle.promptUser} font-bold`}>nobara@workstation</span>
                  <span className="opacity-50">:</span>
                  <span className={`${themeStyle.promptDir} font-semibold`}>{log.cwd}</span>
                  <span className={`${themeStyle.promptDollar} font-bold`}>$</span>
                  <span className="font-bold">{log.command}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] opacity-50">{log.timestamp}</span>
                  <button
                    onClick={() => copyLog(log.output, log.id)}
                    title="Copiar saída do comando"
                    className="hover:opacity-100 opacity-60 transition-colors p-1 hover:bg-black/20 rounded"
                  >
                    {copiedId === log.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Output Display */}
              <pre className="font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto opacity-90" style={{ fontSize: `${fontSize}px` }}>
                {log.output}
              </pre>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Interactive Command Input Form */}
      <form onSubmit={handleSubmit} className={`${themeStyle.inputBg} border-t ${themeStyle.inputBorder} p-3 flex items-center gap-2`}>
        <div className="flex items-center gap-1.5 text-xs shrink-0 select-none" style={{ fontSize: `${fontSize}px` }}>
          <span className={`${themeStyle.promptUser} font-bold`}>nobara@workstation</span>
          <span className={`${themeStyle.promptDollar} font-bold`}>$</span>
        </div>

        <input
          type="text"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          placeholder="Digite um comando bash no Nobara (Ex: cargo check, nobara-sync, ollama list)..."
          className="flex-1 bg-transparent border-none font-mono focus:outline-none placeholder:opacity-40"
          style={{ fontSize: `${fontSize}px` }}
        />

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow shrink-0"
        >
          <span>Executar</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
