import React, { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-yaml';
import { getGitBlameForLine } from '../utils/gitBlame';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  themeMode?: string;
  showLineNumbers?: boolean;
  showGitBlame?: boolean;
  filePath?: string;
  className?: string;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language = 'javascript',
  themeMode = 'dark-nobara',
  showLineNumbers = false,
  showGitBlame = false,
  filePath = 'file.ts',
  className = '',
}) => {
  const isLight = themeMode === 'light-fedora';

  const normalizedLang = useMemo(() => {
    const lang = (language || 'javascript').toLowerCase();
    if (lang === 'js') return 'javascript';
    if (lang === 'ts') return 'typescript';
    if (lang === 'py') return 'python';
    if (lang === 'rs') return 'rust';
    if (lang === 'sh' || lang === 'shell' || lang === 'zsh') return 'bash';
    if (Prism.languages[lang]) return lang;
    return 'javascript';
  }, [language]);

  const highlightedHtml = useMemo(() => {
    try {
      const grammar = Prism.languages[normalizedLang] || Prism.languages.javascript;
      return Prism.highlight(code, grammar, normalizedLang);
    } catch (e) {
      // Fallback to plain escaped text if parsing fails
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [code, normalizedLang]);

  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <div
      className={`font-mono text-xs overflow-x-auto leading-relaxed ${
        isLight
          ? 'prism-light text-slate-900 bg-slate-50'
          : 'prism-dark text-slate-100 bg-[#0a0d14]'
      } ${className}`}
    >
      {showLineNumbers ? (
        <div className="flex">
          {/* Line Numbers Column */}
          <div
            className={`select-none text-right pr-3 pl-2 py-3 border-r shrink-0 text-[11px] leading-relaxed ${
              isLight
                ? 'bg-slate-200/80 text-slate-400 border-slate-300'
                : 'bg-[#06080d] text-slate-600 border-[#1a2336]'
            }`}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Git Blame Gutter Column */}
          {showGitBlame && (
            <div
              className={`select-none py-3 px-2 border-r shrink-0 text-[10px] leading-relaxed w-48 sm:w-56 font-mono ${
                isLight
                  ? 'bg-slate-100/90 text-slate-600 border-slate-300'
                  : 'bg-[#090d16] text-slate-400 border-[#1b253b]'
              }`}
            >
              {lines.map((lineText, i) => {
                const blame = getGitBlameForLine(filePath, i, lineText);
                return (
                  <div
                    key={i}
                    className="truncate flex items-center justify-between gap-1 h-[1.375rem] px-1 hover:bg-emerald-500/10 rounded transition-colors"
                    title={`${blame.commitHash} • ${blame.author}: ${blame.message} (${blame.date})`}
                  >
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                      {blame.author}
                    </span>
                    <span className="text-[9px] opacity-70 shrink-0 font-sans">
                      {blame.date}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <pre className="p-3 flex-1 overflow-x-auto m-0">
            <code
              className={`language-${normalizedLang}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      ) : (
        <pre className="p-3.5 m-0 overflow-x-auto">
          <code
            className={`language-${normalizedLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      )}
    </div>
  );
};
