'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: any) {
  const supabase = createClient()

  const email = formData.email as string
  
  const redirectUrl = new URL('/auth/callback?next=/update-password', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002').toString()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) {
    console.error('Error resetting password:', error)
    return { error: 'Could not send password reset link.' }
  }

  return { error: null }
}
