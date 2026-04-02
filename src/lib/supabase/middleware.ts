import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token and checking user
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

 setup-core-foundation-17256597220472516335-7239126357861633104
   Protect /chat, /forge, /profile, /autopilot, /ui-builder, /sentinel, /departments, /browser routes
    AUDIT MODE — auth protection disabled temporarily
   Protect /chat, /forge, /profile, /autopilot, /ui-builder, /sentinel, /departments routes
    AUDIT MODE: auth protection disabled temporarily
 setup-core-foundation-17256597220472516335
   if (
     !user &&
     (pathname.startsWith('/brain') || pathname.startsWith('/artifacts')|| pathname.startsWith('/profile') || pathname.startsWith('/master-orbit') || pathname.startsWith('/autopilot') || pathname.startsWith('/ui-builder') || pathname.startsWith('/sentinel') || pathname.startsWith('/departments') || pathname.startsWith('/browser'))
   ) {
     if (!pathname.startsWith('/api')) {
       const url = request.nextUrl.clone()
       url.pathname = '/auth'
      url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search)
       return NextResponse.redirect(url)
     }
  // }
  return supabaseResponse
}
