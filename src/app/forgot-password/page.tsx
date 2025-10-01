'use client'

export const runtime = 'edge'

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
import { resetPassword } from './actions'
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
  }),
})

export default function ForgotPasswordPage() {
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const result = await resetPassword(values)
        if (result?.error) {
            toast({
                title: "Gagal Mengirim Email",
                description: result.error,
                variant: "destructive"
            })
        } else {
            toast({
                title: "Email Terkirim",
                description: "Silakan periksa email Anda untuk instruksi pengaturan ulang kata sandi.",
            })
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Lupa Kata Sandi Anda?</h1>
                    <p className="mt-2 text-muted-foreground">
                        Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang.
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
                        <Button type="submit" className="w-full">Kirim Tautan Atur Ulang</Button>
                    </form>
                </Form>
                 <div className="text-center">
                    <Link href="/login" passHref>
                        <Button variant="link">
                            Kembali ke Halaman Masuk
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
