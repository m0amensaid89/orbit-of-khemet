import { NextRequest } from 'next/server';
import { heroMeta, heroAgents, masterSystemPrompt } from '@/lib/agents';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getHero } from '@/lib/heroes';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

function sanitizeForFetch(text: string): string {
  return text
    .replace(/\u2014/g, '--').replace(/\u2013/g, '-')
    .replace(/\u2018/g, "'").replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"').replace(/\u201D/g, '"')
    .replace(/\u2022/g, '*').replace(/\u00A0/g, ' ');
}

const IMAGE_TRIGGERS = ['draw','generate an image','create an image','make an image','illustrate','visualize','design a logo','create a logo','generate a logo','make a banner','create a poster','generate a visual','create artwork','paint','sketch me'];
function isImageRequest(msg: string): boolean { return IMAGE_TRIGGERS.some(t => msg.toLowerCase().includes(t)); }

type Tier = 1|2|3|4|5;
const TIER_MODELS: Record<Tier,string> = {
  1: 'google/gemini-2.5-flash',
  2: 'google/gemini-2.5-flash:online',
  3: 'openai/gpt-4o:online',
  4: 'anthropic/claude-sonnet-4-5:online',
  5: 'openai/o3-mini:online',
};
const TIER_MAX_TOKENS: Record<Tier,number> = {1:1000,2:2000,3:3000,4:6000,5:8000};

function classifyMessage(msg: string, hero: string, convLen: number): {tier: Tier; model: string; maxTokens: number} {
  const lower = msg.toLowerCase().trim();
  const words = lower.split(/\s+/).length;
  const simpleSignals = ['hi','hello','hey','thanks','thank you','ok','okay','yes','no','sure','great','good morning','good night'];
  const needsLive = ['price','news','latest','today','now','current','stock','weather'].some(k => lower.includes(k));
  if ((words <= 4 || simpleSignals.some(s => lower === s || lower.startsWith(s+' '))) && !needsLive) {
    return {tier:1, model:TIER_MODELS[1], maxTokens:TIER_MAX_TOKENS[1]};
  }
  let g=0,e=0,a=0,s=0;
  ['prove','derive','architect','design a system','algorithm','optimize','benchmark','refactor entire','debug complex','mathematical','scientific','multi-step plan','enterprise architecture','machine learning','neural network','advanced statistics','financial model','legal analysis','audit','due diligence','full business plan'].forEach(k=>{if(lower.includes(k))g+=3;});
  ['strategy','analyze','in-depth','comprehensive','detailed report','compare','pros and cons','review my','critique','improve my','rewrite','business plan','proposal','contract','policy','sop','framework','roadmap','full guide','step by step','explain how','how does','why does','code this','build me','create a','write a full','long form','research','case study','what should i do','help me decide'].forEach(k=>{if(lower.includes(k))e+=2;});
  ['write','draft','email','content','post','article','blog','caption','script','describe','explain','list','summarize','find','search for','latest','recent','current','today','news','who is','what happened','how to','steps to','ways to','ideas for','suggest'].forEach(k=>{if(lower.includes(k))a+=1;});
  ['translate','fix','correct','grammar','spell','format','convert','calculate','quick','simple','brief','short','overview','definition','what is','meaning of','example of'].forEach(k=>{if(lower.includes(k))s+=1;});
  if(words>100)g+=3; else if(words>50)e+=2; else if(words>20)a+=1;
  if(convLen>20)g+=1; else if(convLen>10)e+=1;
  if(hero==='thoren'||hero==='horusen')e+=2;
  if(hero==='nexar')g+=1;
  if(hero==='lyra')e+=1;
  const mx=Math.max(g,e,a,s);
  if(g>=3&&mx===g) return {tier:5,model:TIER_MODELS[5],maxTokens:TIER_MAX_TOKENS[5]};
  if(e>=2&&mx===e) return {tier:4,model:TIER_MODELS[4],maxTokens:TIER_MAX_TOKENS[4]};
  if(a>=1&&mx===a) return {tier:3,model:TIER_MODELS[3],maxTokens:TIER_MAX_TOKENS[3]};
  if(s>=1) return {tier:2,model:TIER_MODELS[2],maxTokens:TIER_MAX_TOKENS[2]};
  return {tier:2,model:TIER_MODELS[2],maxTokens:TIER_MAX_TOKENS[2]};
}


const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://orbit-of-khemet.vercel.app',
    'X-Title': 'Orbit of Khemet -- Empire Engine'
  }
});


