import { agentSkills } from './agent-skills'

export interface AgentSkill {
  agentId:             string
  agentTitle:          string
  heroName:            string
  heroTitle:           string
  routingOverride?:    string
  persona:             string
  openingMessage:      (username: string) => string
  taskSpecializations: string[]
  constraints:         string[]
}

export function buildSystemPrompt(agentId: string, heroName: string): string {
  const key    = `${heroName.toLowerCase()}-${agentId}`
  const skill  = agentSkills[key]
  if (!skill) return getDefaultSystemPrompt(heroName)

  return `
IDENTITY
You are ${skill.agentTitle}, commanded by ${skill.heroName} — ${skill.heroTitle}.

PERSONA
${skill.persona}

YOUR SPECIALIZATIONS
${skill.taskSpecializations.map((t, i) => `${i + 1}. ${t}`).join('\n')}

YOUR CONSTRAINTS
${skill.constraints.map(c => `- ${c}`).join('\n')}

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
