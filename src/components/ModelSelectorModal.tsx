import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Box, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  HardDrive, 
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { OllamaModel } from '../types';
import { AVAILABLE_MODELS_TO_PULL } from '../constants';

interface ModelSelectorModalProps {
  isOpen: boolean;
  models: OllamaModel[];
  selectedModel: string;
  ollamaHost: string;
  onClose: () => void;
  onSelectModel: (modelName: string) => void;
  onPullModel: (modelName: string) => void;
  onTestConnection: () => void;
  themeMode?: string;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  models,
  selectedModel,
  ollamaHost,
  onClose,
  onSelectModel,
  onPullModel,
  onTestConnection,
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [customModelInput, setCustomModelInput] = useState('');

  if (!isOpen) return null;

  const handlePull = (name: string) => {
    setPullingModel(name);
    setPullProgress(10);
    const interval = setInterval(() => {
      setPullProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPullingModel(null);
          onPullModel(name);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#101522] border-[#232f48] text-slate-100'
      }`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Gerenciador de Modelos Ollama
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Alocação de VRAM e seleção de modelos no Nobara Linux
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Host Endpoint Bar */}
          <div className="bg-[#172033] border border-[#2a3854] p-3.5 rounded-xl flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400">Ollama Host: </span>
              <span className="text-red-400 font-bold">{ollamaHost}</span>
            </div>
            <button
              onClick={onTestConnection}
              className="flex items-center gap-1.5 bg-[#202c46] hover:bg-[#2a3a5c] text-slate-200 px-3 py-1 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span>Testar Conexão</span>
            </button>
          </div>

          {/* Installed Models List */}
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Modelos Locais Instalados ({models.length})</span>
              <span className="text-[10px] text-emerald-400 font-normal">
                Prontos para aceleração GPU ROCm/CUDA
              </span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {models.map((m) => {
                const isSelected = selectedModel === m.name;
                const sizeGB = m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) : '3.8';
                return (
                  <div
                    key={m.name}
                    onClick={() => {
                      onSelectModel(m.name);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer font-mono ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-950/50'
                        : 'bg-[#141b2b] border-[#25324c] hover:border-slate-500 hover:bg-[#1b2438]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {m.name}
                        </span>
                        {m.isRecommended && (
                          <span className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded-full font-sans border border-red-700/50">
                            Recomendado p/ Nobara
                          </span>
                        )}
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Ativo
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 hover:text-white">
                          Selecionar
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-sans mb-3">
                      {m.description || 'Modelo de codificação e raciocínio local.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="bg-[#1c273e] px-2 py-0.5 rounded text-slate-300">
                        💾 {sizeGB} GB VRAM
                      </span>
                      {m.details?.parameter_size && (
                        <span className="bg-[#1c273e] px-2 py-0.5 rounded text-slate-300">
                          🧠 {m.details.parameter_size}
                        </span>
                      )}
                      {m.details?.quantization_level && (
                        <span className="bg-[#1c273e] px-2 py-0.5 rounded text-slate-300">
                          ⚡ {m.details.quantization_level}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pull New Models Section */}
          <div className="pt-4 border-t border-[#232f48]">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-3">
              Baixar Novos Modelos da Ollama Library
            </h3>

            {/* Custom Pull Bar */}
            <div className="bg-[#151d2f] border border-[#273654] p-3 rounded-xl mb-4">
              <div className="text-xs font-mono text-slate-300 mb-2 font-semibold flex items-center justify-between">
                <span>Instalar Modelo Customizado (ollama pull &lt;nome&gt;)</span>
                <a
                  href="https://ollama.com/library"
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-400 hover:underline text-[11px] flex items-center gap-1"
                >
                  <span>Explorar Biblioteca Ollama</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => setCustomModelInput(e.target.value)}
                  placeholder="Ex: codestral:22b, deepseek-r1:8b, mistral-nemo, starcoder2:15b"
                  className="flex-1 bg-[#0e1320] border border-[#25324c] focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none"
                />
                <button
                  id="pull-custom-model-btn"
                  onClick={() => {
                    if (!customModelInput.trim()) return;
                    handlePull(customModelInput.trim());
                    setCustomModelInput('');
                  }}
                  disabled={!customModelInput.trim() || pullingModel !== null}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar</span>
                </button>
              </div>
            </div>

            {pullingModel && (
              <div className="mb-4 bg-[#141d2f] border border-red-900/50 p-3 rounded-xl">
                <div className="flex items-center justify-between text-xs font-mono text-red-300 mb-1">
                  <span>Baixando modelo '{pullingModel}' do registro Ollama...</span>
                  <span>{pullProgress}%</span>
                </div>
                <div className="w-full bg-[#1b253b] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${pullProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {AVAILABLE_MODELS_TO_PULL.map((item) => (
                <div
                  key={item.name}
                  className="bg-[#131928] border border-[#232d43] p-3.5 rounded-xl flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{item.name}</div>
                    <div className="text-slate-400 font-sans text-xs mt-0.5">{item.desc}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Tamanho aproximado: {item.size}</div>
                  </div>

                  <button
                    onClick={() => handlePull(item.name)}
                    disabled={pullingModel === item.name}
                    className="bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{pullingModel === item.name ? `Baixando ${pullProgress}%` : 'Baixar'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
