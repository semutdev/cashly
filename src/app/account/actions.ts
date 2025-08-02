'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'Kata sandi baru minimal harus 6 karakter.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok.',
    path: ['confirmPassword'],
  })

export async function updatePassword(formData: z.infer<typeof updatePasswordSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: formData.password,
  })

  if (error) {
    return { error: 'Gagal memperbarui kata sandi.' }
  }

  return { error: null }
}

export async function updateProfile(formData: { fullName: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Pengguna tidak ditemukan.' };
    }

    const { data: userData, error } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
    });
    
    if (error) {
        return { error: 'Gagal memperbarui profil.' };
    }

    return { error: null, user: userData.user };
}
