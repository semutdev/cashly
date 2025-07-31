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
import { login } from './actions'
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
  }),
  password: z.string().min(1, {
    message: "Harap masukkan kata sandi Anda.",
  }),
})

export default function LoginPage() {
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const result = await login(values)
        if (result.error) {
            toast({
                title: "Gagal Masuk",
                description: result.error,
                variant: "destructive"
            })
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Masuk ke Akun Anda</h1>
                    <p className="mt-2 text-muted-foreground">
                        Belum punya akun?{' '}
                        <Link href="/signup" className="font-medium text-primary hover:underline">
                            Daftar di sini
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
                        <div className="text-right">
                             <Link href="/forgot-password" passHref>
                                <Button variant="link" className="px-0">
                                    Lupa Kata Sandi?
                                </Button>
                            </Link>
                        </div>
                        <Button type="submit" className="w-full">Masuk</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
