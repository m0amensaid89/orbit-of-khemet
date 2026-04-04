import { NextRequest } from 'next/server';
import { heroMeta, heroAgents, masterSystemPrompt, getAgentModel } from '@/lib/agents';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getHero } from '@/lib/heroes';
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

// ─── Image request detection ───────────────────────────────────────────────
const IMAGE_TRIGGERS = ['draw','generate an image','create an image','make an image','illustrate','visualize','design a logo','create a logo','generate a logo','make a banner','create a poster','generate a visual','create artwork','paint','sketch me'];
function isImageRequest(msg: string): boolean {
  return IMAGE_TRIGGERS.some(t => msg.toLowerCase().includes(t));
}

function detectImageComplexity(msg: string): 'simple' | 'detailed' | 'complex' {
  const lower = msg.toLowerCase();
  const complexSignals = ['photorealistic','8k','hyper detailed','cinematic','full scene','landscape','architecture','product render','professional'];
  const detailedSignals = ['character','portrait','logo','banner','poster','illustration','concept art'];
  if (complexSignals.some(s => lower.includes(s))) return 'complex';
  if (detailedSignals.some(s => lower.includes(s))) return 'detailed';
  return 'simple';
}

function selectImageModel(complexity: 'simple' | 'detailed' | 'complex'): string {
  if (complexity === 'simple') return 'google/gemini-2.5-flash-exp-image-generation';
  if (complexity === 'detailed') return 'google/gemini-2.5-flash-exp-image-generation';
  return 'openai/gpt-image-1';
}

// ─── Task type detection ───────────────────────────────────────────────────
type TaskType = 'coding' | 'reasoning' | 'creative' | 'analysis' | 'vision' | 'tool_calling' | 'simple' | 'general';
type Complexity = 'simple' | 'medium' | 'complex';

interface TaskProfile {
  taskType: TaskType;
  complexity: Complexity;
  model: string;
  maxTokens: number;
  providerSort: 'throughput' | 'price' | 'latency';
  maxPrice?: { prompt: number; completion: number };
}

function detectTaskType(msg: string): TaskType {
  const lower = msg.toLowerCase();
  const codingSignals = ['code','debug','function','script','implement','refactor','api','component','typescript','python','javascript','sql','bug','error','fix this code'];
  const reasoningSignals = ['analyze','reasoning','logic','prove','derive','mathematical','scientific','research','evaluate','assessment','due diligence'];
  const creativeSignals = ['write','story','blog','email','caption','copy','headline','tagline','creative','marketing','social media post','newsletter'];
  const analysisSignals = ['analyze','report','data','metrics','kpi','forecast','compare','strategy','business plan','proposal','audit','review'];
  const simpleSignals = ['hi','hello','hey','thanks','ok','yes','no','what is','define','translate','calculate','convert','format','fix grammar'];

  if (codingSignals.some(s => lower.includes(s))) return 'coding';
  if (reasoningSignals.some(s => lower.includes(s))) return 'reasoning';
  if (analysisSignals.some(s => lower.includes(s))) return 'analysis';
  if (creativeSignals.some(s => lower.includes(s))) return 'creative';
  if (simpleSignals.some(s => lower.includes(s) || lower === s)) return 'simple';
  return 'general';
}

function detectComplexity(msg: string, convLen: number): Complexity {
  const words = msg.split(/\s+/).length;
  const complexSignals = ['comprehensive','detailed','full','enterprise','architecture','multi-step','advanced','complete','entire'];
  if (words > 100 || complexSignals.some(s => msg.toLowerCase().includes(s))) return 'complex';
  if (words > 30 || convLen > 10) return 'medium';
  return 'simple';
}

function needsWebSearch(msg: string): boolean {
  const lower = msg.toLowerCase();
  const signals = [
    'today','right now','currently','latest','recent','news','this week',
    'this month','2025','2026','stock price','weather','exchange rate',
    'live','real-time','search for','look up','find me','check',
    'who is','what happened','when did','where is','research',
    'find information','tell me about',
  ];
  return signals.some(s => lower.includes(s));
}

