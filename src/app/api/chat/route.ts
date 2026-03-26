import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("🔑 GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
    console.log("🔑 GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length || 0);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const { messages, hero } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Simple prompt construction
    const systemPrompt = hero
      ? `You are operating in the ${hero} Orbit. Use only the agents assigned to this hero.`
      : "You are the Master Orbit commanding all 85 specialized agents.";

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
