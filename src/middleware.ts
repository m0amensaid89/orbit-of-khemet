import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Auth is handled at page level via server components
  // Middleware just passes through — no session check needed here
  return NextResponse.next()
}

export const config = {
  matcher: []
}
