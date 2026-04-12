import { NextRequest, NextResponse } from 'next/server';
import { classifyRequest } from '@/lib/classifier';
import { CREDIT_COSTS, PLATFORM_LABELS, PLATFORM_MODEL_MAP } from '@/lib/credits';
import { buildSystemPrompt } from '@/lib/buildSystemPrompt';
import { agentSkills } from '@/lib/agent-skills';


import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, JSONValue } from 'ai';

// ─── Sanitize unicode for OpenRouter headers ───────────────────────────────
function sanitizeForFetch(text: string): string {
  return text
    .replace(/\u2014/g, '--').replace(/\u2013/g, '-')
    .replace(/\u2018/g, "'").replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"').replace(/\u201D/g, '"')
    .replace(/\u2022/g, '*').replace(/\u00A0/g, ' ');
}

// ─── OpenRouter client ─────────────────────────────────────────────────────
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
    'X-Title': 'Orbit of Khemet -- Empire Engine',
  },
});

// ─── Artifact system suffix ────────────────────────────────────────────────
const ARTIFACT_SYSTEM_SUFFIX = `\n\nWhen asked to build, create, or generate something interactive or data-based, respond with a complete working code block:\n- Web apps, calculators, dashboards: use \`\`\`html with complete standalone HTML/CSS/JS\n- Data tables: use \`\`\`csv\n- Structured data: use \`\`\`json\n- Documents: use \`\`\`markdown\nMake code complete and immediately runnable. Include all styles inline. Never truncate.`;

// ─── RAG knowledge retrieval ───────────────────────────────────────────────
async function getRelevantKnowledge(
  userMessage: string,
  userId: string,
  supabaseAdmin: SupabaseClient
): Promise<string> {
  try {
    const embRes = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: userMessage,
      }),
    });
    if (!embRes.ok) return '';
    const embData = await embRes.json();
    const embedding = embData.data?.[0]?.embedding;
    if (!embedding) return '';

    const { data: matches } = await supabaseAdmin.rpc('match_knowledge', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
      p_user_id: userId,
    });
    if (!matches?.length) return '';

    return '\n\n--- KNOWLEDGE VAULT ---\n' +
      matches.map((m: { content: string }) => m.content).join('\n\n') +
      '\n--- END KNOWLEDGE ---';
  } catch {
    return '';
  }
}

