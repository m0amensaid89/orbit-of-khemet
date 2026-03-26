import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { masterSystemPrompt, agentsData } from '@/lib/agents';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log("🔑 GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
    console.log("🔑 GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length || 0);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

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

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: systemPrompt,
      messages: messages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("🚨 CHAT API ERROR:", errorMessage);
    console.error("Full error:", error);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
