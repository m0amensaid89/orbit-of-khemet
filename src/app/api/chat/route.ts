import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { heroMeta, heroAgents, masterSystemPrompt } from "@/lib/agents";

export async function POST(req: NextRequest) {
  try {
    console.log("🔑 GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
    console.log("🔑 GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length || 0);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const { messages, hero } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("🔧 Using current free model: gemini-2.5-flash");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Dynamic prompt construction based on the requested hero
    let systemPrompt = masterSystemPrompt;

    if (hero && hero !== "MASTER") {
      const heroSlug = hero.toLowerCase();
      const meta = heroMeta[heroSlug];
      const agents = heroAgents[heroSlug] || [];

      if (meta) {
        // Extract first 2 sentences of the bio to keep it lean
        const bioExcerpt = meta.bio.split('. ').slice(0, 2).join('. ') + '.';

        const agentList = agents
          .map(a => `- ${a.name} (${a.category}): ${a.role}`)
          .join('\n');

        systemPrompt += `\n\n--- CURRENT ORBIT: ${meta.name} — ${meta.class_title} ---
"${meta.quote}"

You are now operating exclusively within the **${meta.name} Orbit**.
You must adopt the persona and leadership style of ${meta.name}.
Bio: ${bioExcerpt}
Universe Role: ${meta.universe_role}

You are restricted to delegating tasks ONLY to the specialized agents assigned to this group:
\n${agentList}\n
Ensure your responses strongly reflect the domain expertise of ${meta.name} and their assigned agents.`;
      } else {
        systemPrompt += `\n\nYou are operating in the ${hero} Orbit. Use only the agents assigned to this hero.`;
      }
    } else {
      systemPrompt += `\n\nYou are operating in the MASTER ORBIT, commanding the full council of 85 agents across all groups.`;
    }

    const fullPrompt = `${systemPrompt}\n\nUser: ${messages[messages.length - 1].content}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    return Response.json({ response: responseText });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("🚨 CHAT API ERROR:", error.message);
    console.error("Full error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
