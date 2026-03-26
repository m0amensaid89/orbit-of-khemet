import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const validHeroSlugs = ['thoren','ramet','nexar','lyra','kairo','nefra','horusen'];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat', '/heroes'],
};
