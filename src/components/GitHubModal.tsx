import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  GitBranch,
  GitPullRequest,
  GitMerge,
  Plus,
  CornerDownRight,
  Download,
  Upload,
  RefreshCw,
  Search,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Lock,
  Globe,
  Sparkles,
  Wrench,
  ShieldCheck,
  Terminal,
  Play,
  Trash2,
  Check,
  FileCheck,
  Zap
} from 'lucide-react';
import { GitHubRepo, GitHubUser, ProjectFile } from '../types';
import { GitHubService } from '../services/githubService';
import { OllamaService } from '../services/ollamaService';
import { Language, t } from '../i18n';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onSaveToken: (token: string) => void;
  onProjectLoaded: (project: ProjectFile) => void;
  currentProjectName: string;
  language?: Language;
  onExecuteCommand?: (cmd: string) => void;
  themeMode?: string;
}

const DEFAULT_HOOK_PRESETS: Record<string, Record<string, string>> = {
  'pre-commit': {
    rust: `#!/bin/bash
# Pre-commit hook for Rust projects in Nobara & Fedora Linux
echo "[GugaCode Pre-Commit] Running cargo fmt & clippy..."
if command -v cargo &> /dev/null; then
  cargo fmt --check || { echo "❌ Cargo fmt failed! Run 'cargo fmt' to format code."; exit 1; }
  cargo clippy -- -D warnings || { echo "❌ Cargo clippy found warnings/errors!"; exit 1; }
  echo "✅ Rust pre-commit checks passed!"
else
  echo "⚠️ Cargo not found on system, skipping Rust checks."
fi`,
    node: `#!/bin/bash
# Pre-commit hook for TypeScript & Node.js projects
echo "[GugaCode Pre-Commit] Running linter & unit tests..."
if [ -f "package.json" ]; then
  npm run lint || { echo "❌ Linter failed! Fix errors before committing."; exit 1; }
  npm test || { echo "❌ Unit tests failed!"; exit 1; }
  echo "✅ Node/TypeScript pre-commit checks passed!"
fi`,
    python: `#!/bin/bash
# Pre-commit hook for Python projects
echo "[GugaCode Pre-Commit] Running Python flake8 & pytest..."
if command -v flake8 &> /dev/null; then
  flake8 . || { echo "❌ Flake8 linting errors found!"; exit 1; }
fi
if command -v pytest &> /dev/null; then
  pytest || { echo "❌ Pytest unit tests failed!"; exit 1; }
fi
echo "✅ Python pre-commit checks passed!"`,
    conventional: `#!/bin/bash
# Pre-commit hook checking staged files
echo "[GugaCode Pre-Commit] Checking staged files..."
staged=$(git diff --cached --name-only)
if [ -z "$staged" ]; then
  echo "⚠️ No staged files found."
else
  echo "Staged files ready for commit:"
  echo "$staged"
fi`
  },
  'pre-push': {
    rust: `#!/bin/bash
# Pre-push hook for Rust projects
echo "[GugaCode Pre-Push] Running cargo test & release check..."
if command -v cargo &> /dev/null; then
  cargo test || { echo "❌ Cargo tests failed! Push aborted."; exit 1; }
  cargo check --release || { echo "❌ Release check failed!"; exit 1; }
  echo "✅ Pre-push verification succeeded!"
fi`,
    node: `#!/bin/bash
# Pre-push hook for Node/TypeScript projects
echo "[GugaCode Pre-Push] Verifying production build before push..."
if [ -f "package.json" ]; then
  npm run build || { echo "❌ Production build failed! Push aborted."; exit 1; }
  echo "✅ Production build verified!"
fi`,
    python: `#!/bin/bash
# Pre-push hook for Python projects
echo "[GugaCode Pre-Push] Verifying pytest suite..."
if command -v pytest &> /dev/null; then
  pytest || { echo "❌ Pytest failed! Push aborted."; exit 1; }
fi`,
    conventional: `#!/bin/bash
# Pre-push generic hook
echo "[GugaCode Pre-Push] Checking git branch..."
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Preparing to push branch: $current_branch"
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
  echo "⚠️ Pushing directly to protected branch ($current_branch)!"
fi`
  },
  'commit-msg': {
    conventional: `#!/bin/bash
# Commit-msg hook checking Conventional Commits syntax
msg_file=$1
msg=$(cat "$msg_file")
pattern="^(feat|fix|docs|style|refactor|test|chore|ci|build)(\\(.+\\))?: .+"

if ! [[ "$msg" =~ $pattern ]]; then
  echo "❌ INVALID COMMIT MESSAGE FORMAT!"
  echo "GugaCode requires Conventional Commits syntax:"
  echo "  feat: add git hooks tab"
  echo "  fix: resolve compilation error"
  echo "  docs: update README.md"
  exit 1
fi
echo "✅ Commit message format valid!"`,
    rust: `#!/bin/bash
# Commit-msg hook ensuring commit message isn't empty
msg_file=$1
msg=$(cat "$msg_file")
if [ -z "$msg" ]; then
  echo "❌ Empty commit message is not allowed!"
  exit 1
fi`,
    node: `#!/bin/bash
# Commit-msg hook ensuring no WIP commits
msg_file=$1
msg=$(cat "$msg_file")
if [[ "$msg" =~ "WIP" ]] || [[ "$msg" =~ "wip" ]]; then
  echo "❌ WIP commits are blocked on main!"
  exit 1
fi`,
    python: `#!/bin/bash
# Commit-msg hook
msg_file=$1
echo "Commit message logged: $(cat "$msg_file")"`
  }
};

