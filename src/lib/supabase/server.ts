import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    "https://rwztlabcmstqxtcukfif.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3enRsYWJjbXN0cXh0Y3VrZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzM2MDIsImV4cCI6MjA2OTQwOTYwMn0.YJeqUNwFuD1NqMMQ1R2oS32y5NUuoNg17PRz777VFDM",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
