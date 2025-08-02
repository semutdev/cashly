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
import { signup } from './actions'
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
  }),
  password: z.string().min(6, {
    message: "Kata sandi minimal harus 6 karakter.",
  }),
})

export default function SignupPage() {
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const result = await signup(values)
        if (result.error) {
            toast({
                title: "Gagal Mendaftar",
                description: result.error,
                variant: "destructive"
            })
        } else {
             toast({
                title: "Pendaftaran Berhasil",
                description: "Silakan periksa email Anda untuk memverifikasi akun Anda.",
            })
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6">
                 <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Akun Baru</h1>
                    <p className="mt-2 text-muted-foreground">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@contoh.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kata Sandi</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Daftar</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