export const GitHubModal: React.FC<GitHubModalProps> = ({
  isOpen,
  onClose,
  token = '',
  onSaveToken,
  onProjectLoaded,
  currentProjectName,
  language = 'pt-BR',
  onExecuteCommand,
  themeMode = 'dark-nobara',
}) => {
  const isLight = themeMode === 'light-fedora';
  const [patInput, setPatInput] = useState(token);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloningRepo, setCloningRepo] = useState<string | null>(null);
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('Atualização de código via GugaCode IDE');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'repos' | 'clone' | 'push' | 'branches' | 'hooks' | 'settings'>('repos');

  // Git Hooks State
  const [selectedHook, setSelectedHook] = useState<'pre-commit' | 'pre-push' | 'commit-msg'>('pre-commit');
  const [hookPreset, setHookPreset] = useState<'rust' | 'node' | 'python' | 'conventional'>('rust');
  const [hookScript, setHookScript] = useState<string>(DEFAULT_HOOK_PRESETS['pre-commit']['rust']);
  const [installedHooks, setInstalledHooks] = useState<string[]>([]);
  const [isTestingHook, setIsTestingHook] = useState(false);
  const [hookTestOutput, setHookTestOutput] = useState<string | null>(null);

  // Git Branch Manager State
  const [branchList, setBranchList] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [newBranchInput, setNewBranchInput] = useState<string>('');
  const [mergeBranchSelect, setMergeBranchSelect] = useState<string>('');
  const [isBranchLoading, setIsBranchLoading] = useState<boolean>(false);

  useEffect(() => {
    setPatInput(token);
    if (isOpen) {
      loadGitHubData(token);
      loadInstalledHooks();
      loadGitBranches();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (isOpen && activeTab === 'branches') {
      loadGitBranches();
    }
  }, [activeTab, isOpen]);

  const loadGitBranches = async () => {
    setIsBranchLoading(true);
    try {
      const res = await OllamaService.executeCommand('git branch -a || (git init -b main && git branch -a)');
      if (res && res.output) {
        const lines = res.output.split('\n');
        const branchesFound: string[] = [];
        let active = 'main';

        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;
          if (trimmed.startsWith('* ')) {
            active = trimmed.replace('* ', '').trim();
            branchesFound.push(active);
          } else {
            let bName = trimmed.replace(/^remotes\/[^\/]+\//, '').trim();
            if (bName && !bName.includes('HEAD ->') && !branchesFound.includes(bName)) {
              branchesFound.push(bName);
            }
          }
        });

        setCurrentBranch(active);
        setBranchList(Array.from(new Set(branchesFound)));
      } else {
        setBranchList(['main']);
        setCurrentBranch('main');
      }
    } catch (e) {
      console.warn('Could not list git branches:', e);
      setBranchList(['main']);
      setCurrentBranch('main');
    } finally {
      setIsBranchLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    const formattedName = newBranchInput.trim().replace(/\s+/g, '-');
    if (!formattedName) return;
    setStatusMessage({ type: 'info', text: `Criando e trocando para nova branch "${formattedName}"...` });
    try {
      const res = await OllamaService.executeCommand(`git checkout -b ${formattedName}`);
      if (res && (res.exitCode === 0 || !res.output.toLowerCase().includes('error'))) {
        setStatusMessage({ type: 'success', text: t(language, 'branchCreatedMsg') });
        setNewBranchInput('');
        await loadGitBranches();
      } else {
        setStatusMessage({ type: 'error', text: res?.output || 'Erro ao criar nova branch.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Falha ao executar comando de criação de branch' });
    }
  };

  const handleSwitchBranch = async (bName: string) => {
    if (bName === currentBranch) return;
    setStatusMessage({ type: 'info', text: `Trocando para branch "${bName}"...` });
    try {
      const res = await OllamaService.executeCommand(`git checkout ${bName}`);
      if (res && (res.exitCode === 0 || !res.output.toLowerCase().includes('error'))) {
        setStatusMessage({ type: 'success', text: t(language, 'branchSwitchedMsg') });
        await loadGitBranches();
      } else {
        setStatusMessage({ type: 'error', text: res?.output || 'Erro ao trocar para a branch selecionada.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Falha ao trocar de branch' });
    }
  };

  const handleMergeBranch = async () => {
    if (!mergeBranchSelect || mergeBranchSelect === currentBranch) return;
    setStatusMessage({ type: 'info', text: `Mesclando branch "${mergeBranchSelect}" na branch atual "${currentBranch}"...` });
    try {
      const res = await OllamaService.executeCommand(`git merge ${mergeBranchSelect}`);
      if (res && (res.exitCode === 0 || !res.output.toLowerCase().includes('conflict'))) {
        setStatusMessage({ type: 'success', text: t(language, 'branchMergedMsg') });
        setMergeBranchSelect('');
        await loadGitBranches();
      } else {
        setStatusMessage({ type: 'error', text: res?.output || 'Conflito de mesclagem ou erro retornado pelo Git.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Falha ao executar git merge.' });
    }
  };

  useEffect(() => {
    // Update script when selectedHook or hookPreset changes
    const defaultScript = DEFAULT_HOOK_PRESETS[selectedHook]?.[hookPreset] || DEFAULT_HOOK_PRESETS[selectedHook]?.['conventional'] || `#!/bin/bash\necho "Running ${selectedHook} hook..."`;
    setHookScript(defaultScript);
  }, [selectedHook, hookPreset]);

  const loadGitHubData = async (authToken: string) => {
    setLoading(true);
    setStatusMessage(null);

    if (authToken) {
      const userRes = await GitHubService.getUserProfile(authToken);
      if (userRes.success && userRes.user) {
        setUser(userRes.user);
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }

    const reposRes = await GitHubService.getUserRepos(authToken);
    if (reposRes.success) {
      setRepos(reposRes.repos);
    }

    setLoading(false);
  };

  const loadInstalledHooks = async () => {
    try {
      const res = await OllamaService.executeCommand('[ -d .git/hooks ] && ls -1 .git/hooks || echo "NO_GIT_DIR"');
      if (res && res.output && !res.output.includes('NO_GIT_DIR')) {
        const lines = res.output.split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.endsWith('.sample'));
        setInstalledHooks(lines);
      } else {
        setInstalledHooks([]);
      }
    } catch (e) {
      console.warn('Could not list .git/hooks:', e);
    }
  };

  const handleInstallHook = async () => {
    setStatusMessage({ type: 'info', text: `Instalando hook ${selectedHook} em .git/hooks/...` });
    try {
      // Escape content safely for bash cat
      const cmd = `mkdir -p .git/hooks && cat << 'GUGACodeHookEOF' > .git/hooks/${selectedHook}\n${hookScript}\nGUGACodeHookEOF\nchmod +x .git/hooks/${selectedHook}`;
      const res = await OllamaService.executeCommand(cmd);
      
      if (res) {
        setStatusMessage({ type: 'success', text: t(language, 'hookInstalledMsg') });
        await loadInstalledHooks();
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Erro ao instalar Git Hook no diretório .git/hooks/' });
    }
  };

  const handleTestHook = async () => {
    setIsTestingHook(true);
    setHookTestOutput(null);
    setStatusMessage({ type: 'info', text: t(language, 'hookTestRunning') });

    try {
      // Run the script directly or execute the file in .git/hooks
      const cmd = `[ -f .git/hooks/${selectedHook} ] && .git/hooks/${selectedHook} || bash -c '${hookScript.replace(/'/g, "'\\''")}'`;
      const res = await OllamaService.executeCommand(cmd);
      
      if (res) {
        setHookTestOutput(`[Exit Code: ${res.exitCode ?? 0}]\n\n${res.output || '(Nenhuma saída produzida)'}`);
        if (res.exitCode === 0) {
          setStatusMessage({ type: 'success', text: `Hook ${selectedHook} executado com sucesso (Código 0)!` });
        } else {
          setStatusMessage({ type: 'error', text: `Hook ${selectedHook} retornou erro (Código ${res.exitCode})` });
        }
      }

      if (onExecuteCommand) {
        onExecuteCommand(cmd);
      }
    } catch (e) {
      setHookTestOutput(`Erro ao executar o teste do hook: ${String(e)}`);
      setStatusMessage({ type: 'error', text: 'Falha na execução do teste do hook' });
    } finally {
      setIsTestingHook(false);
    }
  };

  const handleRemoveHook = async () => {
    try {
      await OllamaService.executeCommand(`rm -f .git/hooks/${selectedHook}`);
      setStatusMessage({ type: 'success', text: `Hook ${selectedHook} removido de .git/hooks/` });
      await loadInstalledHooks();
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Erro ao remover o hook' });
    }
  };

  const handleSaveToken = async () => {
    onSaveToken(patInput.trim());
    setStatusMessage({ type: 'info', text: 'Validando token do GitHub...' });
    await loadGitHubData(patInput.trim());
    setStatusMessage({ type: 'success', text: 'Token do GitHub atualizado e conta conectada!' });
  };

  const handleClone = async (repoUrl: string) => {
    setCloningRepo(repoUrl);
    setStatusMessage({ type: 'info', text: `Clonando repositório ${repoUrl}...` });

    const res = await GitHubService.cloneRepository(repoUrl, token);
    setCloningRepo(null);

    if (res.success && res.project) {
      onProjectLoaded(res.project);
      setStatusMessage({ type: 'success', text: res.error || `Repositório clonado com sucesso para o workspace Nobara!` });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Falha ao clonar repositório.' });
    }
  };

  const handlePull = async () => {
    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Puxando atualizações do repositório (git pull)...' });
    const res = await GitHubService.pullRepository(currentProjectName, token);
    setLoading(false);

    if (res.success && res.project) {
      onProjectLoaded(res.project);
      setStatusMessage({ type: 'success', text: res.message || 'Workspace atualizado com sucesso!' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Erro ao realizar git pull.' });
    }
  };

  const handlePush = async () => {
    if (!commitMessage.trim()) return;
    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Enviando alterações para o GitHub (git push)...' });

    const targetUrl = customRepoUrl || `https://github.com/${user?.login || 'nobara'}/${currentProjectName}`;
    const res = await GitHubService.pushRepository(targetUrl, commitMessage, token);
    setLoading(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message || 'Push concluído com sucesso!' });
      setCommitMessage('Atualização de código via GugaCode IDE');
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Erro ao realizar git push.' });
    }
  };

  if (!isOpen) return null;

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.language && r.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#101522] border-[#232f48] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151c2d] border-[#232f48]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-slate-200 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-100'
            }`}>
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}>
                Sincronização & Integração GitHub - GugaCode
                {user && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    @{user.login}
                  </span>
                )}
              </h2>
              <p className={`text-xs font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Clone, faça pull, comite e gerencie Git Hooks diretamente no seu workspace GugaCode (Nobara & Fedora Linux)
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

        {/* User Badge Bar */}
        {user ? (
          <div className="bg-[#141d2f] px-6 py-2.5 border-b border-[#232f48] flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2.5">
              <img src={user.avatar_url} alt={user.login} className="w-6 h-6 rounded-full border border-slate-700" />
              <span className="font-bold text-slate-100">{user.name || user.login}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{user.public_repos} repositórios públicos</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePull}
                disabled={loading}
                className="bg-[#1e2a42] hover:bg-[#283859] text-slate-200 px-3 py-1 rounded-lg border border-[#2f4066] transition-colors flex items-center gap-1.5"
                title="Puxar últimas atualizações do repositório"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
                <span>Git Pull</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-amber-950/30 border-b border-amber-800/40 px-6 py-2 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Conecte sua conta com um Personal Access Token (PAT) do GitHub para acessar repositórios privados e realizar push.</span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-amber-400 underline font-mono hover:text-amber-200"
            >
              Inserir Token
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#232f48] bg-[#121827] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-3 py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'repos'
                ? 'bg-[#182033] text-red-400 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Repositórios ({repos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('clone')}
            className={`px-3 py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'clone'
                ? 'bg-[#182033] text-red-400 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Clonar URL Externa</span>
          </button>
          <button
            onClick={() => setActiveTab('push')}
            className={`px-3 py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'push'
                ? 'bg-[#182033] text-red-400 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Commit & Push</span>
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'branches'
                ? 'bg-[#182033] text-red-400 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t(language, 'tabBranches')} ({branchList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hooks')}
            className={`px-3 py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'hooks'
                ? 'bg-[#182033] text-red-400 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>{t(language, 'tabGitHooks')}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#182033] text-red-400 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Token PAT</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-mono border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-950/50 border-red-800/80 text-red-300'
                : 'bg-blue-950/50 border-blue-800/80 text-blue-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-4">
          {activeTab === 'repos' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar repositório por nome, linguagem ou descrição..."
                  className="w-full bg-[#151d2c] border border-[#273550] pl-9 pr-4 py-2 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-500 font-sans flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
                  <span>Carregando repositórios do GitHub...</span>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-sans border border-dashed border-[#232f48] rounded-2xl p-6">
                  Nenhum repositório encontrado com os critérios de busca.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="bg-[#141c2c] border border-[#222f48] hover:border-red-900/60 p-4 rounded-xl flex flex-col justify-between group transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-100 truncate">
                            {repo.private ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            )}
                            <span className="truncate">{repo.name}</span>
                          </div>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-slate-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <p className="text-[11px] text-slate-400 font-sans line-clamp-2 mb-3 h-8">
                          {repo.description || 'Sem descrição cadastrada.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1d2940] text-[10px] text-slate-500">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="text-red-400 font-mono font-semibold">{repo.language}</span>
                          )}
                          <span>★ {repo.stargazers_count}</span>
                        </div>

                        <button
                          onClick={() => handleClone(repo.clone_url)}
                          disabled={cloningRepo === repo.clone_url}
                          className="bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white px-3 py-1 rounded-lg font-mono font-bold flex items-center gap-1 transition-colors shadow"
                        >
                          <Download className="w-3 h-3" />
                          <span>{cloningRepo === repo.clone_url ? 'Clonando...' : 'Clonar'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'clone' && (
            <div className="space-y-4">
              <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4 text-red-400" />
                  Clonar Repositório Público ou Privado via URL
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Insira qualquer link do GitHub (ex: https://github.com/torvalds/linux ou usuario/repositorio) para baixar e abrir o código no Nobara Code IDE.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRepoUrl}
                    onChange={(e) => setCustomRepoUrl(e.target.value)}
                    placeholder="https://github.com/usuario/repositorio.git"
                    className="flex-1 bg-[#0d1320] border border-[#273550] focus:border-red-500 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleClone(customRepoUrl)}
                    disabled={!customRepoUrl.trim() || cloningRepo !== null}
                    className="bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Clonar Repositório</span>
                  </button>
                </div>
              </div>

              {/* Preset Examples */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos Recomendados para Nobara Linux:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleClone('https://github.com/nobara-project/nobara-gaming-tweaker')}
                    className="p-3 bg-[#131b2c] hover:bg-[#1b253d] border border-[#212e47] rounded-xl text-left transition-all"
                  >
                    <div className="text-slate-200 font-bold">nobara-project/nobara-gaming-tweaker</div>
                    <div className="text-[11px] text-slate-400 font-sans">Rust CLI Otimizador Gaming</div>
                  </button>
                  <button
                    onClick={() => handleClone('https://github.com/nobara-project/ollama-nobara-bridge')}
                    className="p-3 bg-[#131b2c] hover:bg-[#1b253d] border border-[#212e47] rounded-xl text-left transition-all"
                  >
                    <div className="text-slate-200 font-bold">nobara-project/ollama-nobara-bridge</div>
                    <div className="text-[11px] text-slate-400 font-sans">Bridge Python para ROCm e CUDA</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'push' && (
            <div className="space-y-4">
              <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Enviar Modificações do Workspace (Git Push)
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Sincronize seus arquivos alterados no GugaCode de volta com o seu repositório remoto.
                </p>

                <div className="space-y-2">
                  <label className="text-slate-300 font-bold block">Mensagem de Commit:</label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Ex: Refatorando módulos Rust e scripts de IA"
                    className="w-full bg-[#0d1320] border border-[#273550] focus:border-red-500 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handlePush}
                    disabled={!commitMessage.trim() || loading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Realizar Git Push</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="space-y-4">
              {/* Branch Header Card */}
              <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    {t(language, 'branchesTitle')}
                  </h3>
                  <button
                    onClick={loadGitBranches}
                    disabled={isBranchLoading}
                    className="bg-[#1e2a42] hover:bg-[#283859] text-slate-200 px-3 py-1 rounded-lg border border-[#2f4066] transition-colors flex items-center gap-1.5 text-xs font-mono"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBranchLoading ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Atualizar Branches</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  {t(language, 'branchesSub')}
                </p>

                {/* Active Branch Status Bar */}
                <div className="mt-2 bg-[#0c101a] border border-[#212d45] p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">{t(language, 'currentBranchLabel')}:</span>
                    <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {currentBranch}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Total: <strong className="text-slate-200">{branchList.length}</strong> branches
                  </div>
                </div>
              </div>

              {/* Branch Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create Branch Card */}
                <div className="bg-[#131a29] border border-[#232f48] p-4 rounded-xl space-y-3 font-mono">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    {t(language, 'createBranchBtn')}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Cria uma nova branch a partir da branch atual ({currentBranch}) e realiza o checkout automático.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newBranchInput}
                      onChange={(e) => setNewBranchInput(e.target.value)}
                      placeholder={t(language, 'newBranchNamePlaceholder')}
                      className="w-full bg-[#0d1320] border border-[#273550] focus:border-emerald-500 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleCreateBranch}
                      disabled={!newBranchInput.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t(language, 'createBranchBtn')}</span>
                    </button>
                  </div>
                </div>

                {/* Merge Branch Card */}
                <div className="bg-[#131a29] border border-[#232f48] p-4 rounded-xl space-y-3 font-mono">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-cyan-400" />
                    {t(language, 'mergeBranchBtn')}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Mescla as alterações da branch selecionada diretamente na branch ativa (<strong>{currentBranch}</strong>).
                  </p>
                  <div className="space-y-2">
                    <select
                      value={mergeBranchSelect}
                      onChange={(e) => setMergeBranchSelect(e.target.value)}
                      className="w-full bg-[#0d1320] border border-[#273550] focus:border-cyan-500 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:outline-none"
                    >
                      <option value="">{t(language, 'mergeBranchPlaceholder')}</option>
                      {branchList
                        .filter((b) => b !== currentBranch)
                        .map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={handleMergeBranch}
                      disabled={!mergeBranchSelect || mergeBranchSelect === currentBranch}
                      className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2 shadow"
                    >
                      <GitMerge className="w-4 h-4" />
                      <span>{t(language, 'mergeBranchBtn')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Branch List Table / Card */}
              <div className="bg-[#131a29] border border-[#232f48] p-4 rounded-xl space-y-3 font-mono">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <CornerDownRight className="w-4 h-4 text-red-400" />
                  Todas as Branches no Workspace ({branchList.length})
                </h4>

                <div className="space-y-2">
                  {branchList.map((branch) => {
                    const isActive = branch === currentBranch;
                    return (
                      <div
                        key={branch}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-[#182338] border-emerald-600/80'
                            : 'bg-[#0e1422] border-[#222f47] hover:bg-[#121a2c]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs font-mono">
                          <GitBranch className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <span className={`font-semibold ${isActive ? 'text-emerald-300 font-bold' : 'text-slate-200'}`}>
                            {branch}
                          </span>
                          {isActive && (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                              Ativa
                            </span>
                          )}
                        </div>

                        {!isActive && (
                          <button
                            onClick={() => handleSwitchBranch(branch)}
                            className="bg-[#1b263b] hover:bg-red-900/60 hover:border-red-600 border border-[#2c3d5e] text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                            <span>{t(language, 'switchBranchBtn')}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hooks' && (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="bg-[#141c2e] border border-[#253654] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    {t(language, 'gitHooksTitle')}
                  </h3>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    .git/hooks/ Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  {t(language, 'gitHooksSub')} (Nobara & Fedora Linux Linux Workstation).
                </p>
              </div>

              {/* Hook Selection & Presets */}
              <div className="bg-[#131a29] border border-[#232f48] p-4 rounded-xl space-y-4 font-mono">
                {/* Hook Type Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedHook('pre-commit')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedHook === 'pre-commit'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-200 font-bold shadow'
                        : 'bg-[#182133] border-[#293854] text-slate-300 hover:bg-[#1d2940]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>pre-commit</span>
                      {installedHooks.includes('pre-commit') && (
                        <span className="text-[10px] text-emerald-400 font-bold">● Ativo</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">Valida código antes de salvar commit</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedHook('pre-push')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedHook === 'pre-push'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-200 font-bold shadow'
                        : 'bg-[#182133] border-[#293854] text-slate-300 hover:bg-[#1d2940]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>pre-push</span>
                      {installedHooks.includes('pre-push') && (
                        <span className="text-[10px] text-emerald-400 font-bold">● Ativo</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">Garante build e testes antes de subir</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedHook('commit-msg')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedHook === 'commit-msg'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-200 font-bold shadow'
                        : 'bg-[#182133] border-[#293854] text-slate-300 hover:bg-[#1d2940]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>commit-msg</span>
                      {installedHooks.includes('commit-msg') && (
                        <span className="text-[10px] text-emerald-400 font-bold">● Ativo</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">Verifica sintaxe da mensagem</div>
                  </button>
                </div>

                {/* Preset Templates Buttons */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Atalhos & Presets Recomendados para {selectedHook}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setHookPreset('rust')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                        hookPreset === 'rust'
                          ? 'bg-red-950 border-red-700 text-white font-bold'
                          : 'bg-[#1a2336] border-[#2c3b5b] text-slate-300 hover:bg-[#212d45]'
                      }`}
                    >
                      🦀 Rust (cargo fmt & clippy)
                    </button>

                    <button
                      type="button"
                      onClick={() => setHookPreset('node')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                        hookPreset === 'node'
                          ? 'bg-red-950 border-red-700 text-white font-bold'
                          : 'bg-[#1a2336] border-[#2c3b5b] text-slate-300 hover:bg-[#212d45]'
                      }`}
                    >
                      ⚡ TypeScript / Node (npm lint & test)
                    </button>

                    <button
                      type="button"
                      onClick={() => setHookPreset('python')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                        hookPreset === 'python'
                          ? 'bg-red-950 border-red-700 text-white font-bold'
                          : 'bg-[#1a2336] border-[#2c3b5b] text-slate-300 hover:bg-[#212d45]'
                      }`}
                    >
                      🐍 Python (flake8 & pytest)
                    </button>

                    <button
                      type="button"
                      onClick={() => setHookPreset('conventional')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                        hookPreset === 'conventional'
                          ? 'bg-red-950 border-red-700 text-white font-bold'
                          : 'bg-[#1a2336] border-[#2c3b5b] text-slate-300 hover:bg-[#212d45]'
                      }`}
                    >
                      📝 Conventional Commits / General
                    </button>
                  </div>
                </div>

                {/* Script Code Editor */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      Script Bash para <code className="text-amber-300 bg-[#0c101a] px-1.5 py-0.5 rounded border border-[#1e2a42]">.git/hooks/{selectedHook}</code>:
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans">Atribuído automaticamente permissão +x (executável)</span>
                  </div>

                  <textarea
                    value={hookScript}
                    onChange={(e) => setHookScript(e.target.value)}
                    rows={8}
                    className="w-full bg-[#0a0e17] border border-[#23314b] text-slate-100 p-3 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
                  />
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInstallHook}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t(language, 'installHookBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestHook}
                      disabled={isTestingHook}
                      className="bg-[#1c283f] hover:bg-[#283857] text-cyan-300 border border-[#31466e] px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                      <Play className={`w-4 h-4 text-cyan-400 ${isTestingHook ? 'animate-spin' : ''}`} />
                      <span>{t(language, 'testHookBtn')}</span>
                    </button>
                  </div>

                  {installedHooks.includes(selectedHook) && (
                    <button
                      type="button"
                      onClick={handleRemoveHook}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/60 border border-red-900/50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover Hook</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Test Output Box */}
              {hookTestOutput && (
                <div className="bg-[#0b0e17] border border-[#23314b] rounded-xl p-4 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs border-b border-[#1b263b] pb-2">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Resultado do Teste no Terminal:
                    </span>
                    <button
                      onClick={() => setHookTestOutput(null)}
                      className="text-slate-500 hover:text-slate-300 text-[11px]"
                    >
                      Limpar Saída
                    </button>
                  </div>
                  <pre className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {hookTestOutput}
                  </pre>
                </div>
              )}

              {/* Installed Hooks Overview */}
              <div className="bg-[#131a29] border border-[#232f48] p-4 rounded-xl space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs text-slate-200">
                  <span className="font-bold flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Hooks Ativos Detectados em .git/hooks/:
                  </span>
                  <button
                    onClick={loadInstalledHooks}
                    className="text-slate-400 hover:text-slate-200 text-[11px] underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Atualizar
                  </button>
                </div>

                {installedHooks.length === 0 ? (
                  <div className="text-slate-500 text-xs font-sans italic py-2">
                    Nenhum script de Git Hook personalizado instalado ainda em .git/hooks/. Escolha um modelo acima para instalar!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {installedHooks.map((h) => (
                      <span
                        key={h}
                        className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-[#141b29] border border-[#232f48] p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Configurar GitHub Personal Access Token (PAT)
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Para clonar repositórios privados e fazer push, gere um token em <strong>GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens (Classic or Fine-grained)</strong> com os escopos <code className="text-red-400">repo</code> e <code className="text-red-400">user</code>.
                </p>

                <div className="space-y-2">
                  <input
                    type="password"
                    value={patInput}
                    onChange={(e) => setPatInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx ou github_pat_..."
                    className="w-full bg-[#0d1320] border border-[#273550] focus:border-red-500 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-400 hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>Gerar Token no GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={handleSaveToken}
                    className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar & Autenticar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

