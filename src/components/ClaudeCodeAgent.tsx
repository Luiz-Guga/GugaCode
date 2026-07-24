import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { 
  Send, 
  Terminal, 
  Sparkles, 
  Cpu, 
  FileCode, 
  Copy, 
  Check, 
  Play, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  HelpCircle, 
  Folder, 
  Box,
  Layers,
  FileCheck,
  Code,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ChatMessage, FileEditProposal, OllamaModel, ProjectFile } from '../types';
import { Language, t } from '../i18n';

interface ClaudeCodeAgentProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeModel: string;
  activeProject: ProjectFile;
  onSendMessage: (text: string) => void;
  onExecuteTerminalCommand: (command: string) => void;
  onApplyFileEdit: (proposal: FileEditProposal) => void;
  onOpenDiffModal: (proposal: FileEditProposal) => void;
  onOpenModelsModal: () => void;
  onClearChat: () => void;
  autoSpeakResponses?: boolean;
  language?: Language;
  themeMode?: string;
}

export const ClaudeCodeAgent: React.FC<ClaudeCodeAgentProps> = ({
  messages,
  isLoading,
  activeModel,
  activeProject,
  onSendMessage,
  onExecuteTerminalCommand,
  onApplyFileEdit,
  onOpenDiffModal,
  onOpenModelsModal,
  onClearChat,
  autoSpeakResponses = false,
  language = 'pt-BR',
  themeMode = 'dark-nobara',
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [authorizedMsgIds, setAuthorizedMsgIds] = useState<Record<string, boolean>>({});

  const isLight = themeMode === 'light-fedora';

  const handleAuthorizeResponse = (msg: ChatMessage) => {
    setAuthorizedMsgIds((prev) => ({ ...prev, [msg.id]: true }));
    // Auto apply proposed file edits upon explicit user authorization
    if (msg.fileEdits && msg.fileEdits.length > 0) {
      msg.fileEdits.forEach((edit) => {
        onApplyFileEdit(edit);
      });
    }
  };
  
  // Web Speech API state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'en' ? 'en-US' : 'pt-BR';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputText((prev) => {
            const base = prev ? prev + ' ' : '';
            return base + transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Falha ao iniciar reconhecimento de voz:', err);
      }
    }
  };

  // Text-to-Speech playback
  const speakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown tags and code snippets for cleaner speech output
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Bloco de código omitido na leitura.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_-]/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Auto speak latest assistant message if option is on
  useEffect(() => {
    if (!autoSpeakResponses || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && !isLoading) {
      speakMessage(lastMsg.id, lastMsg.content);
    }
  }, [messages, isLoading, autoSpeakResponses]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');

    // Check slash commands
    if (text.startsWith('/clear')) {
      onClearChat();
      return;
    }
    if (text.startsWith('/models')) {
      onOpenModelsModal();
      return;
    }
    if (text.startsWith('/terminal ')) {
      const cmd = text.replace('/terminal ', '');
      onExecuteTerminalCommand(cmd);
      return;
    }

    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden font-sans ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0d1017] text-slate-100'}`}>
      {/* Agent Context & Toolbar Header */}
      <div className={`px-4 py-2 flex items-center justify-between text-xs font-mono border-b ${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-[#121722] border-[#222b3d]'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-md border ${
            isLight 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Guga Agent</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span className={`truncate max-w-[220px] font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              {activeProject.path}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-emerald-500" />
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{activeModel}</span>
          </div>

          <div className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium ${
            isLight
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
          }`}>
            Ollama 0.00$/tok
          </div>

          <button
            id="clear-chat-btn"
            onClick={onClearChat}
            title="Limpar histórico do chat"
            className="p-1 transition-colors hover:text-emerald-500 opacity-70 hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-400">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto`}
            >
              {/* Message Header */}
              <div className={`flex items-center gap-2 mb-1.5 px-1 text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isUser ? (
                  <>
                    <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Você (Dev)</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                      G
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">GugaCode</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-[#1a2336] border-[#27344f]'}`}>
                      {msg.modelUsed || activeModel}
                    </span>
                    {msg.tokensPerSecond && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        ⚡ {msg.tokensPerSecond} t/s
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => speakMessage(msg.id, msg.content)}
                      title={speakingMsgId === msg.id ? "Parar de falar" : "Ouvir resposta (TTS)"}
                      className={`ml-2 p-1 rounded transition-colors ${
                        speakingMsgId === msg.id
                          ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950 animate-pulse'
                          : 'hover:text-emerald-600'
                      }`}
                    >
                      {speakingMsgId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Thought Process Box for Assistant */}
              {!isUser && msg.thoughtProcess && (
                <div className={`w-full mb-3 rounded-xl border overflow-hidden text-xs ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
                    : 'bg-[#111724] border-[#212b3e] text-slate-300'
                }`}>
                  <button
                    onClick={() => toggleThought(msg.id)}
                    className={`w-full px-3 py-1.5 flex items-center justify-between font-mono transition-colors ${
                      isLight ? 'hover:bg-slate-200/60 text-slate-700' : 'hover:bg-[#161e2e] text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                      Raciocínio & Análise do Contexto GugaCode (Linux)
                    </span>
                    {expandedThoughts[msg.id] ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {expandedThoughts[msg.id] && (
                    <div className={`p-3 border-t font-mono text-[11px] whitespace-pre-wrap leading-relaxed ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c1018] border-[#212b3e] text-slate-300'
                    }`}>
                      {msg.thoughtProcess}
                    </div>
                  )}
                </div>
              )}

              {/* Main Content Bubble */}
              <div
                className={`w-full rounded-2xl p-4 sm:p-5 shadow-lg border ${
                  isUser
                    ? isLight
                      ? 'bg-emerald-700 border-emerald-800 text-white rounded-tr-none'
                      : 'bg-[#1e2738] border-[#2e3b54] text-slate-100 rounded-tr-none'
                    : isLight
                      ? 'bg-white border-slate-300 text-slate-900 rounded-tl-none shadow-md'
                      : 'bg-[#141a26] border-[#232c3f] text-slate-200 rounded-tl-none'
                }`}
              >
                <div className={`prose ${isLight ? 'prose-slate text-slate-900' : 'prose-invert text-slate-100'} max-w-none text-sm leading-relaxed`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre({ children }: any) {
                        return <>{children}</>;
                      },
                      p({ children }: any) {
                        return <div className="my-2 leading-relaxed">{children}</div>;
                      },
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const codeString = String(children).replace(/\n$/, '');

                        if (!inline) {
                          const isBash = language === 'bash' || language === 'sh';
                          return (
                            <div className={`my-3 rounded-xl overflow-hidden border ${
                              isLight ? 'border-slate-300 bg-slate-50 text-slate-900 shadow-sm' : 'border-[#2a364d] bg-[#0a0d14] text-slate-200'
                            }`}>
                              {/* Code Block Header */}
                              <div className={`px-3.5 py-1.5 flex items-center justify-between text-xs font-mono border-b ${
                                isLight ? 'bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#121824] border-[#242f44] text-slate-200'
                              }`}>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                                  {language || 'code'}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isBash && (
                                    <button
                                      onClick={() => onExecuteTerminalCommand(codeString)}
                                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-colors shadow"
                                    >
                                      <Play className="w-3 h-3" />
                                      <span>Executar no Terminal</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => copyToClipboard(codeString, `${msg.id}-${codeString.slice(0, 10)}`)}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors text-[11px] ${
                                      isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300' : 'text-slate-400 hover:text-white hover:bg-[#1f2a3e]'
                                    }`}
                                  >
                                    {copiedId === `${msg.id}-${codeString.slice(0, 10)}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              {/* Code Content with Syntax Highlighting */}
                              <SyntaxHighlighter
                                code={codeString}
                                language={language}
                                themeMode={themeMode}
                              />
                            </div>
                          );
                        }

                        return (
                          <code className={`font-mono text-xs px-1.5 py-0.5 rounded border font-semibold ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-[#1f283b] text-emerald-300 border-[#2e3b54]'
                          }`}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Proposed Terminal Commands Section */}
                {msg.terminalCommands && msg.terminalCommands.length > 0 && (
                  <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#232c3f]'}`}>
                    <div className={`text-xs font-mono font-semibold mb-2 flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Comandos Sugeridos para Nobara Linux:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.terminalCommands.map((cmd, idx) => (
                        <button
                          key={idx}
                          onClick={() => onExecuteTerminalCommand(cmd)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all group shadow-sm border ${
                            isLight
                              ? 'bg-slate-100 hover:bg-emerald-50 hover:border-emerald-500 border-slate-300 text-slate-800'
                              : 'bg-[#1a2336] hover:bg-emerald-950/80 hover:border-emerald-500 border-[#2b3a58] text-slate-200'
                          }`}
                        >
                          <Play className="w-3 h-3 text-emerald-500 group-hover:text-emerald-600" />
                          <span className="font-semibold">{cmd}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proposed File Edits Section */}
                {msg.fileEdits && msg.fileEdits.length > 0 && (
                  <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#232c3f]'}`}>
                    <div className={`text-xs font-mono font-semibold mb-2 flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Proposta de Alteração de Arquivo:</span>
                    </div>
                    <div className="space-y-2">
                      {msg.fileEdits.map((edit, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg flex items-center justify-between text-xs font-mono border ${
                            isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-800'
                              : 'bg-[#0f1420] border-[#232d42] text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{edit.filePath}</div>
                            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{edit.summary}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenDiffModal(edit)}
                              className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                                isLight
                                  ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-800'
                                  : 'bg-[#1b2436] hover:bg-[#25324c] border-[#2e3c5a] text-slate-200'
                              }`}
                            >
                              Ver Diff
                            </button>
                            <button
                              onClick={() => onApplyFileEdit(edit)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors shadow"
                            >
                              Aplicar Edição
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authorization Control Bar */}
                {!isUser && (
                  <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3 ${isLight ? 'border-slate-200' : 'border-[#232c3f]'}`}>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <ShieldCheck className={`w-4 h-4 ${authorizedMsgIds[msg.id] || msg.authorized ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {authorizedMsgIds[msg.id] || msg.authorized
                          ? t(language, 'authorizedBadge')
                          : t(language, 'authorizeNotice')}
                      </span>
                    </div>

                    {authorizedMsgIds[msg.id] || msg.authorized ? (
                      <div className="flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{t(language, 'authorizedBadge')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAuthorizeResponse(msg)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t(language, 'authorizeBtn')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className={`flex items-center gap-3 max-w-4xl mx-auto p-4 rounded-2xl border text-xs font-mono ${
            isLight ? 'bg-white border-slate-300 text-slate-800 shadow-sm' : 'bg-[#141a26] border-[#232c3f] text-slate-300'
          }`}>
            <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="animate-pulse">
              Claude Agent gerando resposta com {activeModel}...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 max-w-4xl mx-auto w-full">
          <div className={`text-[11px] font-mono mb-2 flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <Zap className="w-3 h-3 text-emerald-500" />
            <span>Sugestões rápidas para o projeto Nobara Linux:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Otimizar o projeto Rust para o Nobara Linux (GPU & Kernel)",
              "Criar script Bash para sincronização automática com nobara-sync",
              "Inspecionar e explicar a estrutura do projeto atual",
              "Adicionar testes automatizados e logs de diagnóstico",
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputText(suggestion);
                }}
                className={`text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${
                  isLight
                    ? 'bg-white hover:bg-emerald-50 border-slate-300 hover:border-emerald-500 text-slate-800 shadow-sm'
                    : 'bg-[#131926] hover:bg-[#1b2336] border-[#232d42] hover:border-emerald-600 text-slate-300'
                }`}
              >
                ➔ {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Prompt Bar */}
      <div className={`p-3 sm:p-4 border-t ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#0f131d] border-[#21293a]'}`}>
        <div className={`max-w-4xl mx-auto relative border rounded-2xl p-2.5 transition-colors shadow-xl ${
          isLight
            ? 'bg-white border-slate-300 focus-within:border-emerald-500'
            : 'bg-[#151c2a] border-[#28344d] focus-within:border-emerald-500'
        }`}>
          {/* Slash Commands Bar */}
          <div className={`flex items-center gap-2 px-2 pb-2 border-b text-[11px] font-mono overflow-x-auto ${
            isLight ? 'border-slate-200 text-slate-600' : 'border-[#222b3e] text-slate-400'
          }`}>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Atalhos:</span>
            <button
              onClick={() => setInputText('/terminal fastfetch')}
              className={`px-2 py-0.5 rounded transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#1b2438] hover:bg-[#232f48] text-slate-300'}`}
            >
              /terminal
            </button>
            <button
              onClick={onOpenModelsModal}
              className={`px-2 py-0.5 rounded transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#1b2438] hover:bg-[#232f48] text-slate-300'}`}
            >
              /models
            </button>
            <button
              onClick={() => setInputText('Como refatorar este arquivo para melhorar performance?')}
              className={`px-2 py-0.5 rounded transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#1b2438] hover:bg-[#232f48] text-slate-300'}`}
            >
              /refactor
            </button>
            <button
              onClick={onClearChat}
              className={`px-2 py-0.5 rounded transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#1b2438] hover:bg-[#232f48] text-slate-300'}`}
            >
              /clear
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(language, 'chatPlaceholder')}
            rows={2}
            className={`w-full bg-transparent text-xs sm:text-sm p-2 focus:outline-none resize-none font-mono ${
              isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-slate-100 placeholder:text-slate-500'
            }`}
          />

          <div className="flex items-center justify-between pt-1 px-1">
            <div className={`text-[11px] font-mono flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
              <span>Shift + Enter {language === 'en' ? 'for new line' : 'para nova linha'}</span>
              {isListening && (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold animate-pulse">
                  <Radio className="w-3 h-3 text-emerald-500" />
                  {t(language, 'listening')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {speechSupported && (
                <button
                  id="voice-input-toggle-btn"
                  onClick={toggleListening}
                  title={isListening ? (language === 'en' ? "Stop voice input" : "Parar ditado por voz") : (language === 'en' ? "Start voice input" : "Iniciar ditado por voz")}
                  className={`p-2 rounded-xl transition-all font-mono text-xs flex items-center gap-1.5 ${
                    isListening
                      ? 'bg-emerald-600 text-white animate-pulse ring-2 ring-emerald-400'
                      : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-[#1e273a] hover:bg-[#28354f] text-slate-300 border border-[#303e5c]'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span className="hidden sm:inline">{language === 'en' ? 'Recording...' : 'Gravando...'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">{t(language, 'voiceBtn')}</span>
                    </>
                  )}
                </button>
              )}

              <button
                id="send-chat-msg-btn"
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 text-white p-2 sm:px-4 sm:py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30"
              >
                <span>{t(language, 'sendBtn')}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
