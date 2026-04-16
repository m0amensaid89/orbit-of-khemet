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

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const search = searchParams.get('search') || '';
  const tier = searchParams.get('tier') || '';
  const limit = 50;
  const offset = page * limit;

  try {
    // 1. Fetch Auth Users (we need email)
    // Unfortunately, we can't easily join auth.users with public.profiles in a single REST call
    // with wildcard search across both efficiently without an RPC.
    // We will do a basic implementation fetching profiles and augmenting with email if possible.

    // Better approach: fetch all auth users, map emails, then query profiles.
    // Given potentially many users, we should use admin.listUsers() but it's paginated.

    const { data: authUsersRes, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) throw authError;

    const emailMap = new Map();
    authUsersRes.users.forEach(u => {
      emailMap.set(u.id, u.email);
    });

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (tier) {
      query = query.eq('tier', tier);
    }

    if (search) {
      // Basic search on display_name or username (if we had them, assuming profiles might have something).
      // If profiles has no search fields, we have to filter in JS.
      // Assuming profiles has id, tier, energy_balance, is_suspended, created_at, last_active_at based on task.
    }

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: profiles, error, count } = await query;

    if (error) throw error;

    let users = profiles?.map(p => ({
      id: p.id,
      username: p.display_name || p.full_name || p.id.substring(0, 8),
      email: emailMap.get(p.id) || 'Unknown',
      tier: p.tier,
      energy_balance: p.energy_balance,
      created_at: p.created_at,
      last_active_at: p.last_active_at,
      is_suspended: p.is_suspended
    })) || [];

    if (search) {
      const lowerSearch = search.toLowerCase();
      users = users.filter(u =>
        u.email.toLowerCase().includes(lowerSearch) ||
        (u.username && u.username.toLowerCase().includes(lowerSearch))
      );
    }

    // Log action
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      action_type: 'VIEW_USERS',
      metadata: { page, search, tier }
    });

    return NextResponse.json({
      users,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
