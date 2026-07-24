import React from 'react';
import { X, FileCode, Check, ArrowRight } from 'lucide-react';
import { FileEditProposal } from '../types';

interface DiffViewerModalProps {
  proposal: FileEditProposal | null;
  onClose: () => void;
  onApply: (proposal: FileEditProposal) => void;
  themeMode?: string;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  proposal,
  onClose,
  onApply,
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  if (!proposal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#101522] border-[#232f48] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Comparação de Código (Git Diff)
              </h2>
              <p className={`text-xs font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {proposal.filePath} — {proposal.summary}
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

        {/* Diff Comparison View */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isLight ? 'bg-slate-50' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Old Version */}
            <div className={`border rounded-xl p-3 overflow-x-auto ${
              isLight ? 'bg-red-50 border-red-200' : 'bg-[#141012] border-red-900/50'
            }`}>
              <div className={`font-bold mb-2 pb-1 border-b flex items-center justify-between ${
                isLight ? 'text-red-800 border-red-200' : 'text-red-400 border-red-950'
              }`}>
                <span>Versão Atual (Antes)</span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded text-red-800 dark:text-red-300 font-bold">- Remover</span>
              </div>
              <pre className={`leading-relaxed font-mono whitespace-pre-wrap ${
                isLight ? 'text-red-900' : 'text-red-300/80'
              }`}>
                {proposal.oldContent || "// Código original"}
              </pre>
            </div>

            {/* New Version */}
            <div className={`border rounded-xl p-3 overflow-x-auto ${
              isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#0f1712] border-emerald-900/50'
            }`}>
              <div className={`font-bold mb-2 pb-1 border-b flex items-center justify-between ${
                isLight ? 'text-emerald-800 border-emerald-200' : 'text-emerald-400 border-emerald-950'
              }`}>
                <span>Proposta da IA (Depois)</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-bold">+ Adicionar</span>
              </div>
              <pre className={`leading-relaxed font-mono whitespace-pre-wrap ${
                isLight ? 'text-emerald-900' : 'text-emerald-300'
              }`}>
                {proposal.newContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-3 border-t flex items-center justify-end gap-3 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onApply(proposal);
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Alteração no Arquivo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
