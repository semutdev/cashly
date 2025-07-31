'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: any) {
  const supabase = createClient()

  const email = formData.email as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').origin}/auth/callback?next=/update-password`,
  })

  if (error) {
    console.error('Error resetting password:', error)
    return { error: 'Could not send password reset link.' }
  }

  return { error: null }
}
