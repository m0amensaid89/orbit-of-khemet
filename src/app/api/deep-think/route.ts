import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://orbit.khemet.ai",
    "X-Title": "Orbit of Khemet -- Deep Think",
  },
});

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { query, depth = "thorough", thinkingTokens = 8000 } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Credit cost: deep_analysis = 26 GE
    const CREDIT_COST = depth === "ultra" ? 50 : depth === "exhaustive" ? 36 : 26;

    const { data: profile } = await supabaseAdmin
      .from("profiles").select("credits, tier").eq("id", user.id).single();

    if (!profile || (profile.credits !== null && profile.credits < CREDIT_COST)) {
      return NextResponse.json({
        error: "Insufficient Grid Energy",
        creditsRequired: CREDIT_COST,
        creditsAvailable: profile?.credits || 0,
      }, { status: 402 });
    }

    const systemPrompt = `You are the Deep Think reasoning engine — a world-class analytical AI.
Your role: produce exhaustive, nuanced analysis with careful step-by-step reasoning.
Rules:
- Think deeply before answering. Surface non-obvious insights.
- Structure your response clearly with headers.
- Challenge assumptions. Present multiple perspectives.
- Be precise. Support claims with reasoning.
- Conclude with actionable synthesis.`;

    const startTime = Date.now();

    // Use Claude Opus with extended thinking via OpenRouter
    const { text, usage } = await generateText({
      model: openrouter("anthropic/claude-opus-4-5"),
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `[DEEP THINK — ${depth.toUpperCase()} depth — ${thinkingTokens.toLocaleString()} thinking tokens]

${query}`,
      }],
      maxTokens: 8000,
      providerOptions: {
        openrouter: {
          thinking: { type: "enabled", budget_tokens: thinkingTokens },
        },
      },
    });

    // Deduct credits
    await supabaseAdmin.from("profiles")
      .update({ credits: (profile.credits || 0) - CREDIT_COST })
      .eq("id", user.id);

    // S48Q-04: write usage event for audit trail
    try {
      await supabaseAdmin.from('usage_events').insert({
        user_id: user.id,
        event_type: 'deep_think',
        energy_cost: CREDIT_COST,
        metadata: { depth, thinkingTokens: usage?.totalTokens },
      });
    } catch (trackErr) {
      console.error('[deep-think] usage_events write failed:', trackErr);
    }

    return NextResponse.json({
      answer: text,
      model: "Claude Opus 4.5",
      depth,
      thinkingTokens: usage?.totalTokens,
      duration: Math.round((Date.now() - startTime) / 1000),
      creditsUsed: CREDIT_COST,
      creditsRemaining: (profile.credits || 0) - CREDIT_COST,
    });
  } catch (err) {
    console.error("Deep Think error:", err);
    return NextResponse.json({ error: "Deep Think failed" }, { status: 500 });
  }
}
