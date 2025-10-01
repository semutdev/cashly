'use client'

export const runtime = 'edge';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants';
import type { Transaction, Account } from '@/lib/types';
import { getTransactionById, getAccounts } from '@/lib/supabase/queries';
import { updateTransactionAction, deleteTransactionAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


const formSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Jumlah harus positif'),
  date: z.date(),
  description: z.string().min(2, 'Deskripsi minimal 2 karakter'),
  category: z.string().min(1, 'Kategori harus diisi'),
  accountId: z.string().min(1, 'Akun harus dipilih'),
  ownerTag: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [transaction, setTransaction] = React.useState<Transaction | null>(null);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);
  const id = params.id as string;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        type: 'expense'
    },
  });
  
  React.useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
        setLoading(true);
        const [transactionData, accountsData] = await Promise.all([
            getTransactionById(id),
            getAccounts(),
        ]);

        if (!transactionData) {
            toast({ title: 'Error', description: 'Transaksi tidak ditemukan', variant: 'destructive' });
            router.push('/');
            return;
        }
        
        setTransaction(transactionData);
        setAccounts(accountsData);

        form.reset({
            ...transactionData,
            date: new Date(transactionData.date),
            ownerTag: transactionData.ownerTag || ''
        });
        setLoading(false);
    };
    fetchData();
  }, [id, router, toast, form]);

  const transactionType = form.watch('type');
  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  const ownerTags = React.useMemo(() => {
    const tags = new Set(accounts.map(acc => acc.ownerTag).filter(Boolean));
    return Array.from(tags) as string[];
  }, [accounts]);


  const onSubmit = async (values: FormValues) => {
    const submissionValues = {
        ...values,
        ownerTag: values.ownerTag === '_none_' ? undefined : values.ownerTag
    }
    const result = await updateTransactionAction(submissionValues);
    if(result.error) {
        toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
    } else {
        toast({ title: 'Berhasil', description: 'Transaksi berhasil diperbarui.' });
        router.push('/');
        router.refresh();
    }
  }

  const handleDelete = async () => {
    if(!id) return;
    const result = await deleteTransactionAction(id);
     if(result.error) {
        toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
    } else {
        toast({ title: 'Berhasil', description: 'Transaksi berhasil dihapus.', variant: 'destructive' });
        router.push('/');
        router.refresh();
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!transaction) return null;


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
                Edit Transaksi
            </h1>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus transaksi secara permanen.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </header>

         <main className="container mx-auto max-w-2xl p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Detail Transaksi</CardTitle>
                    <CardDescription>Perbarui informasi transaksi di bawah ini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipe Transaksi</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="expense">Pengeluaran</SelectItem>
                                    <SelectItem value="income">Pemasukan</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Deskripsi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: Kopi pagi" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            
                            <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Jumlah</FormLabel>
                                <FormControl>
                                    <CurrencyInput
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="0"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Akun</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Pilih akun" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.name}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Tanggal</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                                >
                                                {field.value ? format(field.value, 'PPP') : <span>Pilih tanggal</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    if(date) form.setValue('date', date)
                                                }}
                                                disabled={date => date > new Date() || date < new Date('1900-01-01')}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ownerTag"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pemilik (Opsional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || '_none_'}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Pilih pemilik" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="_none_">Tidak Ada</SelectItem>
                                            {ownerTags.map(tag => (
                                            <SelectItem key={tag} value={tag}>
                                                {tag}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full">Simpan Perubahan</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
         </main>
    </div>
  );
}
