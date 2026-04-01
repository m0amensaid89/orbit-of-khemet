import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const threadId = req.nextUrl.searchParams.get('threadId');
    if (!threadId) {
      return Response.json({ error: 'Missing threadId parameter' }, { status: 400 });
    }

    // Verify user is authenticated
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the thread to verify ownership
    const { data: thread } = await supabaseAdmin
      .from('chat_threads')
      .select('user_id')
      .eq('id', threadId)
      .single();

    if (!thread || thread.user_id !== user.id) {
       return Response.json({ error: 'Thread not found or unauthorized' }, { status: 404 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
       throw error;
    }

    return Response.json({ messages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
