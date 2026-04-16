import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const now = new Date();

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Week starts on Sunday
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();


    const [
      { count: totalUsers },
      { count: active7d },
      { count: active30d },
      { count: totalMessages },
      { count: totalThreads },
      { count: newToday },
      { count: newWeek },
      { count: newMonth },
      { data: usageData },
      { data: threadsData }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('last_active_at', sevenDaysAgo),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('last_active_at', thirtyDaysAgo),
      supabaseAdmin.from('chat_messages').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('chat_threads').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('created_at', startOfToday),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('created_at', startOfWeek),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('created_at', startOfMonth),
      supabaseAdmin.from('usage_events').select('event_type'),
      supabaseAdmin.from('chat_threads').select('hero_slug')
    ]);

    // Group usage by type
    const usage_by_type: Record<string, number> = {};
    if (usageData) {
      usageData.forEach(event => {
        const type = event.event_type || 'unknown';
        usage_by_type[type] = (usage_by_type[type] || 0) + 1;
      });
    }

    // Top hero calculation
    let top_hero = 'none';
    if (threadsData && threadsData.length > 0) {
      const heroCounts: Record<string, number> = {};
      threadsData.forEach(thread => {
        const hero = thread.hero_slug || 'unknown';
        heroCounts[hero] = (heroCounts[hero] || 0) + 1;
      });
      top_hero = Object.keys(heroCounts).reduce((a, b) => heroCounts[a] > heroCounts[b] ? a : b, 'none');
    }

    return NextResponse.json({
      total_users: totalUsers || 0,
      active_7d: active7d || 0,
      active_30d: active30d || 0,
      total_messages: totalMessages || 0,
      total_threads: totalThreads || 0,
      new_today: newToday || 0,
      new_week: newWeek || 0,
      new_month: newMonth || 0,
      usage_by_type,
      top_hero
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
