import React, { useState } from 'react';
import { X, Settings, Server, Thermometer, Sliders, Sparkles, Key, Volume2, Cpu, Globe, Sun, Palette, Terminal, Type } from 'lucide-react';
import { AppConfig, LLMProvider, TerminalTheme, TerminalAppearanceSettings } from '../types';
import { t } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  config: AppConfig;
  onClose: () => void;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'apikeys' | 'general' | 'aipersona' | 'appearance' | 'voice'>('apikeys');
  const lang = config.language || 'pt-BR';

  if (!isOpen) return null;

  const handleApiKeyChange = (keyName: keyof AppConfig['apiKeys'], value: string) => {
    onUpdateConfig({
      apiKeys: {
        ...config.apiKeys,
        [keyName]: value,
      },
    });
  };

  const handleApplyPresetInstruction = (presetText: string) => {
    onUpdateConfig({
      aiCustomInstructions: presetText
    });
  };

  const isLight = config.themeMode === 'light-fedora';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs border ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#101522] border-[#232f48] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {t(lang, 'settingsTitle')}
              </h2>
              <p className={`text-xs font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {t(lang, 'settingsSubtitle')}
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

        {/* Navigation Tabs */}
        <div className={`flex border-b overflow-x-auto scrollbar-none ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121827] border-[#232f48]'
        }`}>
          {[
            { id: 'apikeys', label: t(lang, 'tabApiKeys'), icon: <Key className="w-3.5 h-3.5" /> },
            { id: 'general', label: t(lang, 'tabOllama'), icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'aipersona', label: t(lang, 'tabAiPersona'), icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
            { id: 'appearance', label: t(lang, 'tabAppearance'), icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'voice', label: t(lang, 'tabVoice'), icon: <Volume2 className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 border-b-2 ${
                  active
                    ? isLight
                      ? 'bg-white text-emerald-600 border-emerald-500 shadow-sm'
                      : 'bg-[#182033] text-emerald-400 border-emerald-500'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 border-transparent'
                      : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className={`p-6 space-y-5 flex-1 overflow-y-auto ${
          isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#101522] text-slate-200'
        }`}>
          {activeTab === 'apikeys' && (
            <div className="space-y-4">
              {/* Active Provider Selector */}
              <div className="space-y-1.5 bg-[#151e30] p-3 rounded-xl border border-[#273859]">
                <label className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-red-400" />
                  {t(lang, 'activeProvider')}
                </label>
                <select
                  value={config.activeProvider}
                  onChange={(e) => onUpdateConfig({ activeProvider: e.target.value as LLMProvider })}
                  className="w-full bg-[#0d1320] border border-[#273550] text-slate-100 p-2 rounded-xl font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="ollama">Ollama (Local Nobara & Fedora)</option>
                  <option value="gemini">Google Gemini AI API</option>
                  <option value="openai">OpenAI (GPT-4o / O3-Mini)</option>
                  <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                  <option value="deepseek">DeepSeek (V3 / R1 Cloud)</option>
                  <option value="groq">Groq (Llama 3 High Speed)</option>
                  <option value="openrouter">OpenRouter (Unified API)</option>
                </select>
              </div>

              {/* Gemini API Key */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Google Gemini API Key:
                  </span>
                </label>
                <input
                  type="password"
                  value={config.apiKeys?.geminiApiKey || ''}
                  onChange={(e) => handleApiKeyChange('geminiApiKey', e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#151d2c] border border-[#273550] text-slate-100 p-2 rounded-xl font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  OpenAI API Key:
                </label>
                <input
                  type="password"
                  value={config.apiKeys?.openaiApiKey || ''}
                  onChange={(e) => handleApiKeyChange('openaiApiKey', e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-[#151d2c] border border-[#273550] text-slate-100 p-2 rounded-xl font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Anthropic API Key */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Anthropic API Key:
                </label>
                <input
                  type="password"
                  value={config.apiKeys?.anthropicApiKey || ''}
                  onChange={(e) => handleApiKeyChange('anthropicApiKey', e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-[#151d2c] border border-[#273550] text-slate-100 p-2 rounded-xl font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* DeepSeek API Key */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  DeepSeek API Key:
                </label>
                <input
                  type="password"
                  value={config.apiKeys?.deepseekApiKey || ''}
                  onChange={(e) => handleApiKeyChange('deepseekApiKey', e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-[#151d2c] border border-[#273550] text-slate-100 p-2 rounded-xl font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Ollama Host URL */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-red-400" />
                  Ollama Host Endpoint:
                </label>
                <input
                  type="text"
                  value={config.ollamaHost}
                  onChange={(e) => onUpdateConfig({ ollamaHost: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full bg-[#151d2c] border border-[#273550] text-slate-100 p-2.5 rounded-xl font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-amber-400" />
                    Temperatura:
                  </label>
                  <span className="text-amber-400 font-bold">{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => onUpdateConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Context Length */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Janela de Contexto (Tokens):
                </label>
                <select
                  value={config.contextLength}
                  onChange={(e) => onUpdateConfig({ contextLength: parseInt(e.target.value) })}
                  className="w-full bg-[#151d2c] border border-[#273550] text-slate-100 p-2.5 rounded-xl font-mono focus:outline-none focus:border-red-500"
                >
                  <option value={4096}>4,096 tokens</option>
                  <option value={8192}>8,192 tokens</option>
                  <option value={16384}>16,384 tokens</option>
                  <option value={32768}>32,768 tokens</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'aipersona' && (
            <div className="space-y-5">
              {/* Custom AI System Instructions */}
              <div className="space-y-2 bg-[#141c2e] border border-[#253654] p-4 rounded-xl">
                <label className="text-slate-100 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {t(lang, 'aiCustomInstructionsLabel')}
                  </span>
                </label>

                {/* Preset Quick Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetInstruction(lang === 'en' ? 'Always reply directly and concisely without fluff.' : 'Responda sempre de forma direta, objetiva e sem rodeios.')}
                    className="bg-[#1b263b] hover:bg-[#263756] border border-[#2e4268] text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors"
                  >
                    {t(lang, 'aiPresetFast')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetInstruction(lang === 'en' ? 'Explain concepts step by step with clear code comments and examples.' : 'Explique conceitos passo a passo com comentários claros e exemplos no código.')}
                    className="bg-[#1b263b] hover:bg-[#263756] border border-[#2e4268] text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors"
                  >
                    {t(lang, 'aiPresetEducational')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetInstruction(lang === 'en' ? 'Prefer production-ready, idiomatic Rust code with anyhow error handling for Linux.' : 'Prefira código Rust idiomático de produção com anyhow e tokio para Linux.')}
                    className="bg-[#1b263b] hover:bg-[#263756] border border-[#2e4268] text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors"
                  >
                    {t(lang, 'aiPresetRust')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetInstruction(lang === 'en' ? 'Write strict, clean TypeScript code with no explicit any types.' : 'Escreva código TypeScript estrito, limpo e sem tipos any explícitos.')}
                    className="bg-[#1b263b] hover:bg-[#263756] border border-[#2e4268] text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors"
                  >
                    {t(lang, 'aiPresetStrictTypes')}
                  </button>
                </div>

                <textarea
                  value={config.aiCustomInstructions || ''}
                  onChange={(e) => onUpdateConfig({ aiCustomInstructions: e.target.value })}
                  placeholder={t(lang, 'aiCustomInstructionsPlaceholder')}
                  rows={4}
                  className="w-full bg-[#0d1320] border border-[#273752] text-slate-100 p-3 rounded-xl font-mono text-xs focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Response & Coding Preferences */}
              <div className="space-y-3 bg-[#141c2e] border border-[#253654] p-4 rounded-xl font-mono">
                <div className="text-slate-100 font-bold flex items-center gap-2 mb-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  {t(lang, 'aiCodeStyleLabel')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Explanation Length */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">
                      {t(lang, 'aiExplanationLength')}
                    </label>
                    <select
                      value={config.aiPreferences?.explanationLength || 'balanced'}
                      onChange={(e) => onUpdateConfig({
                        aiPreferences: {
                          ...config.aiPreferences,
                          explanationLength: e.target.value as any
                        }
                      })}
                      className="w-full bg-[#0d1320] border border-[#273752] text-slate-100 p-2 rounded-lg text-xs"
                    >
                      <option value="brief">Direta & Sucinta</option>
                      <option value="balanced">Equilibrada</option>
                      <option value="step-by-step">Detalhada (Passo a Passo)</option>
                    </select>
                  </div>

                  {/* Comment Density */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">
                      {t(lang, 'aiCommentDensity')}
                    </label>
                    <select
                      value={config.aiPreferences?.commentDensity || 'minimal'}
                      onChange={(e) => onUpdateConfig({
                        aiPreferences: {
                          ...config.aiPreferences,
                          commentDensity: e.target.value as any
                        }
                      })}
                      className="w-full bg-[#0d1320] border border-[#273752] text-slate-100 p-2 rounded-lg text-xs"
                    >
                      <option value="none">Sem Comentários</option>
                      <option value="minimal">Mínimo (Apenas Lógica)</option>
                      <option value="thorough">Abundante / Explicativo</option>
                    </select>
                  </div>

                  {/* Code Style */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">
                      {t(lang, 'aiCodeStyle')}
                    </label>
                    <select
                      value={config.aiPreferences?.codeStyle || 'idiomatic'}
                      onChange={(e) => onUpdateConfig({
                        aiPreferences: {
                          ...config.aiPreferences,
                          codeStyle: e.target.value as any
                        }
                      })}
                      className="w-full bg-[#0d1320] border border-[#273752] text-slate-100 p-2 rounded-lg text-xs"
                    >
                      <option value="idiomatic">Idiomático / Produção</option>
                      <option value="concise">Ultra Conciso</option>
                      <option value="strict">Estrito & Seguro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Language Selector */}
              <div className="space-y-2 bg-[#141b29] border border-[#232f48] p-4 rounded-xl">
                <label className="text-slate-200 font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  {t(lang, 'langSelect')}
                </label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => onUpdateConfig({ language: 'pt-BR' })}
                    className={`p-3 rounded-xl border text-left font-mono font-bold flex items-center justify-between transition-all ${
                      lang === 'pt-BR'
                        ? 'bg-red-950/80 border-red-500 text-white shadow-md'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#0e1320] border-[#222d42] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🇧🇷 Português (pt-BR)</span>
                    {lang === 'pt-BR' && <span className="text-xs text-red-400 font-bold">Ativo</span>}
                  </button>

                  <button
                    onClick={() => onUpdateConfig({ language: 'en' })}
                    className={`p-3 rounded-xl border text-left font-mono font-bold flex items-center justify-between transition-all ${
                      lang === 'en'
                        ? 'bg-red-950/80 border-red-500 text-white shadow-md'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#0e1320] border-[#222d42] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🇺🇸 English (en-US)</span>
                    {lang === 'en' && <span className="text-xs text-red-400 font-bold">Active</span>}
                  </button>
                </div>
              </div>

              {/* Theme Mode Selector (Dark Nobara vs Light Fedora) */}
              <div className={`space-y-2 p-4 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#141b29] border-[#232f48]'
              }`}>
                <label className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  <Sun className="w-4 h-4 text-amber-500" />
                  {t(lang, 'themeSelect')}
                </label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => onUpdateConfig({ themeMode: 'dark-nobara' })}
                    className={`p-3 rounded-xl border text-left font-mono font-bold transition-all ${
                      config.themeMode !== 'light-fedora'
                        ? 'bg-gradient-to-r from-red-950/90 to-slate-900 border-red-500 text-white shadow-md'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#0e1320] border-[#222d42] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <span>{t(lang, 'themeDarkNobara')}</span>
                    </div>
                    <div className={`text-[10px] font-sans mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Visual escuro esportivo estilo Nobara Linux
                    </div>
                  </button>

                  <button
                    onClick={() => onUpdateConfig({ themeMode: 'light-fedora' })}
                    className={`p-3 rounded-xl border text-left font-mono font-bold transition-all ${
                      config.themeMode === 'light-fedora'
                        ? 'bg-gradient-to-r from-blue-100 to-white border-blue-500 text-slate-900 shadow-md'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#0e1320] border-[#222d42] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>{t(lang, 'themeLightFedora')}</span>
                    </div>
                    <div className={`text-[10px] font-sans mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Visual claro clean & minimalista estilo Fedora Light
                    </div>
                  </button>
                </div>
              </div>

              {/* Terminal Appearance Section */}
              <div className="space-y-4 bg-[#141b29] border border-[#232f48] p-4 rounded-xl font-mono">
                <div className="flex items-center justify-between border-b border-[#212d45] pb-2">
                  <label className="text-slate-200 font-bold flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-red-400" />
                    {t(lang, 'terminalAppearanceTitle')}
                  </label>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/80 px-2 py-0.5 rounded font-sans">
                    Native Linux Bash
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Font Family Selector */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-cyan-400" />
                      {t(lang, 'terminalFontFamily')}
                    </label>
                    <select
                      value={config.terminalSettings?.fontFamily || "'JetBrains Mono', monospace"}
                      onChange={(e) => onUpdateConfig({
                        terminalSettings: {
                          fontFamily: e.target.value,
                          fontSize: config.terminalSettings?.fontSize || 12,
                          theme: config.terminalSettings?.theme || 'nobara-dark',
                        }
                      })}
                      className="w-full bg-[#0d1320] border border-[#273550] text-slate-100 p-2 rounded-xl text-xs focus:outline-none focus:border-red-500 font-mono"
                    >
                      <option value="'JetBrains Mono', monospace">JetBrains Mono (Padrão)</option>
                      <option value="'Fira Code', monospace">Fira Code (com ligaduras)</option>
                      <option value="'Source Code Pro', monospace">Source Code Pro</option>
                      <option value="'Cascadia Code', monospace">Cascadia Code</option>
                      <option value="ui-monospace, monospace">System Monospace</option>
                    </select>
                  </div>

                  {/* Font Size Selector */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      {t(lang, 'terminalFontSize')}
                    </label>
                    <select
                      value={config.terminalSettings?.fontSize || 12}
                      onChange={(e) => onUpdateConfig({
                        terminalSettings: {
                          fontFamily: config.terminalSettings?.fontFamily || "'JetBrains Mono', monospace",
                          fontSize: Number(e.target.value),
                          theme: config.terminalSettings?.theme || 'nobara-dark',
                        }
                      })}
                      className="w-full bg-[#0d1320] border border-[#273550] text-slate-100 p-2 rounded-xl text-xs focus:outline-none focus:border-red-500 font-mono"
                    >
                      <option value={11}>11 px (Compacto)</option>
                      <option value={12}>12 px (Padrão)</option>
                      <option value={13}>13 px (Médio)</option>
                      <option value={14}>14 px (Confortável)</option>
                      <option value={16}>16 px (Grande)</option>
                    </select>
                  </div>
                </div>

                {/* Color Theme Cards */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-red-400" />
                    {t(lang, 'terminalTheme')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'nobara-dark', name: 'Nobara Dark', bg: 'bg-[#090c12]', text: 'text-slate-100', accent: 'bg-red-500' },
                      { id: 'dracula', name: 'Dracula', bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]', accent: 'bg-[#ff79c6]' },
                      { id: 'nord', name: 'Nord', bg: 'bg-[#2e3440]', text: 'text-[#eceff4]', accent: 'bg-[#88c0d0]' },
                      { id: 'solarized-dark', name: 'Solarized Dark', bg: 'bg-[#002b36]', text: 'text-[#839496]', accent: 'bg-[#b58900]' },
                      { id: 'monokai', name: 'Monokai', bg: 'bg-[#272822]', text: 'text-[#f8f8f2]', accent: 'bg-[#a6e22e]' },
                      { id: 'fedora-light', name: 'Fedora Light', bg: 'bg-slate-100', text: 'text-slate-900', accent: 'bg-blue-600' },
                    ].map((thm) => {
                      const currentTheme = config.terminalSettings?.theme || 'nobara-dark';
                      const isSelected = currentTheme === thm.id;
                      return (
                        <button
                          key={thm.id}
                          type="button"
                          onClick={() => onUpdateConfig({
                            terminalSettings: {
                              fontFamily: config.terminalSettings?.fontFamily || "'JetBrains Mono', monospace",
                              fontSize: config.terminalSettings?.fontSize || 12,
                              theme: thm.id as TerminalTheme,
                            }
                          })}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-red-500 bg-[#1a2336] shadow-md ring-1 ring-red-500'
                              : 'border-[#222f47] bg-[#0d1320] hover:bg-[#162033]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {thm.name}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${thm.accent}`} />
                          </div>
                          <div className={`w-full h-5 rounded-md ${thm.bg} border border-white/10 px-2 flex items-center text-[9px] font-mono ${thm.text}`}>
                            bash $
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-mono">
                    <span>{t(lang, 'terminalPreview')}:</span>
                    <span className="text-[10px] text-slate-500">{config.terminalSettings?.theme || 'nobara-dark'} • {config.terminalSettings?.fontSize || 12}px</span>
                  </div>
                  <div 
                    className={`p-3 rounded-xl border shadow-inner transition-all overflow-hidden ${
                      (config.terminalSettings?.theme || 'nobara-dark') === 'dracula' ? 'bg-[#282a36] border-[#44475a] text-[#f8f8f2]' :
                      (config.terminalSettings?.theme || 'nobara-dark') === 'nord' ? 'bg-[#2e3440] border-[#4c566a] text-[#eceff4]' :
                      (config.terminalSettings?.theme || 'nobara-dark') === 'solarized-dark' ? 'bg-[#002b36] border-[#073642] text-[#839496]' :
                      (config.terminalSettings?.theme || 'nobara-dark') === 'monokai' ? 'bg-[#272822] border-[#3e3d32] text-[#f8f8f2]' :
                      (config.terminalSettings?.theme || 'nobara-dark') === 'fedora-light' ? 'bg-[#f8fafc] border-slate-300 text-slate-900' :
                      'bg-[#090c12] border-[#1e2738] text-slate-100'
                    }`}
                    style={{ 
                      fontFamily: config.terminalSettings?.fontFamily || "'JetBrains Mono', monospace", 
                      fontSize: `${config.terminalSettings?.fontSize || 12}px` 
                    }}
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-current opacity-30">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-bold ml-1 text-[11px]">guga@nobara: ~/workspace</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <span className={(config.terminalSettings?.theme || 'nobara-dark') === 'fedora-light' ? 'text-blue-600 font-bold' : 'text-emerald-400 font-bold'}>nobara@workstation</span>
                        <span className="opacity-60">:</span>
                        <span className={(config.terminalSettings?.theme || 'nobara-dark') === 'dracula' ? 'text-[#bd93f9]' : 'text-cyan-400'}>~/projects</span>
                        <span className={(config.terminalSettings?.theme || 'nobara-dark') === 'monokai' ? 'text-[#f92672] font-bold' : 'text-red-500 font-bold'}> $ </span>
                        <span>dnf check-update</span>
                      </div>
                      <div className="opacity-80 pl-2 border-l-2 border-emerald-500 text-[11px] my-1">
                        Verificando pacotes Nobara & RPM Fusion...<br/>
                        Todos os pacotes do sistema estão atualizados!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-200 font-bold flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-red-400" />
                      {t(lang, 'ttsAutoPlay')}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={config.voiceTTSAutoPlay}
                    onChange={(e) => onUpdateConfig({ voiceTTSAutoPlay: e.target.checked })}
                    className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex justify-end ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-md shadow-emerald-950/20"
          >
            {t(lang, 'saveAndClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
