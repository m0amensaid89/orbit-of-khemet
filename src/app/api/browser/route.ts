import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

// S47Q-02: Extend Vercel function timeout to 90s (default 60s on Pro).
// Browser Read Mode does AI plan + up to 2 page fetches + AI synthesis,
// which can total 30-70 seconds on slower targets.
export const maxDuration = 90;
export const runtime = 'nodejs';

// S48Q-03: Browser Read Mode is a billable skill (browser_control = 25 GE)
const BROWSER_GE_COST = 25;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
    'X-Title': 'Orbit of Khemet -- Empire Engine',
  },
});

async function fetchPageContent(url: string): Promise<{ title: string; content: string; finalUrl: string }> {
  // Use Jina.ai reader — free, no API key needed, works on any URL
  const jinaUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(jinaUrl, {
    headers: { 'Accept': 'text/plain' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const text = await res.text();
  // First line is usually the title
  const lines = text.split('\n');
  const title = lines[0]?.replace(/^Title:\s*/i, '').trim() || url;
  return { title, content: text.slice(0, 8000), finalUrl: url };
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // S48Q-03: Credit gate before doing expensive work
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('credits, tier').eq('id', user.id).single();

    const currentCredits = profile?.credits ?? 0;
    if (currentCredits < BROWSER_GE_COST) {
      return NextResponse.json({
        error: 'Insufficient credits',
        creditsRequired: BROWSER_GE_COST,
        creditsAvailable: currentCredits,
      }, { status: 402 });
    }

    const { task, url } = await req.json();
    if (!task) return NextResponse.json({ error: 'task is required' }, { status: 400 });

    const steps: string[] = [];

    // Step 1: Plan what URLs to visit
    steps.push('Planning navigation steps...');
    const { text: planText } = await generateText({
      model: openrouter('google/gemini-2.5-flash'),
      prompt: `You are a web navigation agent. The user wants: "${task}"${url ? ` Starting URL: ${url}` : ''}.

List up to 2 URLs to visit to complete this task. Return ONLY a JSON array of URL strings.
Example: ["https://example.com", "https://example.com/about"]
Return only valid, publicly accessible URLs.`,
      maxTokens: 500,
    });

    let urlsToVisit: string[] = [];
    try {
      const cleaned = planText.replace(/```json\n?|\n?```/g, '').trim();
      urlsToVisit = JSON.parse(cleaned);
      if (!Array.isArray(urlsToVisit)) urlsToVisit = url ? [url] : [];
    } catch {
      urlsToVisit = url ? [url] : [];
    }

    // Step 2: Visit each URL and collect content (capped at 2 to stay within 90s timeout)
    const pageResults: { url: string; title: string; content: string }[] = [];
    for (const visitUrl of urlsToVisit.slice(0, 2)) {
      try {
        steps.push(`Reading: ${visitUrl}`);
        const page = await fetchPageContent(visitUrl);
        pageResults.push({ url: visitUrl, title: page.title, content: page.content });
      } catch (e) {
        steps.push(`Failed to read: ${visitUrl}`);
      }
    }

    // Step 3: Synthesize with AI
    steps.push('Synthesizing results...');
    const context = pageResults.map(p =>
      `=== ${p.title} (${p.url}) ===\n${p.content}`
    ).join('\n\n---\n\n');

    const { text: finalAnswer } = await generateText({
      model: openrouter('openai/gpt-4o:online'),
      system: 'You are a web research agent. Synthesize the fetched page content to answer the user task. Be specific, cite the pages you found information on.',
      prompt: `Task: ${task}\n\nFetched content:\n${context}\n\nProvide a comprehensive answer based on the above content.`,
      maxTokens: 3000,
    });

    // S48Q-03: Deduct credits after successful synthesis
    await supabaseAdmin
      .from('profiles')
      .update({ credits: currentCredits - BROWSER_GE_COST })
      .eq('id', user.id);

    // S48Q-03: write usage event for audit trail
    try {
      await supabaseAdmin.from('usage_events').insert({
        user_id: user.id,
        event_type: 'browser_read',
        energy_cost: BROWSER_GE_COST,
        metadata: { task: task?.slice(0, 200), urlsVisited: pageResults.length },
      });
    } catch (trackErr) {
      console.error('[browser] usage_events write failed:', trackErr);
    }

    return NextResponse.json({
      success: true,
      task,
      visitedUrls: pageResults.map(p => ({ url: p.url, title: p.title })),
      steps,
      answer: finalAnswer,
      finalUrl: urlsToVisit[0] || url || '',
      finalTitle: pageResults[0]?.title || '',
      creditsUsed: BROWSER_GE_COST,
      creditsRemaining: currentCredits - BROWSER_GE_COST,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message, success: false, task: '' }, { status: 500 });
  }
}
