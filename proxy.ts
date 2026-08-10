import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', { cookies: { getAll: () => request.cookies.getAll(), setAll: values => values.forEach(({ name, value, options }) => { request.cookies.set(name, value); response = NextResponse.next({ request }); response.cookies.set(name, value, options) }) } })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && request.nextUrl.pathname.startsWith('/api/')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!user && request.nextUrl.pathname !== '/login' && !request.nextUrl.pathname.startsWith('/auth/')) return NextResponse.redirect(new URL('/login', request.url))
  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
