'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: any) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Could not authenticate user' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}


export async function loginWithGoogle() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `http://localhost:9002/auth/callback`,
    },
  })

  if (error) {
    console.error('Error logging in with Google:', error)
    redirect('/login?message=Could not authenticate with Google')
  }

  if (data.url) {
    redirect(data.url)
  }
}
