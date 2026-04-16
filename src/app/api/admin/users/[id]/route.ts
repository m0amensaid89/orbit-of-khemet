/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);

    if (authError) throw authError;

    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      action_type: 'VIEW_USER_DETAILS',
      target_user_id: id
    });

    return NextResponse.json({
      ...profile,
      email: userAuth.user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'User not found or Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (admin.role !== 'leader' && admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const updates = await request.json();
    const allowedUpdates: Record<string, unknown> = {};

    if (updates.tier !== undefined) allowedUpdates.tier = updates.tier;
    if (updates.energy_balance !== undefined) allowedUpdates.energy_balance = updates.energy_balance;
    if (updates.is_suspended !== undefined) allowedUpdates.is_suspended = updates.is_suspended;

    if (Object.keys(allowedUpdates).length === 0) {
       return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', id);

    if (error) throw error;

    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      action_type: 'UPDATE_USER',
      target_user_id: id,
      metadata: allowedUpdates
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getAdminFromRequest(request);

  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) throw error;

    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      action_type: 'DELETE_USER',
      target_user_id: id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
