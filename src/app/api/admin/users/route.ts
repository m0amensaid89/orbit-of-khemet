import { NextResponse, NextRequest } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 50;

    // Get auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: page,
      perPage: pageSize,
    });

    if (authError) throw authError;

    const userIds = authData.users.map((u) => u.id);

    // Get profiles for these users
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, tier, energy_balance, is_suspended, last_active_at, created_at, full_name, display_name')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));

    const users = authData.users.map((u) => {
      const p = profilesMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        name: p?.full_name || p?.display_name || u.user_metadata?.full_name || 'Unknown',
        tier: p?.tier || 'free_scout',
        energy_balance: p?.energy_balance || 0,
        created_at: p?.created_at || u.created_at,
        last_active_at: p?.last_active_at || u.last_sign_in_at,
        is_suspended: p?.is_suspended || false,
      };
    });

    return NextResponse.json({ users, total: authData.total || 0, page, pageSize });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
