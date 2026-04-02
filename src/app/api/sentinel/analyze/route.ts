import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { parseGitHubUrl, getRepoInfo, getRepoTree, getKeyFiles } from '@/lib/github';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
    'X-Title': 'Orbit of Khemet -- Empire Engine',
  },
});

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { repoUrl, task } = await req.json();
    if (!repoUrl) return Response.json({ error: 'Missing repoUrl' }, { status: 400 });

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) return Response.json({ error: 'Invalid GitHub URL' }, { status: 400 });

    const { owner, repo } = parsed;

    const [repoInfo, filePaths] = await Promise.all([
      getRepoInfo(owner, repo),
      getRepoTree(owner, repo, 'HEAD'),
    ]);

    const keyFiles = await getKeyFiles(owner, repo, filePaths);

    const fileContext = keyFiles.map(f =>
      `=== ${f.path} ===\n${f.content}`
    ).join('\n\n');

    const systemPrompt = `You are Code Sentinel, an elite AI code analyst operating within the Orbit of Khemet Empire Engine. You analyze repositories with precision and deliver actionable insights.

Repository: ${repoInfo.name}
Description: ${repoInfo.description || 'No description'}
Primary Language: ${repoInfo.language || 'Unknown'}
Stars: ${repoInfo.stars} | Forks: ${repoInfo.forks}
Topics: ${repoInfo.topics.join(', ') || 'None'}

File Structure (${filePaths.length} files total):
${filePaths.slice(0, 30).join('\n')}

Key File Contents:
${fileContext}`;

    const userTask = task || 'Provide a comprehensive analysis of this repository including: architecture overview, tech stack, code quality observations, potential improvements, and security considerations.';

    const { text } = await generateText({
      model: openrouter('anthropic/claude-sonnet-4-5'),
      system: systemPrompt,
      prompt: userTask,
      maxTokens: 6000,
    });

    return Response.json({
      analysis: text,
      repoInfo,
      fileCount: filePaths.length,
      filesAnalyzed: keyFiles.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
