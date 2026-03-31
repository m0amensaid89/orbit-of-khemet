with open("src/app/api/chat/route.ts", "r") as f:
    text = f.read()

text = text.replace(
    "import { NextRequest } from 'next/server';\nimport { heroMeta, heroAgents, masterSystemPrompt } from '@/lib/agents';",
    "import { NextRequest } from 'next/server';\nimport { heroMeta, heroAgents, masterSystemPrompt } from '@/lib/agents';\nimport { createClient } from '@supabase/supabase-js';\nimport { getHero } from '@/lib/heroes';\nimport { createOpenRouter } from '@openrouter/ai-sdk-provider';\nimport { streamText } from 'ai';"
)

openrouter_client = """
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
    'X-Title': 'Orbit of Khemet -- Empire Engine'
  }
});
"""

text = text.replace("export async function POST(req: NextRequest) {", openrouter_client + "\nexport async function POST(req: NextRequest) {")


post_fn = """
  try {
    if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is missing');
    const body = await req.json();
    const { messages, hero, agent, customSystemPrompt } = body;
    const heroSlug = (hero || 'master').toLowerCase();
    const lastMessage = messages[messages.length - 1]?.content || '';
    const wantsImage = isImageRequest(lastMessage);
    let model: string;
    let maxTokens: number;
    let modalities: string[] | undefined;
    let tierInfo: {tier:Tier;model:string;maxTokens:number} | null = null;

    // Deduct energy first via Server Supabase Client
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const authHeader = req.headers.get('authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      if (token) {
        const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabaseAdmin.from('profiles').select('energy_balance').eq('id', user.id).single();
          if (profile && profile.energy_balance < 10) {
            throw new Error('ENERGY DEPLETED');
          }
          if (profile) {
            await supabaseAdmin.from('profiles').update({ energy_balance: Math.max(0, profile.energy_balance - 10) }).eq('id', user.id);
          }
        }
      }
    }


    if (wantsImage) {
      model = 'google/gemini-2.5-flash-exp-image-generation';
      maxTokens = 2000;
      modalities = ['image','text'];
    } else {
      tierInfo = classifyMessage(lastMessage, heroSlug, messages.length);
      model = tierInfo.model;
      maxTokens = tierInfo.maxTokens;
    }

    // Attempt to get system prompt from hero data
    let systemPrompt = masterSystemPrompt;
    const heroData = getHero(heroSlug);

    if (heroData?.systemPrompt) {
        systemPrompt = heroData.systemPrompt;
    } else if (agent?.startsWith('custom_') && customSystemPrompt) {
      systemPrompt = `${masterSystemPrompt}\\n\\n--- CUSTOM AGENT ---\\n${customSystemPrompt}`;
    } else if (heroSlug !== 'master') {
      const meta = heroMeta[heroSlug as keyof typeof heroMeta];
      const builtInAgents = heroAgents[heroSlug as keyof typeof heroAgents] || [];
      if (meta) {
        const bioExcerpt = meta.bio.split('. ').slice(0,2).join('. ')+'.';
        const agentList = builtInAgents.map(a=>`- ${a.name} (${a.category}): ${a.role_summary}`).join('\\n');
        systemPrompt += `\\n\\n--- ORBIT: ${meta.name} -- ${meta.class_title} ---\\n"${meta.quote}"\\nAdopt ${meta.name} persona. Bio: ${bioExcerpt}\\nUniverse Role: ${meta.universe_role}\\nAgents:\\n${agentList}`;
      }
    } else {
      systemPrompt += '\\n\\nYou are the MASTER ORBIT, commanding all 85 specialized agents across all 7 hero groups. Deliver elite-level responses.';
    }

    if (wantsImage) {
        const requestBody: Record<string,unknown> = {
          model,
          messages: [
            {role:'system', content: sanitizeForFetch(systemPrompt)},
            ...messages.map((m:{role:string;content:string})=>({role: m.role==='assistant'?'assistant':'user', content: sanitizeForFetch(m.content)})),
          ],
          max_tokens: maxTokens,
        };
        if (modalities) requestBody.modalities = modalities;
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
            'X-Title': 'Orbit of Khemet -- Empire Engine',
          },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) { const e = await response.text(); throw new Error(`OpenRouter ${response.status}: ${e}`); }
        const data = await response.json();
        const choice = data.choices?.[0];
        const textContent = choice?.message?.content || 'No response received.';
        const modelUsed = data.model || model;
        let imageUrl: string|null = null;
        if (wantsImage) {
          const parts = choice?.message?.content_parts || [];
          const ip = parts.find((p:{type:string})=>p.type==='image_url');
          if (ip?.image_url?.url) imageUrl = ip.image_url.url;
        }
        return Response.json({response: textContent, imageUrl, modelUsed, tier: tierInfo?.tier || null, isImageResponse: wantsImage && !!imageUrl});
    }

    const result = streamText({
      model: openrouter(model),
      system: sanitizeForFetch(systemPrompt),
      messages: messages.map((m: any) => ({ ...m, content: sanitizeForFetch(m.content) })),
      maxTokens,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('CHAT API ERROR:', message);
    return Response.json({error: message}, {status:500});
  }
"""

text = text[:text.find('  try {')] + post_fn + "}"

with open("src/app/api/chat/route.ts", "w") as f:
    f.write(text)