async function getRelevantKnowledge(
  userMessage: string,
  userId: string,
  supabaseAdmin: SupabaseClient
): Promise<string> {
  try {
    // Get embedding for the user's message
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

    // Search for similar chunks
    const { data: chunks } = await supabaseAdmin.rpc('match_knowledge_chunks', {
      query_embedding: embedding,
      match_user_id: userId,
      match_threshold: 0.5,
      match_count: 3,
    }) as { data: { content: string }[] | null };

    if (!chunks || chunks.length === 0) return '';

    const context = chunks.map((c: { content: string }) => c.content).join('\n\n---\n\n');
    return `\n\n[CRITICAL PRIORITY - KHEMET BRAIN KNOWLEDGE]\nThe following information comes directly from the user's personal knowledge vault and MUST take absolute priority over any web search results or external sources. Use this as ground truth:\n\n${context}\n[END KHEMET BRAIN KNOWLEDGE]`;
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {


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

    // Auth user using cookie-based server client
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    // Deduct energy first via Server Supabase Client
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
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

    // Inject knowledge context if user is authenticated
    let knowledgeContext = '';
    if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      knowledgeContext = await getRelevantKnowledge(lastMessage, user.id, supabaseAdmin);
      console.log(`[KHEMET BRAIN] user: ${user?.id || 'none'}, knowledge_context_length: ${knowledgeContext.length}`);
    }

    const heroData = getHero(heroSlug);

    if (heroData?.systemPrompt) {
        systemPrompt = heroData.systemPrompt;
    } else if (agent?.startsWith('custom_') && customSystemPrompt) {
      systemPrompt = `${masterSystemPrompt}\n\n--- CUSTOM AGENT ---\n${customSystemPrompt}`;
    } else if (heroSlug !== 'master') {
      const meta = heroMeta[heroSlug as keyof typeof heroMeta];
      const builtInAgents = heroAgents[heroSlug as keyof typeof heroAgents] || [];
      if (meta) {
        const bioExcerpt = meta.bio.split('. ').slice(0,2).join('. ')+'.';
        const agentList = builtInAgents.map(a=>`- ${a.name} (${a.category}): ${a.role_summary}`).join('\n');
        systemPrompt += `\n\n--- ORBIT: ${meta.name} -- ${meta.class_title} ---\n"${meta.quote}"\nAdopt ${meta.name} persona. Bio: ${bioExcerpt}\nUniverse Role: ${meta.universe_role}\nAgents:\n${agentList}`;
      }
    } else {
      systemPrompt += '\n\nYou are the MASTER ORBIT, commanding all 85 specialized agents across all 7 hero groups. Deliver elite-level responses.';
    }

    // Append to system prompt
    if (knowledgeContext) {
      systemPrompt += knowledgeContext;
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

        if (user && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          let threadId = body.threadId;
          if (!threadId) {
            const { data: thread } = await supabaseAdmin
              .from('chat_threads')
              .insert({ user_id: user.id, hero_slug: heroSlug, agent_slug: agent, title: lastMessage.slice(0, 50) })
              .select().single();
            threadId = thread?.id;
          }
          if (threadId) {
            await supabaseAdmin.from('chat_messages').insert({
              thread_id: threadId, user_id: user.id,
              role: 'user', content: lastMessage, model_used: modelUsed
            });
            await supabaseAdmin.from('chat_messages').insert({
              thread_id: threadId, user_id: user.id,
              role: 'assistant', content: textContent, model_used: modelUsed
            });
          }
        }

        return Response.json({response: textContent, imageUrl, modelUsed, tier: tierInfo?.tier || null, isImageResponse: wantsImage && !!imageUrl});
    }

    const result = streamText({
      model: openrouter(model),
      system: sanitizeForFetch(systemPrompt),
      messages: messages.map((m: { role: "system" | "user" | "assistant" | "data"; content: string }) => ({ ...m, content: sanitizeForFetch(m.content) })),
      maxTokens,
      async onFinish({ text }) {
        if (user && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          let threadId = body.threadId;
          if (!threadId) {
            const { data: thread } = await supabaseAdmin
              .from('chat_threads')
              .insert({ user_id: user.id, hero_slug: heroSlug, agent_slug: agent, title: lastMessage.slice(0, 50) })
              .select().single();
            threadId = thread?.id;
          }
          if (threadId) {
            await supabaseAdmin.from('chat_messages').insert({
              thread_id: threadId, user_id: user.id,
              role: 'user', content: lastMessage, model_used: model
            });
            await supabaseAdmin.from('chat_messages').insert({
              thread_id: threadId, user_id: user.id,
              role: 'assistant', content: text, model_used: model
            });
          }
        }
      }
    });

    let streamResponse;
    if (body.threadId) {
      streamResponse = result.toDataStreamResponse();
    } else {
      // Need to communicate new thread ID if one is created? The instructions didn't specify we have to pass it back,
      // but usually the frontend reads it from the URL. Let's append an extra header just in case.
      streamResponse = result.toDataStreamResponse();
    }

    return streamResponse;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('CHAT API ERROR:', message);
    return Response.json({error: message}, {status:500});
  }
}