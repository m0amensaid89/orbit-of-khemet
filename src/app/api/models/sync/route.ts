import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Called by Vercel Cron (daily) or admin manually
// Cron config: /api/models/sync — every 24h via vercel.json

export async function POST(req: NextRequest) {
  // Verify internal secret or admin session
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  const internalSecret = process.env.INTERNAL_CRON_SECRET;

  const isAuthorized =
    cronHeader === "1" || // Vercel Cron bypass
    (internalSecret && authHeader === `Bearer ${internalSecret}`);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch available models from OpenRouter
    const orRes = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://orbit.khemet.ai",
      },
    });

    if (!orRes.ok) {
      return NextResponse.json({ error: "OpenRouter fetch failed", status: orRes.status }, { status: 500 });
    }

    const orData = await orRes.json();
    const models = orData.data || [];

    // Filter to models we care about (known providers)
    const TRACKED_PREFIXES = ["anthropic/", "openai/", "google/", "x-ai/", "meta-llama/", "mistralai/", "cohere/"];
    const filtered = models.filter((m: { id: string }) =>
      TRACKED_PREFIXES.some(prefix => m.id.startsWith(prefix))
    );

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let upserted = 0;
    const now = new Date().toISOString();

    for (const model of filtered) {
      const provider = model.id.split("/")[0];
      const pricing = model.pricing || {};
      const costInput = parseFloat(pricing.prompt || "0") * 1_000_000;
      const costOutput = parseFloat(pricing.completion || "0") * 1_000_000;

      const { error } = await supabase
        .from("model_registry")
        .upsert({
          id: model.id,
          label: model.name || model.id,
          provider,
          context_length: model.context_length || 0,
          cost_input_per_1m: costInput,
          cost_output_per_1m: costOutput,
          supports_tools: !!(model.supported_parameters?.includes("tools")),
          supports_vision: model.architecture?.input_modalities?.includes("image") || false,
          description: model.description?.slice(0, 500) || null,
          is_active: true,
          last_synced_at: now,
        }, { onConflict: "id" });

      if (!error) upserted++;
    }

    return NextResponse.json({
      success: true,
      synced: upserted,
      total_from_or: filtered.length,
      synced_at: now,
    });
  } catch (err) {
    console.error("Model sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
