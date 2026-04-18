import { NextRequest, NextResponse } from 'next/server';
import { classifyRequest } from '@/lib/classifier';
import { CREDIT_COSTS, PLATFORM_LABELS, PLATFORM_MODEL_MAP, getSmartModel } from '@/lib/credits';
import { buildSystemPrompt } from '@/lib/buildSystemPrompt';
import { agentSkills } from '@/lib/agent-skills';
import { getBrainContext } from '@/lib/brain/context';
import { heroAgents } from '@/lib/agents';

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
    const classification = classifyRequest(
      typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage),
      hasImageAttachment,
      hasVideoAttachment
    )
    const requestType = classification.requestType

    // If ambiguous — return clarification options instead of processing
    if (classification.needsClarification && classification.clarificationOptions) {
      const clarificationText = `CLARIFICATION_OPTIONS:${classification.clarificationOptions.join('|')}`
      const result = await streamText({
        model: openrouter('anthropic/claude-3-haiku'),
        system: 'Return ONLY the exact text provided to you. Do not change anything.',
        messages: [{ role: 'user', content: clarificationText }],
        maxTokens: 100,
      })
      return result.toDataStreamResponse()
    }
    const creditCost   = CREDIT_COSTS[requestType];

    // 2. Check agent routing override
    const heroAgentsList = heroAgents[heroSlug as keyof typeof heroAgents] || [];
    const agentDef = heroAgentsList.find(a => a.id === agent || a.name.toLowerCase() === agent.toLowerCase());
    const agentKey     = `${heroSlug}-${agent}`;
    const agentSkill   = agentSkills[agentKey];
    const messageText  = typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage);
    const modelToUse   = agentDef?.preferredModel || (agentSkill as { routingOverride?: string } | undefined)?.routingOverride || getSmartModel(requestType, messageText, null);

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

    // Route browser_control requests to orbit-browser-service
    if (requestType === 'browser_control') {
      const browserServiceUrl = process.env.BROWSER_SERVICE_URL || 'https://orbit-browser.up.railway.app';
      const browserApiKey = process.env.BROWSER_SERVICE_KEY || '';
      const instruction = typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage);

      try {
        const browserRes = await fetch(`${browserServiceUrl}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': browserApiKey,
          },
          body: JSON.stringify({
            instruction,
            session_id: heroSlug || 'default',
            timeout: 25000,
          }),
          signal: AbortSignal.timeout(28000),
        });

        if (!browserRes.ok) {
          throw new Error(`Browser service returned ${browserRes.status}`);
        }

        const browserData = await browserRes.json();

        // Deduct credits
        if (user) {
          const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          await supabaseAdmin
            .from('profiles')
            .update({ credits: Math.max(0, profileCredits - 25) })
            .eq('id', user.id);
        }

        return NextResponse.json({
          type: 'browser_result',
          success: browserData.success ?? true,
          screenshot: browserData.screenshot || null,
          url: browserData.current_url || browserData.url || null,
          action: browserData.action_taken || instruction,
          result: browserData.result || browserData.output || 'Action completed.',
          steps: browserData.steps || [],
        });

      } catch (browserErr) {
        // Service not yet deployed — return a pending state
        const isParked = !process.env.BROWSER_SERVICE_URL;
        return NextResponse.json({
          type: 'browser_result',
          success: false,
          screenshot: null,
          url: null,
          action: instruction,
          result: isParked
            ? 'Browser Agent is not yet deployed. Railway deployment pending — set BROWSER_SERVICE_URL env var to activate.'
            : `Browser service error: ${String(browserErr)}`,
          steps: [],
        });
      }
    }

    // 4. Build system prompt from agent skill
    let systemPrompt = buildSystemPrompt(agent || '', heroSlug);
    systemPrompt = sanitizeForFetch(systemPrompt + ARTIFACT_SYSTEM_SUFFIX);

    // Inject Khemet Brain context
    if (user) {
      const brainContext = await getBrainContext(user.id)
      if (brainContext) {
        systemPrompt = (systemPrompt || '') + brainContext
      }
    }

    // Route Image generation
    if (requestType === 'image_generation') {
      const prompt = typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage)

      try {
        // Use xAI Grok Aurora directly — NOT through OpenRouter
        const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url',
          }),
        })

        const imageData = await imageRes.json()
        const imageUrl = imageData?.data?.[0]?.url || ''

        if (!imageUrl) {
          const errorResult = await streamText({
            model: openrouter('anthropic/claude-3-haiku'),
            system: 'You are a helpful assistant.',
            messages: [{ role: 'user', content: 'Say exactly: Image generation failed. Please try again.' }],
            maxTokens: 50,
          })
          return errorResult.toDataStreamResponse()
        }

        if (user) {
          await supabaseAdmin.from('profiles').update({ credits: profileCredits - creditCost }).eq('id', user.id)
        }

        const imageMarkdown = `![Generated Image](${imageUrl})\n\n*Generated with Grok Aurora — ${prompt.slice(0, 60)}*`

        const result = await streamText({
          model: openrouter('anthropic/claude-3-haiku'),
          system: 'Return ONLY the exact text provided to you. Do not change, add, or remove anything.',
          messages: [{ role: 'user', content: imageMarkdown }],
          maxTokens: 500,
        })

        return result.toDataStreamResponse()

      } catch (error) {
        console.error('Image generation error:', error)
        const result = await streamText({
          model: openrouter('anthropic/claude-3-haiku'),
          system: 'You are a helpful assistant.',
          messages: [{ role: 'user', content: 'Say exactly: Image generation encountered an error. Please try again.' }],
          maxTokens: 50,
        })
        return result.toDataStreamResponse()
      }
    }

    // 5. Route Perplexity requests directly to Perplexity API
    if (requestType === 'research' || requestType === 'website_analysis') {
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
      })
      const perplexityData = await perplexityRes.json()
      const content = perplexityData?.output?.find((b: { type: string }) => b.type === 'message')?.content?.[0]?.text || 'No research results found.'

      if (user) {
        await supabaseAdmin.from('profiles').update({ credits: profileCredits - creditCost }).eq('id', user.id)
      }

      const result = await streamText({
        model: openrouter('anthropic/claude-3-haiku'),
        system: 'Return ONLY the text provided to you in the user message. Do not add, remove, or change anything.',
        messages: [{ role: 'user', content }],
        maxTokens: 4000,
      })

      return result.toDataStreamResponse()
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


    // Fire-and-forget memory extraction (non-blocking)
    if (user && messages.length >= 2) {
      const memoryMessages = messages.slice(-6).map((m: { role: string; content: unknown }) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      }))
      fetch('https://orbit-of-khemet.vercel.app/api/brain/extract-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: memoryMessages, userId: user.id }),
      }).catch(() => {})
    }

    return response;

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}