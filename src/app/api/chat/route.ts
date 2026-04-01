import { NextRequest } from 'next/server';
import { heroMeta, heroAgents, masterSystemPrompt } from '@/lib/agents';

function sanitizeForFetch(text: string): string {
  return text
    .replace(/\u2014/g, '--').replace(/\u2013/g, '-')
    .replace(/\u2018/g, "'").replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"').replace(/\u201D/g, '"')
    .replace(/\u2022/g, '*').replace(/\u00A0/g, ' ')
    .replace(/[^\x00-\x7F]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

const IMAGE_TRIGGERS = ['draw','generate an image','create an image','make an image','illustrate','visualize','design a logo','create a logo','generate a logo','make a banner','create a poster','generate a visual','create artwork','paint','sketch me'];
function isImageRequest(msg: string): boolean { return IMAGE_TRIGGERS.some(t => msg.toLowerCase().includes(t)); }

type Tier = 1|2|3|4|5;
const TIER_MODELS: Record<Tier,string> = {
  1: 'openai/o3-mini:online',
  2: 'openai/gpt-4o-mini',
  3: 'xiaomi/mimo-7b',
  4: 'anthropic/claude-sonnet-4-5:online',
  5: 'openai/gpt-4o:online',
};
const TIER_MAX_TOKENS: Record<Tier,number> = {1:1000,2:2000,3:4000,4:6000,5:8000};

function classifyMessage(msg: string, hero: string, convLen: number): {tier: Tier; model: string; maxTokens: number} {
  const lower = msg.toLowerCase().trim();
  const words = lower.split(/\s+/).length;
  const simpleSignals = ['hi','hello','hey','thanks','thank you','ok','okay','yes','no','sure','great','good morning','good night'];
  const needsLive = ['price','news','latest','today','now','current','stock','weather'].some(k => lower.includes(k));
  if ((words <= 4 || simpleSignals.some(s => lower === s || lower.startsWith(s+' '))) && !needsLive) {
    return {tier:1, model:TIER_MODELS[1], maxTokens:TIER_MAX_TOKENS[1]};
  }
  let g=0,e=0,a=0,s=0,m=0;

  // Mimo / Tier 3 signals: Pure math, logic, step-by-step
  ['math','calculate','logical puzzle','step-by-step','prove','derive','formula','equation','algorithm'].forEach(k=>{if(lower.includes(k))m+=3;});

  // Tier 5 signals: Hardest, complex reasoning
  ['architect','design a system','optimize','benchmark','refactor entire','debug complex','mathematical','scientific','multi-step plan','enterprise architecture','machine learning','neural network','advanced statistics','financial model','legal analysis','audit','due diligence','full business plan'].forEach(k=>{if(lower.includes(k))g+=3;});

  // Tier 4 signals: Creative/nuanced/long-form
  ['strategy','analyze','in-depth','comprehensive','detailed report','compare','pros and cons','review my','critique','improve my','rewrite','business plan','proposal','contract','policy','sop','framework','roadmap','full guide','explain how','how does','why does','code this','build me','create a','write a full','long form','research','case study','what should i do','help me decide'].forEach(k=>{if(lower.includes(k))e+=2;});

  // Tier 2 signals: General chat / simple instructions
  ['write','draft','email','content','post','article','blog','caption','script','describe','explain','list','summarize','find','search for','latest','recent','current','today','news','who is','what happened','how to','steps to','ways to','ideas for','suggest'].forEach(k=>{if(lower.includes(k))a+=1;});
  ['translate','fix','correct','grammar','spell','format','convert','quick','simple','brief','short','overview','definition','what is','meaning of','example of'].forEach(k=>{if(lower.includes(k))s+=1;});

  if(words>100)g+=3; else if(words>50)e+=2; else if(words>20)a+=1;
  if(convLen>20)g+=1; else if(convLen>10)e+=1;
  if(hero==='thoren'||hero==='horusen')e+=2;
  if(hero==='nexar')g+=1;
  if(hero==='lyra')e+=1;

  const mx=Math.max(g,e,a,s,m);
  if(g>=3&&mx===g) return {tier:5,model:TIER_MODELS[5],maxTokens:TIER_MAX_TOKENS[5]};
  if(e>=2&&mx===e) return {tier:4,model:TIER_MODELS[4],maxTokens:TIER_MAX_TOKENS[4]};
  if(m>=3&&mx===m) return {tier:3,model:TIER_MODELS[3],maxTokens:TIER_MAX_TOKENS[3]};
  if(a>=1&&mx===a) return {tier:2,model:TIER_MODELS[2],maxTokens:TIER_MAX_TOKENS[2]};
  if(s>=1) return {tier:2,model:TIER_MODELS[2],maxTokens:TIER_MAX_TOKENS[2]};
  return {tier:2,model:TIER_MODELS[2],maxTokens:TIER_MAX_TOKENS[2]};
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
    if (wantsImage) {
      model = 'google/gemini-2.5-flash-exp-image-generation';
      maxTokens = 2000;
      modalities = ['image','text'];
    } else {
      tierInfo = classifyMessage(lastMessage, heroSlug, messages.length);
      model = tierInfo.model;
      maxTokens = tierInfo.maxTokens;
    }
    let systemPrompt = masterSystemPrompt;
    if (agent?.startsWith('custom_') && customSystemPrompt) {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('CHAT API ERROR:', message);
    return Response.json({error: message}, {status:500});
  }
}
