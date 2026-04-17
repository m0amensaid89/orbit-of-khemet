export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ memories: [] })

  const { data: memories } = await supabaseAdmin
    .from('user_memory')
    .select('id, memory_text, category, source, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return NextResponse.json({ memories: memories || [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { memory_text, category } = await req.json()
  if (!memory_text?.trim()) return NextResponse.json({ error: 'memory_text required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('user_memory')
    .insert({
      user_id: user.id,
      memory_text: memory_text.trim(),
      category: category || 'general',
      source: 'user',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabaseAdmin
    .from('user_memory')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
