import { agentSkills } from './agent-skills'

// Unified AgentSkill type that covers both the Sprint 31B format
// (name, slug, hero, systemPrompt, capabilities) and legacy fields
export interface AgentSkill {
  // Sprint 31B fields (primary)
  name?:              string
  slug?:              string
  hero?:              string
  systemPrompt?:      string
  capabilities?:      string[]
  routingHints?:      string[]
  outputTypes?:       string[]
  // Legacy fields (kept for compatibility)
  agentId?:           string
  agentTitle?:        string
  heroName?:          string
  heroTitle?:         string
  routingOverride?:   string
  persona?:           string
  openingMessage?:    (username: string) => string
  taskSpecializations?: string[]
  constraints?:       string[]
}

export function buildSystemPrompt(agentId: string, heroName: string): string {
  const key   = `${heroName.toLowerCase()}-${agentId}`
  const skill = agentSkills[key] as AgentSkill | undefined
  if (!skill) return getDefaultSystemPrompt(heroName)

  // Sprint 31B format: use systemPrompt directly
  if (skill.systemPrompt) {
    return skill.systemPrompt.trim()
  }

  // Legacy format: build from parts
  const title       = skill.agentTitle || skill.name || agentId
  const hName       = skill.heroName   || skill.hero  || heroName
  const hTitle      = skill.heroTitle  || ''
  const persona     = skill.persona    || ''
  const specs       = skill.taskSpecializations || skill.capabilities || []
  const constraints = skill.constraints || []

  return `
IDENTITY
You are ${title}${hTitle ? `, commanded by ${hName} — ${hTitle}` : `, part of the ${hName} intelligence grid`}.

${persona ? `PERSONA\n${persona}\n` : ''}
${specs.length ? `YOUR SPECIALIZATIONS\n${specs.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n` : ''}
${constraints.length ? `YOUR CONSTRAINTS\n${constraints.map(c => `- ${c}`).join('\n')}\n` : ''}
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
