import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://rwztlabcmstqxtcukfif.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3enRsYWJjbXN0cXh0Y3VrZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzM2MDIsImV4cCI6MjA2OTQwOTYwMn0.YJeqUNwFuD1NqMMQ1R2oS32y5NUuoNg17PRz777VFDM"
  )
}
