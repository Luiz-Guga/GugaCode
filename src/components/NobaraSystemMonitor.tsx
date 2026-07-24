import React from 'react';
import { X, Cpu, HardDrive, Zap, Layers, RefreshCcw, Database } from 'lucide-react';
import { SystemStats } from '../types';

interface NobaraSystemMonitorProps {
  isOpen: boolean;
  stats: SystemStats;
  onClose: () => void;
  onRefresh: () => void;
  themeMode?: string;
}

export const NobaraSystemMonitor: React.FC<NobaraSystemMonitorProps> = ({
  isOpen,
  stats,
  onClose,
  onRefresh,
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  if (!isOpen) return null;

  const diskUsed = stats.diskUsedGB ?? 184.2;
  const diskTotal = stats.diskTotalGB ?? 500.0;
  const diskPct = stats.diskUsagePercent ?? Math.round((diskUsed / diskTotal) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono text-xs ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#101522] border-[#232f48] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Monitor de Hardware - Nobara & Fedora Linux
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Desempenho de GPU, Armazenamento NVMe/SSD, RAM e CPU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 transition-colors rounded-lg ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Stats Cards */}
        <div className={`p-6 space-y-4 max-h-[80vh] overflow-y-auto ${isLight ? 'bg-slate-50' : ''}`}>
          {/* System Spec Header Box */}
          <div className={`p-4 rounded-xl space-y-2 border ${
            isLight ? 'bg-white border-slate-300' : 'bg-[#161f30] border-[#263552]'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.osName}</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded font-bold">
                Gaming & Workstation
              </span>
            </div>
            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{stats.kernel}</div>
            <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{stats.cpuModel}</div>
          </div>

          {/* CPU Progress Bar */}
          <div className={`p-4 rounded-xl space-y-2 border ${
            isLight ? 'bg-white border-slate-300' : 'bg-[#131928] border-[#232d43]'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                <Cpu className="w-4 h-4 text-emerald-500" />
                Uso de CPU
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.cpuUsage}%</span>
            </div>
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1e283d]'}`}>
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.cpuUsage}%` }}
              />
            </div>
          </div>

          {/* GPU & VRAM Box */}
          <div className={`p-4 rounded-xl space-y-2 border ${
            isLight ? 'bg-white border-slate-300' : 'bg-[#131928] border-[#232d43]'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                <Zap className="w-4 h-4 text-amber-500" />
                GPU VRAM (Ollama Acceleration)
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {stats.vramUsedGB} / {stats.vramTotalGB} GB
              </span>
            </div>
            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{stats.gpuModel}</div>
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1e283d]'}`}>
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(stats.vramUsedGB / stats.vramTotalGB) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 pt-1 flex items-center justify-between font-bold">
              <span>Alocação Ollama: ~{stats.ollamaVramUsageGB} GB</span>
              <span>ROCm / CUDA Active</span>
            </div>
          </div>

          {/* RAM Progress Bar */}
          <div className={`p-4 rounded-xl space-y-2 border ${
            isLight ? 'bg-white border-slate-300' : 'bg-[#131928] border-[#232d43]'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                <HardDrive className="w-4 h-4 text-cyan-500" />
                Memória RAM
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                {stats.ramUsedGB} / {stats.ramTotalGB} GB
              </span>
            </div>
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1e283d]'}`}>
              <div
                className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(stats.ramUsedGB / stats.ramTotalGB) * 100}%` }}
              />
            </div>
          </div>

          {/* Disk Usage Progress Bar */}
          <div className={`p-4 rounded-xl space-y-2 border ${
            isLight ? 'bg-white border-slate-300' : 'bg-[#131928] border-[#232d43]'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                <Database className="w-4 h-4 text-purple-500" />
                Espaço em Disco NVMe/SSD (/home/nobara)
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {diskUsed} / {diskTotal} GB ({diskPct}%)
              </span>
            </div>
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1e283d]'}`}>
              <div
                className="bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${diskPct}%` }}
              />
            </div>
            <div className={`text-[10px] pt-1 flex items-center justify-between font-mono ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span>Subvolume Btrfs • PCIe 4.0 NVMe</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Leitura: ~5200 MB/s</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <button
            onClick={onRefresh}
            className={`flex items-center gap-1.5 transition-colors font-bold ${
              isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
            }`}
          >
            <RefreshCcw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Atualizar Métricas</span>
          </button>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-bold shadow-md shadow-emerald-950/20"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
