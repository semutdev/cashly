'use client'

export const runtime = 'edge'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { updatePassword, updateProfile } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter.'),
  email: z.string().email(),
})

const passwordFormSchema = z
  .object({
    password: z.string().min(6, 'Kata sandi baru minimal harus 6 karakter.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok.',
    path: ['confirmPassword'],
  })

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function AccountPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  
  React.useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
        } else {
            setUser(user)
            profileForm.setValue('email', user.email || '')
            profileForm.setValue('fullName', user.user_metadata?.full_name || '')
        }
    }
    getUser()
  }, [])

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onProfileSubmit = async (values: ProfileFormValues) => {
    const result = await updateProfile({ fullName: values.fullName })
    if (result.error) {
      toast({
        title: 'Gagal Memperbarui Profil',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Profil Berhasil Diperbarui',
        description: 'Informasi profil Anda telah berhasil disimpan.',
      })
      if (result.user) {
        setUser(result.user)
      }
    }
  }

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    const result = await updatePassword(values)
    if (result.error) {
      toast({
        title: 'Gagal Memperbarui Kata Sandi',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      passwordForm.reset()
      toast({
        title: 'Kata Sandi Berhasil Diperbarui',
        description: 'Kata sandi Anda telah berhasil diubah.',
      })
    }
  }
  
  if (!user) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
        </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background">
       <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-foreground md:text-3xl">
            Akun Saya
          </h1>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl p-4 md:p-6">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Profil</CardTitle>
                <CardDescription>Perbarui informasi profil Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl>
                                <Input placeholder="Nama lengkap Anda" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                <Input disabled {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">Simpan Perubahan</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Ubah Kata Sandi</CardTitle>
                <CardDescription>Masukkan kata sandi baru Anda di bawah ini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                            control={passwordForm.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kata Sandi Baru</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Konfirmasi Kata Sandi Baru</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">Ubah Kata Sandi</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  )
}
