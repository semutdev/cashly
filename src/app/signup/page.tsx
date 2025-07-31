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
import { signup, signupWithGoogle } from './actions'
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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.87 0-7-3.13-7-7s3.13-7 7-7c2.25 0 3.67.92 4.48 1.69l2.52-2.52C18.15 1.57 15.6.53 12.48.53c-6.18 0-11.17 4.92-11.17 11s4.99 11 11.17 11c6.12 0 10.4-4.12 10.4-10.55 0-.75-.07-1.45-.18-2.18H12.48z" />
  </svg>
);


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
                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Atau lanjutkan dengan
                        </span>
                    </div>
                </div>
                <form action={signupWithGoogle}>
                    <Button variant="outline" type="submit" className="w-full">
                        <GoogleIcon className="mr-2 h-4 w-4 fill-current" />
                        Daftar dengan Google
                    </Button>
                </form>
            </div>
        </div>
    )
}
