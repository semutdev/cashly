'use client'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { updatePassword } from "../account/actions"

const formSchema = z
  .object({
    password: z.string().min(6, 'Kata sandi baru minimal harus 6 karakter.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok.',
    path: ['confirmPassword'],
  })

export default function UpdatePasswordPage() {
    const { toast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        },
    })
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const result = await updatePassword(values)
        if (result.error) {
            toast({
                title: "Gagal Memperbarui Kata Sandi",
                description: result.error,
                variant: "destructive"
            })
        } else {
            toast({
                title: "Kata Sandi Berhasil Diperbarui",
                description: "Anda sekarang dapat masuk dengan kata sandi baru Anda.",
            })
            await supabase.auth.signOut()
            router.push('/login')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Perbarui Kata Sandi Anda</h1>
                    <p className="mt-2 text-muted-foreground">
                        Masukkan kata sandi baru Anda di bawah ini.
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
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
                            control={form.control}
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
                        <Button type="submit" className="w-full">Perbarui Kata Sandi</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
