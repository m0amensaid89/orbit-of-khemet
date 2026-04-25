import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits, tier")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ credits: 350, tier: "scout" });
    }

    // Sync to localStorage values so frontend stays accurate
    return NextResponse.json({
      credits: profile.credits ?? 350,
      tier: profile.tier ?? "scout",
    });
  } catch (error) {
    console.error("Credits fetch error:", error);
    return NextResponse.json({ credits: 350, tier: "scout" });
  }
}
