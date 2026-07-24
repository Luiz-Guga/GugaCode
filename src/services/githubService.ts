import { GitHubRepo, GitHubUser, ProjectFile } from '../types';

export class GitHubService {
  /**
   * Fetches the user profile from GitHub API
   */
  static async getUserProfile(token?: string): Promise<{ success: boolean; user?: GitHubUser; error?: string }> {
    try {
      const res = await fetch('/api/github/user', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Falha ao autenticar no GitHub' };
      }
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de conexão com o GitHub' };
    }
  }

  /**
   * Lists repositories for the authenticated user or public search
   */
  static async getUserRepos(token?: string): Promise<{ success: boolean; repos: GitHubRepo[]; error?: string }> {
    try {
      const res = await fetch('/api/github/repos', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, repos: [], error: data.error || 'Não foi possível carregar repositórios' };
      }
      return { success: true, repos: data.repos || [] };
    } catch (err: any) {
      return { success: false, repos: [], error: err.message };
    }
  }

  /**
   * Clones a repository into the active Nobara Code workspace
   */
  static async cloneRepository(repoUrl: string, token?: string): Promise<{ success: boolean; project?: ProjectFile; error?: string; repoName?: string }> {
    try {
      const res = await fetch('/api/github/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ repoUrl, token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Erro ao clonar repositório' };
      }
      return { success: true, project: data.project, repoName: data.repoName };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Pulls latest commits from GitHub repository
   */
  static async pullRepository(repoUrl?: string, token?: string): Promise<{ success: boolean; project?: ProjectFile; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/github/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ repoUrl, token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Erro ao puxar alterações (git pull)' };
      }
      return { success: true, project: data.project, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Pushes current workspace state to GitHub
   */
  static async pushRepository(repoUrl: string, commitMessage: string, token?: string): Promise<{ success: boolean; message?: string; commitUrl?: string; error?: string }> {
    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ repoUrl, commitMessage, token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Erro ao realizar push para o GitHub' };
      }
      return { success: true, message: data.message, commitUrl: data.commitUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
