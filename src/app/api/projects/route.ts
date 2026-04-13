import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
)

// GET — list user's projects
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*, chat_threads(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ projects: projects || [] })
}

// POST — create project
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, color } = await req.json()

  const supabaseAdmin = getSupabaseAdmin()
  const { data: project } = await supabaseAdmin
    .from('projects')
    .insert({ user_id: user.id, name, description, color })
    .select()
    .single()

  return NextResponse.json({ project })
}

// DELETE — delete project
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  const supabaseAdmin = getSupabaseAdmin()
  await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
