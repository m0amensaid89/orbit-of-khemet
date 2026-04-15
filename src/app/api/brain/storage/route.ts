import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
const supabaseAdmin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const STORAGE_LIMITS_MB: Record<string, number> = {
  personal_basic: 100, personal_explorer: 250, personal_starter: 500,
  business_pro: 1024, business_standard: 5120, business_enterprise: 15360, free: 50,
}
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ used_bytes: 0, limit_bytes: 0, tier: "free" })
  const { data: profile } = await supabaseAdmin.from("profiles").select("tier").eq("id", user.id).single()
  const tier = profile?.tier || "free"
  const limitBytes = (STORAGE_LIMITS_MB[tier] ?? 50) * 1024 * 1024
  const { data: sources } = await supabaseAdmin.from("knowledge_sources").select("file_size").eq("user_id", user.id)
  const usedBytes = (sources || []).reduce((sum: number, row: { file_size: number }) => sum + (row.file_size || 0), 0)
  return NextResponse.json({ used_bytes: usedBytes, limit_bytes: limitBytes, tier })
}