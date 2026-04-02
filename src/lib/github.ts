import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface RepoFile {
  path: string;
  content: string;
  size: number;
}

export interface RepoInfo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  defaultBranch: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.replace(/\.git$/, '').replace(/\/$/, '');
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

export async function getRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const { data } = await octokit.repos.get({ owner, repo });
  return {
    name: data.full_name,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    forks: data.forks_count,
    topics: data.topics || [],
    defaultBranch: data.default_branch,
  };
}

export async function getRepoTree(owner: string, repo: string, branch: string): Promise<string[]> {
  const { data } = await octokit.git.getTree({
    owner, repo,
    tree_sha: branch,
    recursive: '1',
  });

  const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.css', '.html', '.md', '.json', '.yaml', '.yml', '.env.example', '.sql'];

  return (data.tree || [])
    .filter(f => f.type === 'blob' && f.path)
    .filter(f => !skipDirs.some(d => f.path!.includes(d)))
    .filter(f => codeExtensions.some(ext => f.path!.endsWith(ext)))
    .filter(f => (f.size || 0) < 100000)
    .map(f => f.path!)
    .slice(0, 50);
}

export async function getFileContent(owner: string, repo: string, path: string): Promise<string> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if ('content' in data && data.content) {
      return Buffer.from(data.content as string, 'base64').toString('utf-8');
    }
    return '';
  } catch {
    return '';
  }
}

export async function getKeyFiles(owner: string, repo: string, allPaths: string[]): Promise<RepoFile[]> {
  const priority = ['README.md', 'package.json', 'tsconfig.json', 'next.config', 'src/app/layout', 'src/app/page', 'src/lib/', 'src/components/'];

  const prioritized = allPaths.sort((a, b) => {
    const aScore = priority.findIndex(p => a.includes(p));
    const bScore = priority.findIndex(p => b.includes(p));
    if (aScore === -1 && bScore === -1) return 0;
    if (aScore === -1) return 1;
    if (bScore === -1) return -1;
    return aScore - bScore;
  }).slice(0, 20);

  const files: RepoFile[] = [];
  for (const path of prioritized) {
    const content = await getFileContent(owner, repo, path);
    if (content) {
      files.push({ path, content: content.slice(0, 3000), size: content.length });
    }
  }
  return files;
}