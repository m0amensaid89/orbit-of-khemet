import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const revalidate = 3600; // Cache 1 hour at edge

export async function GET() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("model_registry")
      .select("*")
      .eq("is_active", true)
      .order("provider", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      models: data || [],
      count: data?.length || 0,
      cached_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Model registry error:", err);
    return NextResponse.json({ error: "Registry unavailable" }, { status: 500 });
  }
}
