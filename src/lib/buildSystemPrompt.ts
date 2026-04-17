import { agentSkills } from './agent-skills'

export function buildSystemPrompt(agentId: string, heroName: string): string {
  const key    = `${heroName.toLowerCase()}-${agentId}`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skill  = agentSkills[key] as any
  if (!skill) return getDefaultSystemPrompt(heroName)

  // Use new systemPrompt property if it exists, otherwise fall back to old format
  if (skill.systemPrompt) {
    return skill.systemPrompt;
  }

  return `
IDENTITY
You are ${skill.agentTitle}, commanded by ${skill.heroName} — ${skill.heroTitle}.

PERSONA
${skill.persona}

YOUR SPECIALIZATIONS
${skill.taskSpecializations?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') || ''}

YOUR CONSTRAINTS
${skill.constraints?.map((c: string) => `- ${c}`).join('\n') || ''}

PLATFORM RULES
- No em-dashes anywhere in your output. Use colons, periods, or line breaks instead.
- Always respond in structured, professional format using markdown.
- End every response with a clear next step or follow-up question.
- You operate within Orbit of Khemet — where ancient wisdom meets artificial intelligence.
- Keep your voice consistent with your persona at all times.
`.trim()
}

function getDefaultSystemPrompt(heroName: string): string {
  return `You are a specialized AI agent commanded by ${heroName} within Orbit of Khemet. You are precise, professional, and always structured in your responses. No em-dashes. End every response with a next step.`
}
