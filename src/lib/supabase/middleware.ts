import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, supabaseUrl: string, supabaseAnonKey: string) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with CSRF protection.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicUrls = ['/login', '/signup', '/forgot-password', '/auth/callback', '/auth/confirm', '/auth/auth-code-error'];

  if (!user && !publicUrls.some(url => request.nextUrl.pathname.startsWith(url))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && publicUrls.some(url => request.nextUrl.pathname.startsWith(url) && url !== '/auth/callback')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }


  return supabaseResponse
}
