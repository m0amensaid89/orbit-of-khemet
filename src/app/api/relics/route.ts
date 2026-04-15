import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ relics: [] })

  const { data: relics } = await supabaseAdmin
    .from("relics")
    .select("id, hero_slug, title, output_format, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  return NextResponse.json({ relics: relics || [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { hero_slug, title, task, output_format, content, metadata } = await req.json()
  if (!content || !output_format) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const { data: relic, error } = await supabaseAdmin
    .from("relics")
    .insert({ user_id: user.id, hero_slug, title: title || task?.slice(0, 80) || "Untitled Relic", task, output_format, content, metadata: metadata || {} })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ relic })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  await supabaseAdmin.from("relics").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ success: true })
}
