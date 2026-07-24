import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Terminal,
  Cpu,
  Github,
  Key,
  Mic,
  Volume2,
  Sparkles,
  Bot,
  Layers,
  Code2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Download,
  Upload,
  Globe,
  Flame
} from 'lucide-react';
import { Language, t } from '../i18n';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGitHubModal: () => void;
  onOpenSettings: () => void;
  onOpenModelsModal: () => void;
  language?: Language;
  themeMode?: string;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenGitHubModal,
  onOpenSettings,
  onOpenModelsModal,
  language = 'pt-BR',
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  const [activeSection, setActiveSection] = useState<
    'intro' | 'shortcuts' | 'deploy' | 'blame' | 'monitor' | 'agent' | 'ollama' | 'cloud' | 'github' | 'terminal' | 'pkg' | 'distros'
  >('intro');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs border ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#101522] border-[#232f48] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-xl text-white shadow-lg shadow-emerald-950/50">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {t(language, 'tutorialTitle')}
                <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono ${
                  isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                }`}>
                  v2.6 Emerald Edition
                </span>
              </h2>
              <p className={`text-xs font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {t(language, 'tutorialSub')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2337]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout with Sidebar Navigation and Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className={`w-56 border-r p-3 space-y-1 shrink-0 overflow-y-auto ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c101a] border-[#212b3f]'
          }`}>
            {[
              { id: 'intro', label: t(language, 'tutNavIntro'), icon: <Code2 className="w-4 h-4 text-amber-500" /> },
              { id: 'deploy', label: 'Deploy & Execução Local', icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
              { id: 'shortcuts', label: 'Atalhos Globais', icon: <Key className="w-4 h-4 text-emerald-500" /> },
              { id: 'blame', label: 'Git Blame no Editor', icon: <Github className="w-4 h-4 text-amber-400" /> },
              { id: 'monitor', label: 'Hardware & Disco', icon: <Cpu className="w-4 h-4 text-emerald-500" /> },
              { id: 'agent', label: t(language, 'tutNavAgent'), icon: <Bot className="w-4 h-4 text-cyan-500" /> },
              { id: 'ollama', label: 'Ollama Local', icon: <Flame className="w-4 h-4 text-emerald-500" /> },
              { id: 'cloud', label: 'Provedores Cloud', icon: <Globe className="w-4 h-4 text-purple-500" /> },
              { id: 'github', label: 'GitHub Sincronização', icon: <Github className={`w-4 h-4 ${isLight ? 'text-slate-700' : 'text-slate-200'}`} /> },
              { id: 'terminal', label: 'Terminal & Temas', icon: <Terminal className="w-4 h-4 text-emerald-500" /> },
              { id: 'pkg', label: 'Gerenciador Pacotes', icon: <Layers className="w-4 h-4 text-teal-500" /> },
              { id: 'distros', label: 'Suporte a Distros', icon: <Cpu className="w-4 h-4 text-blue-500" /> },
            ].map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center gap-2.5 transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                      : isLight
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#161d2d]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Tutorial View */}
          <div className={`flex-1 p-6 overflow-y-auto space-y-6 font-sans ${
            isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#101522] text-slate-200'
          }`}>
            {activeSection === 'intro' && (
              <div className="space-y-5">
                <div className={`p-5 rounded-2xl border ${
                  isLight
                    ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-sm'
                    : 'bg-gradient-to-r from-emerald-950/40 via-[#151d2f] to-[#131a29] border-emerald-900/40 text-slate-100'
                }`}>
                  <h3 className={`text-base font-bold font-mono mb-2 flex items-center gap-2 ${
                    isLight ? 'text-emerald-900' : 'text-slate-100'
                  }`}>
                    <Code2 className="w-5 h-5 text-emerald-500" />
                    Bem-vindo ao GugaCode IDE
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    O <strong>GugaCode</strong> é um ambiente de desenvolvimento avançado alimentado por Inteligência Artificial no estilo <strong>Claude Code CLI</strong>. Ele foi construído com otimizações nativas para <strong>Nobara Linux</strong> e <strong>Fedora Linux</strong> (suportando DNF, RPM-OSTREE, Flatpak e GPUs NVIDIA/AMD ROCm), além de suporte completo a outras distribuições Linux como Arch, Debian e Ubuntu.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141b29] border-[#232f48]'
                  }`}>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                      <Flame className="w-4 h-4 text-emerald-500" />
                      1. Execução Local Privada
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Conecte-se ao seu servidor local Ollama (<code className="text-emerald-600 dark:text-emerald-300 font-bold">http://localhost:11434</code>) e execute modelos como Qwen 2.5 Coder, DeepSeek R1 e Codestral com privacidade total.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141b29] border-[#232f48]'
                  }`}>
                    <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-500" />
                      2. Provedores Cloud de Alta Velocidade
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Integre chaves de API do Google Gemini, OpenAI, Anthropic Claude, DeepSeek Cloud, Groq LPU e OpenRouter de forma segura.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141b29] border-[#232f48]'
                  }`}>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                      <Github className={`w-4 h-4 ${isLight ? 'text-slate-800' : 'text-slate-200'}`} />
                      3. Clonagem & Git Sync Instantâneo
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Clone repositórios públicos e privados do GitHub, sincronize alterações com <code className="text-emerald-600 dark:text-emerald-300 font-bold">git pull</code> e comite modificações com <code className="text-emerald-600 dark:text-emerald-300 font-bold">git push</code>.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141b29] border-[#232f48]'
                  }`}>
                    <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                      <Mic className="w-4 h-4 text-amber-500" />
                      4. Ditado por Voz e Leitura TTS
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Fale em português com o assistente usando reconhecimento de voz por microfone e ouça as respostas geradas via síntese de áudio.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'deploy' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  Como Rodar e Fazer Deploy do GugaCode na Sua Máquina Linux
                </h3>

                <div className={`border p-4 rounded-xl space-y-4 text-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141b29] border-[#232f48] text-slate-300'
                }`}>
                  <p>
                    O GugaCode foi desenvolvido para rodar com performance máxima em qualquer máquina <strong>Linux (Nobara, Fedora, Arch, Ubuntu, Debian, Manjaro, Linux Mint)</strong>.
                  </p>

                  <div className="space-y-3 font-mono">
                    <div className={`p-3 border rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1320] border-[#202d44]'}`}>
                      <div className="font-bold text-emerald-500 mb-1">1. Instalação e Execução Direta no Seu Computador</div>
                      <pre className="p-2.5 bg-black/80 text-emerald-400 rounded overflow-x-auto text-[11px] leading-relaxed">
{`# 1. Clone o repositório no seu Linux
git clone https://github.com/luizantunesleite/gugacode.git
cd gugacode

# 2. Instale as dependências com Node.js (18+)
npm install

# 3. Inicie em modo de desenvolvimento local
npm run dev

# 4. Ou compile para produção com servidor Express compilado
npm run build
npm start`}
                      </pre>
                    </div>

                    <div className={`p-3 border rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1320] border-[#202d44]'}`}>
                      <div className="font-bold text-cyan-500 mb-1">2. Configuração do Ollama com Acesso Liberado (CORS)</div>
                      <p className={`text-[11px] mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Se o seu Ollama estiver rodando localmente no Linux (\`http://localhost:11434\`), inicie o serviço permitindo conexões da aplicação web:
                      </p>
                      <pre className="p-2.5 bg-black/80 text-cyan-400 rounded overflow-x-auto text-[11px] leading-relaxed">
{`# Executar Ollama permitindo acesso local:
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve

# Baixar modelos otimizados recomendados:
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder-v2:16b`}
                      </pre>
                    </div>

                    <div className={`p-3 border rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1320] border-[#202d44]'}`}>
                      <div className="font-bold text-amber-500 mb-1">3. Acesso Direto aos Arquivos Locais da Sua Máquina</div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        No painel <strong>Workspace</strong>, clique no botão verde <strong>[Abrir Pasta Local]</strong>. O seu navegador (Chrome, Chromium, Brave, Edge) abrirá o seletor nativo do Linux, permitindo abrir e salvar arquivos em tempo real na sua pasta de usuário (\`/home/seu-usuario/\`).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Sistema de Atalhos Globais de Teclado
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O GugaCode possui um sistema completo de atalhos globais para agilizar o fluxo de desenvolvimento sem tirar as mãos do teclado:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-mono">
                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-400">Alternar Terminal</div>
                        <div className="text-[10px] text-slate-400">Abre/Fecha a aba do Terminal</div>
                      </div>
                      <kbd className="bg-[#182238] border border-[#2e3e60] text-slate-200 px-2 py-1 rounded text-[11px] font-bold">Ctrl + J</kbd>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-cyan-400">Paleta de Comandos</div>
                        <div className="text-[10px] text-slate-400">Acessa busca e ações rápidas</div>
                      </div>
                      <kbd className="bg-[#182238] border border-[#2e3e60] text-slate-200 px-2 py-1 rounded text-[11px] font-bold">Ctrl + P</kbd>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-amber-400">Ir para o Agente IA</div>
                        <div className="text-[10px] text-slate-400">Muda para a aba de Chat IA</div>
                      </div>
                      <kbd className="bg-[#182238] border border-[#2e3e60] text-slate-200 px-2 py-1 rounded text-[11px] font-bold">Ctrl + 1</kbd>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-purple-400">Ir para o Workspace</div>
                        <div className="text-[10px] text-slate-400">Abre o gerenciador de arquivos</div>
                      </div>
                      <kbd className="bg-[#182238] border border-[#2e3e60] text-slate-200 px-2 py-1 rounded text-[11px] font-bold">Ctrl + 2</kbd>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-400">Abrir Terminal</div>
                        <div className="text-[10px] text-slate-400">Foca diretamente no terminal</div>
                      </div>
                      <kbd className="bg-[#182238] border border-[#2e3e60] text-slate-200 px-2 py-1 rounded text-[11px] font-bold">Ctrl + 3</kbd>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-blue-400">Buscar no Projeto</div>
                        <div className="text-[10px] text-slate-400">Abre a busca de arquivos</div>
                      </div>
                      <kbd className="bg-[#182238] border border-[#2e3e60] text-slate-200 px-2 py-1 rounded text-[11px] font-bold">Ctrl + Shift + F</kbd>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-300">Configurações</div>
                        <div className="text-[10px] text-slate-400">Abre o painel de opções</div>
                      </div>
                      <kbd className="bg-[#182238] border border-[#2e3e60] text-slate-200 px-2 py-1 rounded text-[11px] font-bold">Ctrl + ,</kbd>
                    </div>

                    <div className={`p-3 border rounded-lg flex items-center justify-between ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#0d1320] border-[#202d44] text-slate-300'
                    }`}>
                      <div>
                        <div className="font-bold text-teal-600 dark:text-teal-400">Fechar Janelas Modais</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Cancela ou fecha diálogo ativo</div>
                      </div>
                      <kbd className={`border px-2 py-1 rounded text-[11px] font-bold ${
                        isLight ? 'bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#182238] border-[#2e3e60] text-slate-200'
                      }`}>Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'blame' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Github className="w-4 h-4 text-amber-500" />
                  Visualização de Anotações Git Blame
                </h3>

                <div className={`border p-4 rounded-xl space-y-3 text-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141b29] border-[#232f48] text-slate-300'
                }`}>
                  <p>
                    O GugaCode possui um recurso de <strong>Git Blame</strong> integrado diretamente ao Code Editor do Workspace.
                  </p>

                  <ul className={`space-y-2 list-disc list-inside ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <li>
                      <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>Ativação Simples:</strong> No canto superior direito do editor de código, clique no botão <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">[Git Blame]</span>.
                    </li>
                    <li>
                      <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>Informação Linha a Linha:</strong> Exibe a coluna lateral com autor do commit, mensagem descritiva e a data/tempo relativo de modificação.
                    </li>
                    <li>
                      <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>Suporte a Ambos Modos:</strong> Funciona tanto no modo de edição direta quanto no modo de Syntax Highlighting em destaque.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'monitor' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  Monitor de Hardware & Visualizador de Disco
                </h3>

                <div className={`border p-4 rounded-xl space-y-3 text-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141b29] border-[#232f48] text-slate-300'
                }`}>
                  <p>
                    Acesse o monitor do sistema através do menu <strong>Ferramentas &gt; Monitor do Sistema</strong> para acompanhar métricas do Nobara/Fedora em tempo real.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                    <div className={`p-3 border rounded-lg ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1320] border-[#202d44]'
                    }`}>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">🖥️ Uso de CPU & Frequência</div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Mede a carga dos núcleos do processador e exibe gráficos dinâmicos de utilização.
                      </p>
                    </div>

                    <div className={`p-3 border rounded-lg ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1320] border-[#202d44]'
                    }`}>
                      <div className="font-bold text-cyan-600 dark:text-cyan-400 mb-1">💾 Uso de Disco SSD/NVMe</div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Visualiza espaço utilizado e livre em GB/TB com barras de progresso responsivas.
                      </p>
                    </div>

                    <div className={`p-3 border rounded-lg ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1320] border-[#202d44]'
                    }`}>
                      <div className="font-bold text-amber-600 dark:text-amber-400 mb-1">⚡ Memória RAM & Swap</div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Monitora consumo ativo de memória e área de troca do sistema operacional.
                      </p>
                    </div>

                    <div className={`p-3 border rounded-lg ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1320] border-[#202d44]'
                    }`}>
                      <div className="font-bold text-purple-600 dark:text-purple-400 mb-1">🎮 Placa de Vídeo GPU</div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Métricas para GPUs NVIDIA (NVML) e AMD (ROCm / amdgpu) com temperatura e VRAM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'agent' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  Como Usar o Claude Code Agent no GugaCode
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O agente do GugaCode simula a experiência do <strong>Claude Code CLI</strong> no terminal do Nobara/Fedora.
                  </p>

                  <ul className="space-y-2 text-slate-400 list-disc list-inside">
                    <li>
                      <strong className="text-slate-200">Comandos de Terminal Sugeridos:</strong> Quando o agente sugere blocos de código <code className="text-red-400">```bash</code>, um botão verde <span className="text-emerald-400 font-mono font-bold">[Executar Comando]</span> é exibido para rodá-lo diretamente.
                    </li>
                    <li>
                      <strong className="text-slate-200">Propostas de Edição de Código:</strong> Quando o agente gera edições para arquivos do seu projeto, você pode visualizar as diferenças (Diff Viewer) e aplicar com um único clique.
                    </li>
                    <li>
                      <strong className="text-slate-200">Ditado por Voz:</strong> Clique no botão <span className="text-red-400 font-mono font-bold">Voz</span> ao lado do botão Enviar para ditar suas instruções por voz em Português.
                    </li>
                    <li>
                      <strong className="text-slate-200">Leitura em Voz Alta (TTS):</strong> Clique no ícone de alto-falante ao lado de qualquer mensagem do assistente para ouvir a leitura.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'ollama' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  Configuração e Instalação do Ollama Local
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    Para usar modelos 100% locais e offline no Nobara Linux e Fedora:
                  </p>

                  <div className="bg-[#0b0f19] p-3 rounded-lg font-mono text-red-300 space-y-1">
                    <div># 1. Instalar o Ollama no Nobara / Fedora / Ubuntu:</div>
                    <div className="text-slate-100">curl -fsSL https://ollama.com/install.sh | sh</div>
                    <div className="pt-2"># 2. Iniciar o serviço Ollama:</div>
                    <div className="text-slate-100">systemctl start ollama</div>
                    <div className="pt-2"># 3. Baixar modelos recomendados para programação:</div>
                    <div className="text-slate-100">ollama pull qwen2.5-coder:7b</div>
                    <div className="text-slate-100">ollama pull deepseek-r1:8b</div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenModelsModal();
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold font-mono text-xs flex items-center gap-2 shadow"
                    >
                      <Download className="w-4 h-4" />
                      <span>Abrir Gerenciador de Modelos Ollama</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'cloud' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  Provedores Cloud LLM Suportados
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O GugaCode permite alternar facilmente entre o Ollama local e os principais serviços de Inteligência Artificial em nuvem:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono">
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-cyan-400 font-bold">• Google Gemini:</span> Gemini 2.5 Flash
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-emerald-400 font-bold">• OpenAI:</span> GPT-4o / O3-Mini
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-amber-400 font-bold">• Anthropic:</span> Claude 3.5 Sonnet
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-blue-400 font-bold">• DeepSeek Cloud:</span> DeepSeek V3 / R1
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-purple-400 font-bold">• Groq:</span> Llama 3 70B (Ultra Rápido)
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-pink-400 font-bold">• OpenRouter:</span> Acesso unificado
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSettings();
                      }}
                      className="bg-[#212c42] hover:bg-[#2b3a58] text-slate-200 border border-[#314366] px-4 py-2 rounded-xl font-bold font-mono text-xs flex items-center gap-2"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Configurar Chaves de API nas Configurações</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'github' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-200" />
                  Sincronização com o GitHub
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O GugaCode possui um serviço integrado para gerenciar repositórios do GitHub:
                  </p>

                  <ul className="space-y-2 text-slate-400 list-disc list-inside">
                    <li><strong className="text-slate-200">Autenticação PAT:</strong> Insira seu Personal Access Token do GitHub para ver seus projetos públicos e privados.</li>
                    <li><strong className="text-slate-200">Clonagem Direta:</strong> Insira a URL de qualquer repositório e abra os arquivos no workspace.</li>
                    <li><strong className="text-slate-200">Git Pull & Push:</strong> Mantenha o código sincronizado com commits personalizados.</li>
                  </ul>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenGitHubModal();
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-xl font-bold font-mono text-xs flex items-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      <span>Abrir Painel do GitHub</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'terminal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Terminal Nativo & Personalização Visual
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O GugaCode possui um Terminal Nativo com suporte total a personalização em <strong>Configurações &gt; Aparência do Terminal</strong>:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-mono">
                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <div className="text-amber-400 font-bold mb-1">🎨 Temas do Terminal</div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Escolha entre temas consagrados: <strong>Solarized Dark</strong>, <strong>Nord Linux</strong>, <strong>Dracula</strong>, <strong>Matrix Cyberpunk</strong> e <strong>Monokai Pro</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <div className="text-cyan-400 font-bold mb-1">🔤 Fontes & Tamanhos</div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Configure a fonte mono-espaçada preferida (JetBrains Mono, Fira Code, Source Code Pro) e ajuste a escala de 12px a 20px.
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-300 pt-2">
                    Comandos de atalho para Linux e Nobara/Fedora:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono">
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-emerald-400 font-bold">nobara-sync</span>
                      <div className="text-[10px] text-slate-400 font-sans">Sincronizar e atualizar Nobara OS</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-cyan-400 font-bold">sudo dnf check-update</span>
                      <div className="text-[10px] text-slate-400 font-sans">Atualizar repositórios RPM</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-amber-400 font-bold">cargo check / build</span>
                      <div className="text-[10px] text-slate-400 font-sans">Compilar projetos em Rust</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1320] border border-[#202d44] rounded-lg">
                      <span className="text-purple-400 font-bold">fastfetch</span>
                      <div className="text-[10px] text-slate-400 font-sans">Informações do hardware e kernel</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'pkg' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  Gerenciador Unificado de Pacotes
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O GugaCode possui uma interface gráfica para buscar, instalar e remover pacotes em múltiplos gerenciadores:
                  </p>

                  <div className="space-y-2 text-slate-300 font-mono">
                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-xl flex items-center gap-3">
                      <div className="px-2 py-1 bg-red-950 text-red-300 rounded font-bold text-[11px]">DNF / RPM</div>
                      <p className="text-[11px] font-sans text-slate-400">
                        Gerencia pacotes do ecossistema Fedora/Nobara (<code className="text-slate-200">sudo dnf install</code>).
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-xl flex items-center gap-3">
                      <div className="px-2 py-1 bg-cyan-950 text-cyan-300 rounded font-bold text-[11px]">Flatpak</div>
                      <p className="text-[11px] font-sans text-slate-400">
                        Aplicativos isolados via Flathub (<code className="text-slate-200">flatpak install flathub ...</code>).
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-xl flex items-center gap-3">
                      <div className="px-2 py-1 bg-amber-950 text-amber-300 rounded font-bold text-[11px]">NPM / Node</div>
                      <p className="text-[11px] font-sans text-slate-400">
                        Dependências e bibliotecas JavaScript/TypeScript para o workspace.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-[#202d44] rounded-xl flex items-center gap-3">
                      <div className="px-2 py-1 bg-emerald-950 text-emerald-300 rounded font-bold text-[11px]">Cargo / Rust</div>
                      <p className="text-[11px] font-sans text-slate-400">
                        Crates e ferramentas para ecossistema Rust.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'distros' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Otimização para Nobara, Fedora & Outras Distribuições
                </h3>

                <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3 text-xs">
                  <p className="text-slate-300">
                    O GugaCode adapta os comandos e recomendações conforme o ecossistema Linux detectado:
                  </p>

                  <div className="space-y-2 text-slate-300 font-mono">
                    <div className="p-3 bg-[#0d1320] border border-emerald-900/50 rounded-xl">
                      <div className="text-emerald-400 font-bold mb-1">🎮 Nobara Linux (GloriousEggroll Edition)</div>
                      <p className="text-[11px] font-sans text-slate-400">
                        Otimizações para drivers NVIDIA proprietários, AMD ROCm, kernel com patch fsync e utilitários de alta performance para jogos e compilação de código.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-blue-900/50 rounded-xl">
                      <div className="text-blue-400 font-bold mb-1">🎩 Fedora Linux (Workstation & Silverblue)</div>
                      <p className="text-[11px] font-sans text-slate-400">
                        Gerenciamento com DNF / DNF5, suporte a contêineres Toolbox, Podman e sistemas imutáveis RPM-OSTREE.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1320] border border-cyan-900/50 rounded-xl">
                      <div className="text-cyan-400 font-bold mb-1">🐧 Arch Linux, Debian, Ubuntu & openSUSE</div>
                      <p className="text-[11px] font-sans text-slate-400">
                        Comandos adaptados para Pacman/AUR (<code className="text-cyan-300">yay</code>), APT (<code className="text-cyan-300">apt-get</code>) e Zypper.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs font-mono ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#151c2d] border-[#232f48] text-slate-400'
        }`}>
          <span>GugaCode IDE - Criado para Nobara Linux, Fedora & comunidade Linux</span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-1.5 rounded-xl font-mono font-bold transition-colors shadow-md shadow-emerald-950/20"
          >
            Fechar Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};