// ─── Model selection matrix ────────────────────────────────────────────────
function selectModel(
  taskType: TaskType,
  complexity: Complexity,
  heroSlug: string,
  agentModel?: string,
  webSearch?: boolean
): { model: string; maxTokens: number; providerSort: 'throughput' | 'price' | 'latency'; maxPrice?: { prompt: number; completion: number } } {

  const applyOnline = (m: string): string => {
    if (!webSearch) return m;
    if (m.startsWith('xiaomi/') || m.startsWith('openrouter/')) return m;
    return m.includes(':') ? m : `${m}:online`;
  };

  // Agent has explicit model assignment — use it
  if (agentModel && agentModel !== 'google/gemini-2.5-flash') {
    return {
      model: applyOnline(agentModel),
      maxTokens: 6000,
      providerSort: 'throughput',
    };
  }

  // Simple tasks — fast + cheap
  if (taskType === 'simple') {
    return { model: applyOnline('google/gemini-2.5-flash'), maxTokens: 1000, providerSort: 'latency' };
  }

  // Coding tasks
  if (taskType === 'coding') {
    if (complexity === 'complex') {
      return { model: applyOnline('anthropic/claude-sonnet-4-5'), maxTokens: 8000, providerSort: 'throughput' };
    }
    return { model: applyOnline('openai/gpt-4o'), maxTokens: 4000, providerSort: 'throughput' };
  }

  // Reasoning tasks — MiMo-V2
  if (taskType === 'reasoning') {
    return {
      model: applyOnline(complexity === 'complex' ? 'xiaomi/mimo-v2-pro' : 'xiaomi/mimo-v2-flash'),
      maxTokens: complexity === 'complex' ? 8000 : 4000,
      providerSort: 'throughput',
    };
  }

  // Vision tasks
  if (taskType === 'vision') {
    return { model: applyOnline('xiaomi/mimo-v2-omni'), maxTokens: 4000, providerSort: 'throughput' };
  }

  // Analysis tasks
  if (taskType === 'analysis') {
    return {
      model: applyOnline(complexity === 'complex' ? 'anthropic/claude-sonnet-4-5' : 'openai/gpt-4o'),
      maxTokens: complexity === 'complex' ? 8000 : 4000,
      providerSort: 'throughput',
    };
  }

  // Creative tasks
  if (taskType === 'creative') {
    return { model: applyOnline('google/gemini-2.5-flash'), maxTokens: 4000, providerSort: 'throughput' };
  }

  // Hero-based routing for general tasks
  const heroRouting: Record<string, string> = {
    thoren:  'anthropic/claude-sonnet-4-5',  // Legal, Finance
    ramet:   'openai/gpt-4o',                // Operations
    nexar:   'xiaomi/mimo-v2-pro',           // Transformation — deep reasoning
    lyra:    'google/gemini-2.5-flash',      // Content — creative
    kairo:   'google/gemini-2.5-flash',      // Social — fast
    nefra:   'openai/gpt-4o',               // Experience
    horusen: 'openai/gpt-4o',              // Revenue
  };

  if (heroSlug === 'master') {
    return { model: applyOnline('openrouter/auto'), maxTokens: 6000, providerSort: 'throughput' };
  }

  return {
    model: applyOnline(heroRouting[heroSlug] || 'openrouter/auto'),
    maxTokens: complexity === 'complex' ? 4000 : 2000,
    providerSort: 'throughput',
  };
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
    const wantsImage = isImageRequest(lastMessage);

    // Detect task profile
    const taskType = detectTaskType(lastMessage);
    const complexity = detectComplexity(lastMessage, messages.length);
    const webSearch = needsWebSearch(lastMessage);

    // Get user
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    // Get user plan from profile
    let userPlan = 'explorer';
    if (user) {
      try {
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile?.plan) userPlan = profile.plan;
      } catch { /* use default */ }
    }

    // Get agent model if agent selected
    let agentData = null;
    let agentModel: string | undefined;
    if (agent && !agent.startsWith('custom_')) {
      const heroAgentList = heroAgents[heroSlug as keyof typeof heroAgents] || [];
      agentData = heroAgentList.find((a) => a.id === agent) || null;
      if (agentData) {
        agentModel = getAgentModel(agentData);
      }
    }

    // Select model
    let model: string;
    let maxTokens: number;
    let providerSort: 'throughput' | 'price' | 'latency';
    let maxPrice: { prompt: number; completion: number } | undefined;
    let modalities: string[] | undefined;
    let imgComplexity = 'none';

    if (wantsImage) {
      const detectedImgComplexity = detectImageComplexity(lastMessage);
      imgComplexity = detectedImgComplexity;
      model = selectImageModel(detectedImgComplexity);
      maxTokens = detectedImgComplexity === 'complex' ? 4000 : 2000;
      providerSort = 'throughput';
      modalities = ['image', 'text'];
    } else {
      const selected = selectModel(taskType, complexity, heroSlug, agentModel, webSearch);
      model = selected.model;
      maxTokens = selected.maxTokens;
      providerSort = selected.providerSort;
      maxPrice = selected.maxPrice;
    }

    // Build system prompt
    const heroConfig = getHero(heroSlug);
    const heroMetaData = heroMeta[heroSlug as keyof typeof heroMeta];
    let systemPrompt = heroConfig?.systemPrompt || masterSystemPrompt;

    // Inject agent-specific system prompt
    if (agentData) {
      if (agentData.prompt) {
        systemPrompt = `${masterSystemPrompt}\n\n--- ACTIVE AGENT: ${agentData.name} ---\nRole: ${agentData.role_summary}\n${agentData.prompt}`;
      } else {
        systemPrompt = `${masterSystemPrompt}\n\n--- ACTIVE AGENT: ${agentData.name} ---\nRole: ${agentData.role_summary}\nCategory: ${agentData.category}\nDescription: ${agentData.description}\n\nYou are ${agentData.name}, a specialized agent. Respond strictly within your domain: ${agentData.role_summary}. Be precise, authoritative, and deliver immediately actionable outputs.`;
      }
    }

    systemPrompt = sanitizeForFetch(systemPrompt + ARTIFACT_SYSTEM_SUFFIX);

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
      sort: providerSort,
      allow_fallbacks: true,
      data_collection: 'deny',
      zdr: true,
      order: ['anthropic', 'openai', 'google', 'deepseek', 'xiaomi'],
      ...(isMiMo ? { enable_thinking: true } : {}),
    };

    if (maxPrice) {
      providerOptions.max_price = maxPrice;
    }

    // Stream response
    const modelMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const result = await streamText({
      model: openrouter(model),
      system: systemPrompt,
      messages: modelMessages,
      maxTokens,
      temperature: taskType === 'creative' ? 0.8 : 0.3,
      experimental_providerMetadata: {
        openrouter: providerOptions,
      },
      onFinish: async ({ text }) => {
        if (user && activeThreadId) {
          try {
            const supabaseAdmin = createSupabaseClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
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
    response.headers.set('X-Task-Type', taskType);
    response.headers.set('X-Complexity', complexity);
    response.headers.set('X-Web-Search', webSearch ? 'true' : 'false');
    response.headers.set('X-Image-Complexity', wantsImage ? imgComplexity : 'none');

    return response;

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}