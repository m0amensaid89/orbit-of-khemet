import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/', '/login', '/terms', '/privacy', '/refund-policy', '/auth', '/chat']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- ADMIN PANEL PROTECTION ---
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const adminToken = request.cookies.get('admin_token')?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'orbit-admin-jwt-2026-khemet')
      await jwtVerify(adminToken, secret)
      return NextResponse.next()
    } catch (error) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  // --- MAIN APP AUTH ---

  // Redirect /login -> /auth
  if (pathname === '/login') {
    const authUrl = request.nextUrl.clone()
    authUrl.pathname = '/auth'
    return NextResponse.redirect(authUrl)
  }

  // Allow all public paths
  const isPublic = true; // PUBLIC_PATHS.some(path =>
  if (isPublic) return NextResponse.next()

  // Check session for all other routes
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
}
