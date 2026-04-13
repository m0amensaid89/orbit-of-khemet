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
  if (!user) return NextResponse.json({ threads: [] })

  const projectId = req.nextUrl.searchParams.get('projectId')

  let query = supabaseAdmin
    .from('chat_threads')
    .select('id, title, hero_slug, updated_at, starred')
    .eq('user_id', user.id)
    .eq('archived', false)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data: threads } = await query
    .order('updated_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ threads: threads || [] })
}
