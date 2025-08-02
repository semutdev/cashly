'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: any) {
  const supabase = createClient()

  const data = {
    email: formData.email as string,
    password: formData.password as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: 'Could not authenticate user' };
  }

  revalidatePath('/', 'layout')
  // redirect is not needed here, user will be prompted to check email
  return { error: null };
}
