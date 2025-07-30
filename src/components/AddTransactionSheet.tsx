'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants';
import type { Transaction, Account, Transfer } from '@/lib/types';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Jumlah harus positif'),
  date: z.date(),
  description: z.string().min(2, 'Deskripsi minimal 2 karakter'),
  category: z.string().min(1, 'Kategori harus diisi'),
  accountId: z.string().min(1, 'Akun harus dipilih'),
});

const transferFormSchema = z.object({
  fromAccountId: z.string().min(1, "Akun asal harus dipilih"),
  toAccountId: z.string().min(1, "Akun tujuan harus dipilih"),
  amount: z.coerce.number().positive('Jumlah harus positif'),
  date: z.date(),
  description: z.string().optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "Akun asal dan tujuan tidak boleh sama",
  path: ["toAccountId"],
});


type TransactionFormValues = z.infer<typeof transactionFormSchema>;
type TransferFormValues = z.infer<typeof transferFormSchema>;

interface AddTransactionSheetProps {
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addTransfer: (transfer: Transfer) => Promise<void>;
  accounts: Account[];
}

export function AddTransactionSheet({ children, isOpen, setIsOpen, addTransaction, addTransfer: handleAddTransfer, accounts }: AddTransactionSheetProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('expense');

  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      date: new Date(),
      description: '',
      category: '',
      accountId: '',
    },
  });

  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
        fromAccountId: '',
        toAccountId: '',
        amount: 0,
        date: new Date(),
        description: "Transfer antar akun",
    }
  });
  
    React.useEffect(() => {
    const subscription = transactionForm.watch((value, { name, type }) => {
      if (name === 'type' && type === 'change') {
        const newType = value.type || 'expense';
        setActiveTab(newType);
        transactionForm.setValue('type', newType);
      }
    });
    return () => subscription.unsubscribe();
  }, [transactionForm]);

  const transactionType = transactionForm.watch('type');
  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function onTransactionSubmit(values: TransactionFormValues) {
    await addTransaction(values);
    transactionForm.reset({
      ...transactionForm.getValues(),
      type: values.type,
      amount: 0,
      description: '',
      category: '',
      date: new Date()
    });
     toast({
        title: "Transaksi Ditambahkan",
        description: `Transaksi baru berhasil ditambahkan.`,
    })
  }
  
  async function onTransferSubmit(values: TransferFormValues) {
    await handleAddTransfer(values);
    transferForm.reset();
    setIsOpen(false);
    toast({
        title: "Transfer Berhasil",
        description: `Transfer dana berhasil dicatat.`
    })
  }

  const fromAccountId = transferForm.watch('fromAccountId');
  
  React.useEffect(() => {
    if (activeTab === 'expense') {
        transactionForm.setValue('type', 'expense');
    } else if (activeTab === 'income') {
        transactionForm.setValue('type', 'income');
    }
  }, [activeTab, transactionForm]);

  if(children){
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto">
            <SheetHeader>
            <SheetTitle>Tambah Transaksi Baru</SheetTitle>
            <SheetDescription>
                Catat pemasukan, pengeluaran atau transfer antar akun. Klik simpan jika sudah selesai.
            </SheetDescription>
            </SheetHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                    <TabsTrigger value="income">Pemasukan</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                </TabsList>
                <TabsContent value="expense">
                    <Form {...transactionForm}>
                    <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-6 pt-4">
                        <FormField
                        control={transactionForm.control}
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
                        control={transactionForm.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Jumlah</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={transactionForm.control}
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
                            control={transactionForm.control}
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
                        
                        <FormField
                        control={transactionForm.control}
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
                                        if(date) transactionForm.setValue('date', date)
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

                        <Button type="submit" className="w-full">Simpan Transaksi</Button>
                    </form>
                    </Form>
                </TabsContent>
                <TabsContent value="income">
                    <Form {...transactionForm}>
                    <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-6 pt-4">
                        <FormField
                        control={transactionForm.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Deskripsi</FormLabel>
                            <FormControl>
                                <Input placeholder="Contoh: Gaji bulanan" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        
                        <FormField
                        control={transactionForm.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Jumlah</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={transactionForm.control}
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
                            control={transactionForm.control}
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
                        
                        <FormField
                        control={transactionForm.control}
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
                                        if(date) transactionForm.setValue('date', date)
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

                        <Button type="submit" className="w-full">Simpan Transaksi</Button>
                    </form>
                    </Form>
                </TabsContent>
                <TabsContent value="transfer">
                    <Form {...transferForm}>
                        <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-6 pt-4">
                            <FormField
                                control={transferForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Transfer ke rekening tabungan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={transferForm.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Jumlah</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={transferForm.control}
                                    name="fromAccountId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dari Akun</FormLabel>
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
                                    control={transferForm.control}
                                    name="toAccountId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ke Akun</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Pilih akun" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.filter(acc => acc.id !== fromAccountId).map(acc => (
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
                            </div>
                            <FormField
                                control={transferForm.control}
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
                                            if (date) transferForm.setValue('date', date)
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
                            <Button type="submit" className="w-full">Simpan Transfer</Button>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tambah Transaksi Baru</SheetTitle>
          <SheetDescription>
            Catat pemasukan, pengeluaran atau transfer antar akun. Klik simpan jika sudah selesai.
          </SheetDescription>
        </SheetHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                <TabsTrigger value="income">Pemasukan</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
                <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-6 pt-4">
                    <FormField
                    control={transactionForm.control}
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
                    control={transactionForm.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Jumlah</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={transactionForm.control}
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
                        control={transactionForm.control}
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
                    
                    <FormField
                    control={transactionForm.control}
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
                                    if(date) transactionForm.setValue('date', date)
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

                    <Button type="submit" className="w-full">Simpan Transaksi</Button>
                </form>
                </Form>
            </TabsContent>
            <TabsContent value="income">
                 <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-6 pt-4">
                    <FormField
                    control={transactionForm.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                            <Input placeholder="Contoh: Gaji bulanan" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <FormField
                    control={transactionForm.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Jumlah</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={transactionForm.control}
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
                        control={transactionForm.control}
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
                    
                    <FormField
                    control={transactionForm.control}
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
                                    if(date) transactionForm.setValue('date', date)
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

                    <Button type="submit" className="w-full">Simpan Transaksi</Button>
                </form>
                </Form>
            </TabsContent>
            <TabsContent value="transfer">
                <Form {...transferForm}>
                    <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={transferForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Deskripsi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: Transfer ke rekening tabungan" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={transferForm.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Jumlah</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={transferForm.control}
                                name="fromAccountId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dari Akun</FormLabel>
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
                                control={transferForm.control}
                                name="toAccountId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ke Akun</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Pilih akun" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accounts.filter(acc => acc.id !== fromAccountId).map(acc => (
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
                        </div>
                        <FormField
                            control={transferForm.control}
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
                                           if (date) transferForm.setValue('date', date)
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
                        <Button type="submit" className="w-full">Simpan Transfer</Button>
                    </form>
                </Form>
            </TabsContent>
        </Tabs>
      </SheetContent>
  );
}
