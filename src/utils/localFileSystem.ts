import { ProjectFile } from '../types';

// Map to store directory and file handles in memory for direct writing back to disk
const fileHandlesMap = new Map<string, FileSystemFileHandle>();

export async function openLocalDirectory(): Promise<{ project: ProjectFile; handleCount: number } | null> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    return null;
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
    });

    fileHandlesMap.clear();

    const rootPath = `/local/${dirHandle.name}`;

    async function buildTree(handle: any, currentPath: string): Promise<ProjectFile> {
      const children: ProjectFile[] = [];

      for await (const entry of handle.values()) {
        const entryPath = `${currentPath}/${entry.name}`;
        if (entry.kind === 'directory') {
          // Skip node_modules and .git by default to keep performance snappy, but list the folder
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'target') {
            children.push({
              name: entry.name,
              path: entryPath,
              type: 'dir',
              children: [
                {
                  name: '.gitkeep',
                  path: `${entryPath}/.gitkeep`,
                  type: 'file',
                  content: `// [Conteúdo de ${entry.name} oculto para desempenho]`,
                },
              ],
            });
            continue;
          }

          const childDir = await buildTree(entry, entryPath);
          children.push(childDir);
        } else if (entry.kind === 'file') {
          fileHandlesMap.set(entryPath, entry);
          let content = '';
          try {
            const file = await entry.getFile();
            // Read text content if size <= 5MB
            if (file.size < 5000000) {
              content = await file.text();
            } else {
              content = '// [Arquivo grande - pré-visualização simplificada]';
            }
          } catch (err) {
            content = '// Erro ao ler conteúdo do arquivo local';
          }

          children.push({
            name: entry.name,
            path: entryPath,
            type: 'file',
            content,
          });
        }
      }

      // Sort directories first, then files
      children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
      });

      return {
        name: handle.name,
        path: currentPath,
        type: 'dir',
        children,
      };
    }

    const project = await buildTree(dirHandle, rootPath);
    return { project, handleCount: fileHandlesMap.size };
  } catch (err) {
    console.warn('Directory selection cancelled or error:', err);
    return null;
  }
}

export async function saveToLocalFileHandle(filePath: string, content: string): Promise<boolean> {
  const handle = fileHandlesMap.get(filePath);
  if (!handle) return false;

  try {
    const writable = await (handle as any).createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.error('Error writing to local file handle:', err);
    return false;
  }
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export function getLoadedLocalHandlesCount(): number {
  return fileHandlesMap.size;
}