// ─── Main POST handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, hero, agent, threadId } = body;

    const heroSlug = (hero || 'master').toLowerCase();
    const lastMessage = messages[messages.length - 1]?.content || '';

    // Check if attachments exist
    const hasImageAttachment = messages[messages.length - 1]?.role === 'user' && Array.isArray(messages[messages.length - 1]?.content) ? messages[messages.length - 1].content.some((c: { type: string }) => c.type === 'image') : false;
    const hasVideoAttachment = messages[messages.length - 1]?.role === 'user' && Array.isArray(messages[messages.length - 1]?.content) ? messages[messages.length - 1].content.some((c: { type: string }) => c.type === 'video') : false;

    // 1. Classify the request
    const requestType  = classifyRequest(typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage), hasImageAttachment, hasVideoAttachment);
    const creditCost   = CREDIT_COSTS[requestType];

    // 2. Check agent routing override
    const agentKey     = `${heroSlug}-${agent}`;
    const agentSkill   = agentSkills[agentKey];
    const modelToUse   = agentSkill?.routingOverride || PLATFORM_MODEL_MAP[requestType];

    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let profileCredits = 0;
    if (user) {
      try {
        // 3. Check user credit balance
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('credits, tier')
          .eq('id', user.id)
          .single();

        if (!profile || profile.credits === null) {
          try {
            await supabaseAdmin.from('profiles').upsert({
              id: user.id,
              credits: 7000,
              tier: 'personal_basic'
            });
          } catch { /* proceed anyway */ }
          profileCredits = 7000;
        } else if (profile.credits < creditCost) {
          return NextResponse.json({
            error:            'insufficient_credits',
            message:          'Your Grid Energy is depleted, Architect. Recharge to continue building your empire.',
            creditsRequired:  creditCost,
            creditsAvailable: profile.credits,
          }, { status: 402 });
        } else {
          profileCredits = profile.credits;
        }
      } catch (creditsError) {
        console.error('Credits check failed, proceeding with default:', creditsError);
        profileCredits = 7000;
      }
    }

    // Route video requests BEFORE building system prompt
    if (['video_quick', 'video_standard', 'video_cinematic', 'video_edit'].includes(requestType)) {
      return NextResponse.json({
        type: 'video_request',
        videoType: requestType,
        prompt: typeof lastMessage === 'string' ? lastMessage : '',
        message: 'Video generation initiated. Select quality tier to proceed.',
      });
    }

    // 4. Build system prompt from agent skill
    let systemPrompt = buildSystemPrompt(agent || '', heroSlug);
    systemPrompt = sanitizeForFetch(systemPrompt + ARTIFACT_SYSTEM_SUFFIX);

    // 5. Route Perplexity requests directly to Perplexity API
    if (requestType === 'research' || requestType === 'website_analysis') {
      // Inline Perplexity call — no sub-fetch needed
      const perplexityRes = await fetch('https://api.perplexity.ai/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preset: 'fast-search',
          input: typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage),
        }),
      });
      const perplexityData = await perplexityRes.json();
      const content = perplexityData?.output?.find((b: { type: string }) => b.type === 'message')?.content?.[0]?.text || 'No response received.';

      if (user) {
        await supabaseAdmin.from('profiles').update({ credits: profileCredits - creditCost }).eq('id', user.id);
      }

      return NextResponse.json({
        content,
        platform: requestType === 'website_analysis' ? 'Perplexity Web' : 'Perplexity Research',
        requestType,
        creditsUsed: creditCost,
        creditsRemaining: profileCredits - creditCost,
        platformLabel: PLATFORM_LABELS[requestType],
      });
    }

    const model = modelToUse;

    // RAG knowledge injection
    if (user) {
      try {
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const knowledge = await getRelevantKnowledge(lastMessage, user.id, supabaseAdmin);
        if (knowledge) systemPrompt += knowledge;
      } catch { /* skip */ }
    }

    // Save thread
    let activeThreadId = threadId;
    if (user) {
      try {
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        if (!activeThreadId) {
          const title = lastMessage.slice(0, 60);
          const { data: newThread } = await supabaseAdmin
            .from('chat_threads')
            .insert({ user_id: user.id, hero_slug: heroSlug, title })
            .select('id')
            .single();
          activeThreadId = newThread?.id;
        }
        if (activeThreadId) {
          await supabaseAdmin.from('chat_messages').insert({
            thread_id: activeThreadId,
            role: 'user',
            content: lastMessage,
          });
        }
      } catch { /* skip */ }
    }

    // Build provider options
    const isMiMo = model.startsWith('xiaomi/');
    const providerOptions: Record<string, JSONValue> = {
      sort: 'throughput',
      allow_fallbacks: true,
      data_collection: 'deny',
      zdr: true,
      order: ['anthropic', 'openai', 'google', 'deepseek', 'xiaomi'],
      ...(isMiMo ? { enable_thinking: true } : {}),
    };

    // Stream response
    const modelMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const result = await streamText({
      model: openrouter(model),
      system: systemPrompt,
      messages: modelMessages,
      maxTokens: 4000,
      temperature: 0.3,
      experimental_providerMetadata: {
        openrouter: providerOptions,
      },
      onFinish: async ({ text }) => {
        if (user) {
          try {
            await supabaseAdmin.from('profiles').update({ credits: profileCredits - creditCost }).eq('id', user.id);
          } catch {}
        }
        if (user && activeThreadId) {
          try {
            await supabaseAdmin.from('chat_messages').insert({
              thread_id: activeThreadId,
              role: 'assistant',
              content: text,
              model_used: model,
            });
          } catch { /* skip */ }
        }
      },
    });

    const response = result.toDataStreamResponse();

    // Add thread ID header for client
    if (activeThreadId) {
      response.headers.set('X-Thread-Id', activeThreadId);
    }
    response.headers.set('X-Model-Used', model);
    response.headers.set('X-Credits-Used', creditCost.toString());
    response.headers.set('X-Credits-Remaining', (profileCredits - creditCost).toString());
    response.headers.set('X-Platform-Label', PLATFORM_LABELS[requestType]);

    return response;

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}