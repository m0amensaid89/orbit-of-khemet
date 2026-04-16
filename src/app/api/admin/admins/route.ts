/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromRequest, hashPassword } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);

  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: admins, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, email, role, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('List admins error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromRequest(request);

  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { username, email, password, role } = await request.json();

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const { error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        role,
        is_active: true,
        created_by: admin.id
      });

    if (error) throw error;

    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      action_type: 'CREATE_ADMIN',
      metadata: { username, role }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminFromRequest(request);

  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { id, role, is_active } = await request.json();

    if (!id) {
       return NextResponse.json({ error: 'Missing admin ID' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;

    const { error } = await supabaseAdmin
      .from('admin_users')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      action_type: 'UPDATE_ADMIN',
      metadata: { target_admin_id: id, updates }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminFromRequest(request);

  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: 'Missing admin ID' }, { status: 400 });
    }

    // Never hard delete, just deactivate
    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      action_type: 'DEACTIVATE_ADMIN',
      metadata: { target_admin_id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
