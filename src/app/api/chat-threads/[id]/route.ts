/*
Pending Migrations:

Run this in Supabase SQL editor:
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_chat_threads_archived ON chat_threads(archived);
*/

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: thread } = await supabaseAdmin
    .from('chat_threads')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  return NextResponse.json({ thread });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Note: the original route deletes messages first, we can do it with user isolation or just let DB cascade
  // But let's follow the instructions which deletes only the thread
  await supabaseAdmin
    .from('chat_threads')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { archived, title } = body;

  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const updateData: Record<string, unknown> = {};
  if (typeof archived !== 'undefined') updateData.archived = archived;
  if (typeof title !== 'undefined') updateData.title = title;

  const { error } = await supabaseAdmin
    .from('chat_threads')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
