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
  if (!user) return NextResponse.json({ sources: [] })

  const { data: sources } = await supabaseAdmin
    .from('knowledge_sources')
    .select('id, name, type, file_size, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ sources: sources || [] })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 })

  // Get file path before deleting
  const { data: source } = await supabaseAdmin
    .from('knowledge_sources')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (source?.file_path) {
    await supabaseAdmin.storage.from('khemet-brain').remove([source.file_path])
  }

  // Delete chunks first (cascade handles this but be explicit)
  await supabaseAdmin.from('knowledge_chunks').delete().eq('source_id', id)

  // Delete source
  await supabaseAdmin.from('knowledge_sources').delete().eq('id', id).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}