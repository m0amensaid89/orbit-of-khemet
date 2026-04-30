import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { parseGitHubUrl, getRepoInfo, getRepoTree, getKeyFiles } from '@/lib/github';

// S47Q-03: GE billing was missing from Code Studio. Both App Builder + Code Review
// run claude-sonnet-4-5 on real money. App Builder uses 12k tokens, Code Review 6k.
const APP_BUILDER_GE_COST = 12; // higher because 12k maxTokens
const CODE_REVIEW_GE_COST = 9;  // 6k maxTokens, matches 'code' tier

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

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { repoUrl, task, appIdea, platform } = await req.json();

    // S47Q-03: Determine cost based on which mode is being invoked
    const geCost = (appIdea && !repoUrl) ? APP_BUILDER_GE_COST : CODE_REVIEW_GE_COST;

    // Check + reserve credits BEFORE running expensive LLM call
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    const currentCredits = profile?.credits ?? 0;
    if (currentCredits < geCost) {
      return NextResponse.json({
        error: 'insufficient_credits',
        message: 'Your Grid Energy is depleted, Architect. Recharge to continue building.',
        creditsRequired: geCost,
        creditsAvailable: currentCredits,
      }, { status: 402 });
    }

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

      // S47Q-03: Deduct after success
      await supabaseAdmin
        .from('profiles')
        .update({ credits: currentCredits - APP_BUILDER_GE_COST })
        .eq('id', user.id);

      // S48Q-02: write usage event for audit trail
      try {
        await supabaseAdmin.from('usage_events').insert({
          user_id: user.id,
          event_type: 'app_builder',
          energy_cost: APP_BUILDER_GE_COST,
          metadata: { platform: platform || 'website', appIdea: appIdea?.slice(0, 200) },
        });
      } catch (trackErr) {
        console.error('[sentinel] app_builder usage_events write failed:', trackErr);
      }

      return Response.json({
        mode: 'app_builder',
        platform: platform || 'website',
        result,
        appIdea,
        creditsUsed: APP_BUILDER_GE_COST,
        creditsRemaining: currentCredits - APP_BUILDER_GE_COST,
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

    // S47Q-03: Deduct after Code Review success
    await supabaseAdmin
      .from('profiles')
      .update({ credits: currentCredits - CODE_REVIEW_GE_COST })
      .eq('id', user.id);

    // S48Q-02: write usage event for audit trail
    try {
      await supabaseAdmin.from('usage_events').insert({
        user_id: user.id,
        event_type: 'code_review',
        energy_cost: CODE_REVIEW_GE_COST,
        metadata: { repoUrl, fileCount: filePaths.length, filesAnalyzed: keyFiles.length },
      });
    } catch (trackErr) {
      console.error('[sentinel] code_review usage_events write failed:', trackErr);
    }

    return Response.json({
      analysis: text,
      repoInfo,
      fileCount: filePaths.length,
      filesAnalyzed: keyFiles.length,
      creditsUsed: CODE_REVIEW_GE_COST,
      creditsRemaining: currentCredits - CODE_REVIEW_GE_COST,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
