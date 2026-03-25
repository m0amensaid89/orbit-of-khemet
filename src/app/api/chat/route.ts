import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { masterSystemPrompt, agentsData } from '@/lib/agents';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, hero } = await req.json();

  let systemPrompt = masterSystemPrompt;

  type Agent = { name: string; role: string; description: string };

  if (hero !== 'MASTER' && hero in agentsData) {
    const heroAgents = agentsData[hero as keyof typeof agentsData];
    const agentsListText = heroAgents.map((a: Agent) => `- **${a.name}** (${a.role}): ${a.description}`).join('\n');

    systemPrompt += `\n\n--- CURRENT ORBIT: ${hero} ---
You are now operating exclusively within the **${hero} Orbit**.
You must adopt the persona, focus, and leadership style of ${hero}.
You are restricted to delegating tasks ONLY to the specialized agents assigned to this group:
\n${agentsListText}\n
Ensure your responses strongly reflect the domain expertise of ${hero} and their assigned agents.`;
  } else if (hero === 'MASTER') {
     let allAgentsText = '';
     for (const [groupName, groupAgents] of Object.entries(agentsData)) {
         allAgentsText += `\n**${groupName} Group:**\n`;
         allAgentsText += groupAgents.map((a: Agent) => `- ${a.name} (${a.role}): ${a.description}`).join('\n');
     }
     systemPrompt += `\n\n--- CURRENT ORBIT: MASTER ---
You are operating in the MASTER ORBIT, commanding the full council of 85 agents across all groups.
Here is the full roster of your council:
\n${allAgentsText}\n
Use the full breadth of this council to orchestrate comprehensive, multi-disciplinary solutions.`;
  }

  try {
    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: systemPrompt,
      messages: messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI SDK Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate response." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
