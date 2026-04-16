import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Verify caller is super admin using normal server client
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use admin client for queries to bypass RLS limits
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Date references
    const now = new Date();

    const d7 = new Date(now);
    d7.setDate(d7.getDate() - 7);
    const date7DaysAgo = d7.toISOString();

    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 30);
    const date30DaysAgo = d30.toISOString();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const dateTodayStart = todayStart.toISOString();

    // Week start (assuming Monday)
    const weekStart = new Date(now);
    const day = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - day + 1);
    weekStart.setHours(0, 0, 0, 0);
    const dateWeekStart = weekStart.toISOString();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dateMonthStart = monthStart.toISOString();

    // 1. Total users
    const { count: total_users } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Active 7d
    const { count: active_7d } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', date7DaysAgo);

    // 3. Active 30d
    const { count: active_30d } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', date30DaysAgo);

    // 4. New signups today
    const { count: new_signups_today } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateTodayStart);

    // 5. New signups week
    const { count: new_signups_week } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateWeekStart);

    // 6. New signups month
    const { count: new_signups_month } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateMonthStart);

    // 7. Total messages
    const { count: total_messages } = await supabaseAdmin
      .from('chat_messages')
      .select('*', { count: 'exact', head: true });

    // 8. Total threads
    const { count: total_threads } = await supabaseAdmin
      .from('chat_threads')
      .select('*', { count: 'exact', head: true });

    // 9. Top hero
    // Supabase RPC or group by might be tricky over PostgREST standard.
    // For top_hero, we fetch all threads' hero_slug and calculate top, or use a specific technique.
    // We will fetch up to 10000 thread records' hero_slug to aggregate if RPC not available.
    // However, if we can do an RPC it would be better. We'll try fetching them.
    const { data: threadsData } = await supabaseAdmin
      .from('chat_threads')
      .select('hero_slug');

    let top_hero = 'None';
    if (threadsData && threadsData.length > 0) {
      const heroCounts: Record<string, number> = {};
      let maxCount = 0;
      for (const t of threadsData) {
        if (t.hero_slug) {
          heroCounts[t.hero_slug] = (heroCounts[t.hero_slug] || 0) + 1;
          if (heroCounts[t.hero_slug] > maxCount) {
            maxCount = heroCounts[t.hero_slug];
            top_hero = t.hero_slug;
          }
        }
      }
    }

    // 10. Total usage by type
    // Again, group by might not be natively supported without RPC. We'll fetch all or use counting individually.
    // Known types: image_generation, video_generation, website_generation, etc.
    const knownTypes = ['image_generation', 'video_generation', 'website_generation'];
    const total_usage_by_type: Record<string, number> = {};

    for (const event_type of knownTypes) {
      const { count } = await supabaseAdmin
        .from('usage_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', event_type);
      total_usage_by_type[event_type] = count || 0;
    }

    return NextResponse.json({
      total_users: total_users || 0,
      active_7d: active_7d || 0,
      active_30d: active_30d || 0,
      total_messages: total_messages || 0,
      total_threads: total_threads || 0,
      total_usage_by_type,
      new_signups_today: new_signups_today || 0,
      new_signups_week: new_signups_week || 0,
      new_signups_month: new_signups_month || 0,
      top_hero
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
