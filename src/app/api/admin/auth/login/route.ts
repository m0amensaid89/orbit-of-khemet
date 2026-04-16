import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword, createAdminToken } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, role, password_hash, is_active')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials or inactive account' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    const token = await createAdminToken(admin.id, admin.role);

    const response = NextResponse.json({
      success: true,
      role: admin.role,
      username: admin.username
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/admin',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
