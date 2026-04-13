import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ messages: [] })

  const threadId = req.nextUrl.searchParams.get('threadId')
  console.log('Loading messages for threadId:', threadId)
  if (!threadId) return NextResponse.json({ messages: [] })

  // Verify ownership of the thread first
  const { data: thread } = await supabase
    .from('chat_threads')
    .select('id')
    .eq('id', threadId)
    .eq('user_id', user.id)
    .single()

  if (!thread) {
    return NextResponse.json({ messages: [] })
  }

  const { data: messages } = await supabaseAdmin
    .from('chat_messages')
    .select('id, role, content, created_at, model_used')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: messages || [] })
}