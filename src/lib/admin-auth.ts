import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'orbit-admin-jwt-2026-khemet';
const secretKey = new TextEncoder().encode(ADMIN_JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminToken(adminId: string, role: string): Promise<string> {
  return new SignJWT({ adminId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secretKey);
}

export async function verifyAdminToken(token: string): Promise<{ adminId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { adminId: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function getAdminFromRequest(request: NextRequest): Promise<{ id: string; username: string; email: string; role: string } | null> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;

  const decoded = await verifyAdminToken(token);
  if (!decoded) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials for admin check');
    return null;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: admin, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, email, role, is_active')
    .eq('id', decoded.adminId)
    .single();

  if (error || !admin || !admin.is_active) {
    return null;
  }

  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
  };
}
