import React, { useState, useEffect } from 'react';
import { 
  History, 
  RotateCcw, 
  X, 
  FileCode, 
  CheckCircle, 
  Clock, 
  HardDrive,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { FileBackup, ProjectFile } from '../types';
import { OllamaService } from '../services/ollamaService';
import { Language, t } from '../i18n';

interface BackupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: ProjectFile | null;
  language?: Language;
  onRestoreSuccess?: (filePath: string, restoredContent: string) => void;
}

export const BackupsModal: React.FC<BackupsModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  language = 'pt-BR',
  onRestoreSuccess
}) => {
  const [backups, setBackups] = useState<FileBackup[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<FileBackup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [restoredMsg, setRestoredMsg] = useState<string | null>(null);
  const [filterCurrentOnly, setFilterCurrentOnly] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen, activeFile, filterCurrentOnly]);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const filePathFilter = (filterCurrentOnly && activeFile) ? activeFile.path : undefined;
      const res = await OllamaService.fetchBackups(filePathFilter);
      if (res && res.backups) {
        setBackups(res.backups);
        if (res.backups.length > 0) {
          setSelectedBackup(res.backups[0]);
        } else {
          setSelectedBackup(null);
        }
      }
    } catch (e) {
      console.error('Failed to load backups:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (backup: FileBackup) => {
    try {
      const res = await OllamaService.restoreBackup(backup.id);
      if (res && res.success) {
        setRestoredMsg(t(language, 'backupRestoredMsg'));
        if (onRestoreSuccess) {
          onRestoreSuccess(res.filePath, res.content);
        }
        setTimeout(() => setRestoredMsg(null), 3000);
      }
    } catch (e) {
      console.error('Failed to restore backup:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1420] border border-[#232d42] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#141b2a] border-b border-[#232d42] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/80 border border-red-800/80 rounded-xl text-red-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                {t(language, 'autoSaveBackupsTitle')}
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Auto-Recovery
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                {language === 'en' 
                  ? 'Historical snapshots automatically saved to .gugacode/backups/' 
                  : 'Cópias de segurança registradas automaticamente no diretório oculto .gugacode/backups/'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-[#1a2336] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#121826] border-b border-[#232d42] px-6 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={filterCurrentOnly}
                onChange={(e) => setFilterCurrentOnly(e.target.checked)}
                className="rounded bg-[#1a2233] border-[#2c3a56] text-red-600 focus:ring-0"
              />
              <span>
                {language === 'en' ? 'Only show current file backups' : 'Filtrar apenas arquivo ativo'}
                {activeFile ? ` (${activeFile.name})` : ''}
              </span>
            </label>
          </div>

          <div className="text-slate-400 text-[11px] flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-red-400" />
            <span>Total: {backups.length} snapshots</span>
          </div>
        </div>

        {restoredMsg && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-200 px-6 py-2 text-xs flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{restoredMsg}</span>
          </div>
        )}

        {/* Modal Body Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Snapshots List */}
          <div className="w-80 border-r border-[#232d42] bg-[#0c101a] overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-400 font-mono">
                {language === 'en' ? 'Loading backups...' : 'Carregando cópias de backup...'}
              </div>
            ) : backups.length === 0 ? (
              <div className="p-6 text-center text-slate-400 font-mono space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">{t(language, 'noBackupsYet')}</p>
              </div>
            ) : (
              backups.map((item) => {
                const isSelected = selectedBackup?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBackup(item)}
                    className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-950/70 border-red-700/80 text-white shadow-md'
                        : 'bg-[#131928] border-[#222d42] text-slate-300 hover:bg-[#192135] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                        <FileCode className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{item.fileName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 truncate mb-1">
                      {item.filePath}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{(item.size / 1024).toFixed(1)} KB</span>
                      {isSelected && (
                        <span className="text-red-400 font-bold">● Selecionado</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Code Preview & Restore Action */}
          <div className="flex-1 flex flex-col bg-[#0d111a] overflow-hidden">
            {selectedBackup ? (
              <>
                <div className="p-3 bg-[#131929] border-b border-[#232d42] flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-slate-200 truncate">
                      {selectedBackup.filePath} ({selectedBackup.timestamp})
                    </span>
                  </div>

                  <button
                    onClick={() => handleRestore(selectedBackup)}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-red-950/60"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{language === 'en' ? 'Restore This Snapshot' : 'Restaurar Este Backup'}</span>
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-auto font-mono text-xs bg-[#090c13] text-slate-200 leading-relaxed">
                  <pre className="whitespace-pre-wrap">{selectedBackup.content}</pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono">
                <History className="w-12 h-12 text-slate-700 mb-2" />
                <p>{language === 'en' ? 'Select a backup snapshot on the left' : 'Selecione uma cópia de backup à esquerda'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#131929] border-t border-[#232d42] px-6 py-3 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">.gugacode/backups Engine — GugaCode Linux IDE</span>
          <button
            onClick={onClose}
            className="bg-[#1e273a] hover:bg-[#28344d] text-slate-200 px-4 py-1.5 rounded-xl transition-colors"
          >
            {t(language, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
