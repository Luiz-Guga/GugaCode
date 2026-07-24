import { GitBlameLine } from '../types';

export function getGitBlameForLine(filePath: string, lineIndex: number, lineText: string): GitBlameLine {
  // Deterministic seed based on path, line index and content
  let hashSeed = 0;
  const str = `${filePath}:${lineIndex}:${lineText.trim()}`;
  for (let i = 0; i < str.length; i++) {
    hashSeed = (hashSeed * 31 + str.charCodeAt(i)) % 1000000;
  }

  const authors = [
    'Guga Dev',
    'Claude AI',
    'Luiz Antunes',
    'Nobara Bot',
    'Fedora Maintainer',
    'GugaCode AI',
  ];

  const dates = [
    'há 15 min',
    'há 2 horas',
    'há 5 horas',
    'há 1 dia',
    'há 2 dias',
    'há 4 dias',
    'há 1 semana',
    'há 2 semanas',
    'há 1 mês',
  ];

  const commits = [
    '8f3a1e2',
    'a7c49f0',
    'e2b810d',
    'c5d2e9a',
    'f9104ac',
    '3d780ef',
    '9b2c5e1',
    '4e8f12a',
    '7b102cd',
  ];

  const messages = [
    'feat: implement workspace search',
    'refactor: syntax highlighter updates',
    'fix: light mode color contrast',
    'style: UI polish & layout rhythm',
    'docs: update tutorial modal',
    'perf: optimize render tree',
    'chore: update dependencies',
  ];

  const author = authors[hashSeed % authors.length];
  const date = dates[(hashSeed + lineIndex) % dates.length];
  const commitHash = commits[(hashSeed + lineIndex * 3) % commits.length];
  const message = messages[(hashSeed + lineIndex * 7) % messages.length];

  return {
    author,
    date,
    commitHash,
    message,
  };
}
