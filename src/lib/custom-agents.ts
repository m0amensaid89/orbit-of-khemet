// Custom Agent Forge — Commander tier exclusive
// Storage: localStorage (MVP). Schema is DB-ready for Stripe + auth migration.

export type CustomAgent = {
  id: string; // "custom_" + Date.now()
  name: string; // user-chosen name
  role_summary: string; // one-line role description
  description: string; // what this agent does
  systemPrompt: string; // the full custom system prompt
  category: string; // user-chosen category
  heroSlug: string; // which hero orbit it belongs to
  createdAt: string; // ISO timestamp
  isCustom: true; // marker to distinguish from built-in agents
};

const STORAGE_KEY = "orbit_custom_agents";
const MAX_CUSTOM_AGENTS = 3; // Commander limit

export function getCustomAgents(): CustomAgent[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getCustomAgentsForHero(heroSlug: string): CustomAgent[] {
  return getCustomAgents().filter((a) => a.heroSlug === heroSlug);
}

export function saveCustomAgent(
  agent: Omit<CustomAgent, "id" | "createdAt" | "isCustom">
): CustomAgent {
  const agents = getCustomAgents();
  if (agents.length >= MAX_CUSTOM_AGENTS) {
    throw new Error(
      `Commander plan allows up to ${MAX_CUSTOM_AGENTS} custom agents. Delete one to forge a new one.`
    );
  }
  const newAgent: CustomAgent = {
    ...agent,
    id: "custom_" + Date.now(),
    createdAt: new Date().toISOString(),
    isCustom: true,
  };
  const updated = [...agents, newAgent];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newAgent;
}

export function updateCustomAgent(id: string, updates: Partial<CustomAgent>): CustomAgent {
  const agents = getCustomAgents();
  const index = agents.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("Agent not found");

  const updatedAgent = { ...agents[index], ...updates };
  agents[index] = updatedAgent;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  return updatedAgent;
}

export function deleteCustomAgent(id: string): void {
  const agents = getCustomAgents().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

export function getCustomAgentById(id: string): CustomAgent | null {
  return getCustomAgents().find((a) => a.id === id) || null;
}

export const AGENT_CATEGORIES = [
  "Marketing",
  "Writing",
  "Finance & Operations",
  "Finance & Capital",
  "Legal & Compliance",
  "Product & Engineering",
  "Social Media",
  "Content Creation",
  "Business",
  "Strategy & Analysis",
  "Sales and Communication",
  "E-commerce",
  "Community",
  "Leadership",
  "Assistants",
  "Customer Support",
  "Personal Development",
  "Creative Tools",
  "Data & Analytics",
  "HR & People",
  "Productivity & Management",
  "Strategy & Growth",
  "Operations",
  "Custom",
];
