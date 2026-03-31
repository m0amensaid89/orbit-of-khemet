import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const validHeroSlugs = ['thoren','ramet','nexar','lyra','kairo','nefra','horusen'];

export async function middleware(request: NextRequest) {
  // Update session handles supabase auth and cookies
  // It will automatically redirect to /auth if accessing protected routes without auth
  const response = await updateSession(request);

  // If the updateSession already redirected us, just return it
  if (response.headers.get('location')) {
    return response;
  }

  const { pathname, searchParams } = request.nextUrl;

  // Handle existing route rules
  if (pathname === '/chat') {
    const agent = searchParams.get('agent');
    const hero = searchParams.get('hero');
    if (!agent && !hero) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (hero && !agent && hero !== 'MASTER') {
      const slug = hero.toLowerCase();
      if (validHeroSlugs.includes(slug)) {
        return NextResponse.redirect(new URL(`/heroes/${slug}`, request.url));
      }
    }
  }

  if (pathname === '/heroes') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};