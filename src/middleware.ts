import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(
    request,
    "https://rwztlabcmstqxtcukfif.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3enRsYWJjbXN0cXh0Y3VrZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzM2MDIsImV4cCI6MjA2OTQwOTYwMn0.YJeqUNwFuD1NqMMQ1R2oS32y5NUuoNg17PRz777VFDM"
  )
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
