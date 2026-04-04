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

    const { repoUrl, task, appIdea, platform } = await req.json();

    // ─── APP BUILDER MODE ──────────────────────────────────────────────────
    if (appIdea && !repoUrl) {
      const isWebsite = !platform || platform === 'website';

      const buildPrompt = isWebsite
        ? `Build a complete, production-ready website for: ${appIdea}

REQUIREMENTS:
- Output ONE single complete HTML file with all CSS and JavaScript inline
- Modern design: use CSS custom properties, smooth animations, glassmorphism or dark gradient theme
- Fully responsive (mobile-first)
- Interactive and functional
- Professional navigation, hero section, features, CTA, footer
- Use real placeholder content relevant to the idea
- Include hover effects and micro-animations
- Start with <!DOCTYPE html> — output ONLY the HTML, no markdown`
        : `Create a detailed mobile app specification and wireframe description for: ${appIdea}

Include: user flow, screen descriptions, key features, tech stack recommendation, MVP scope.`;

      const { text } = await generateText({
        model: openrouter('anthropic/claude-sonnet-4-5'),
        system: 'You are an elite full-stack developer and designer. You build stunning, complete, production-ready web applications from a single description.',
        prompt: buildPrompt,
        maxTokens: 12000,
      });

      const result = isWebsite
        ? text.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim()
        : text;

      return Response.json({
        mode: 'app_builder',
        platform: platform || 'website',
        result,
        appIdea,
      });
    }

    // ─── SENTINEL MODE (existing code, keep unchanged) ────────────────────
    if (!repoUrl) return Response.json({ error: 'Missing repoUrl or appIdea' }, { status: 400 });

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
