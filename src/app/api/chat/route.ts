import { NextRequest } from "next/server";
import { heroMeta, heroAgents, masterSystemPrompt } from "@/lib/agents";

const heroModelMap: Record<string, string> = {
  master: "openrouter/auto",
  thoren: "anthropic/claude-sonnet-4-5",
  nexar: "deepseek/deepseek-r1:free",
  ramet: "google/gemini-2.5-flash",
  lyra: "google/gemini-2.5-flash",
  kairo: "google/gemini-2.5-flash",
  nefra: "google/gemini-2.5-flash",
  horusen: "google/gemini-2.5-flash",
};

const IMAGE_TRIGGERS = [
  "draw", "generate an image", "create an image", "make an image",
  "show me an image", "illustrate", "visualize", "design a logo",
  "create a logo", "generate a logo", "make a banner", "create a poster",
  "generate a visual", "create artwork", "paint", "sketch me"
];

function isImageRequest(message: string): boolean {
  const lower = message.toLowerCase();
  return IMAGE_TRIGGERS.some(t => lower.includes(t));
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is missing");
    }

    const { messages, hero } = await req.json();
    const heroSlug = (hero || "master").toLowerCase();
    const lastMessage = messages[messages.length - 1]?.content || "";
    const wantsImage = isImageRequest(lastMessage);

    let model = heroModelMap[heroSlug] || "google/gemini-2.5-flash";
    let modalities: string[] | undefined;

    if (wantsImage) {
      model = "google/gemini-2.5-flash-exp-image-generation";
      modalities = ["image", "text"];
    }

    let systemPrompt = masterSystemPrompt;

    if (heroSlug !== "master") {
      const meta = heroMeta[heroSlug as keyof typeof heroMeta];
      const agents = heroAgents[heroSlug as keyof typeof heroAgents] || [];
      if (meta) {
        const bioExcerpt = meta.bio.split(". ").slice(0, 2).join(". ") + ".";
        const agentList = agents.map(a => `- ${a.name} (${a.category}): ${a.role_summary}`).join("\n");
        systemPrompt += `\n\n--- CURRENT ORBIT: ${meta.name} — ${meta.class_title} ---
"${meta.quote}"
You are operating exclusively within the ${meta.name} Orbit.
Adopt the persona and leadership style of ${meta.name}.
Bio: ${bioExcerpt}
Universe Role: ${meta.universe_role}
Delegate tasks ONLY to agents in this group:\n${agentList}`;
      }
    } else {
      systemPrompt += `\n\nYou are the MASTER ORBIT, commanding all 85 specialized agents across all 7 hero groups. You have full access to every capability. Route requests to the most appropriate agent and deliver elite-level responses.`;
    }

    const requestBody: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ],
      max_tokens: 1500,
    };

    if (modalities) requestBody.modalities = modalities;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://orbit-of-khemet.vercel.app",
        "X-Title": "Orbit of Khemet — Empire Engine",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const textContent = choice?.message?.content || "No response received.";
    const modelUsed = data.model || model;

    let imageUrl: string | null = null;
    if (wantsImage) {
      const parts = choice?.message?.content_parts || [];
      const imagePart = parts.find((p: { type: string }) => p.type === "image_url");
      if (imagePart?.image_url?.url) imageUrl = imagePart.image_url.url;
    }

    return Response.json({ response: textContent, imageUrl, modelUsed, isImageResponse: wantsImage && !!imageUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("CHAT API ERROR:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
