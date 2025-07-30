'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import type { Account } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { addAccount, updateAccountBalance, deleteAccount } from '@/lib/supabase';


const formSchema = z.object({
  name: z.string().min(2, 'Nama bank minimal 2 karakter'),
  initialBalance: z.coerce.number().min(0, 'Saldo awal tidak boleh negatif'),
});

type FormValues = z.infer<typeof formSchema>;

interface ManageAccountsSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  accounts: Account[];
  setAccounts: (accounts: Account[] | ((prev: Account[]) => Account[])) => void;
}

export function ManageAccountsSheet({ children, isOpen, setIsOpen, accounts, setAccounts }: ManageAccountsSheetProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      initialBalance: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    const newAccountData: Omit<Account, 'id'> = {
      name: `Bank ${values.name}`,
      initialBalance: values.initialBalance,
      type: 'bank',
    }
    const newAccount = await addAccount(newAccountData);
    if(newAccount){
        setAccounts(prev => [...prev, newAccount]);
        form.reset();
        toast({
            title: "Akun Ditambahkan",
            description: `Akun bank ${values.name} berhasil ditambahkan.`,
        })
    } else {
        toast({
            title: "Gagal Menambahkan Akun",
            description: `Terjadi kesalahan saat menambahkan akun bank.`,
            variant: "destructive"
        })
    }
  }
  
  const handleBalanceChange = async (accountId: string, newBalance: number) => {
    // Optimistic UI update
    const oldAccounts = accounts;
    setAccounts(accs => accs.map(acc => 
        acc.id === accountId ? { ...acc, initialBalance: newBalance } : acc
    ));

    const updatedAccount = await updateAccountBalance(accountId, newBalance);

    if(!updatedAccount) {
        // Revert on failure
        setAccounts(oldAccounts);
        toast({
            title: "Gagal Memperbarui Saldo",
            description: `Terjadi kesalahan saat memperbarui saldo.`,
            variant: "destructive"
        })
    }
  }

  const handleDelete = async (accountId: string) => {
    const oldAccounts = accounts;
     setAccounts(accs => accs.filter(acc => acc.id !== accountId));
    
    const success = await deleteAccount(accountId);

    if (success) {
     toast({
        title: "Akun Dihapus",
        description: `Akun berhasil dihapus.`,
        variant: "destructive"
    })
    } else {
        setAccounts(oldAccounts);
        toast({
            title: "Gagal Menghapus Akun",
            description: `Pastikan tidak ada transaksi yang terkait dengan akun ini.`,
            variant: "destructive"
        })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Kelola Akun</SheetTitle>
          <SheetDescription>
            Atur saldo awal dan tambahkan rekening bank baru di sini.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 py-6">
            <h3 className="font-semibold text-lg">Saldo Awal</h3>
            <div className="space-y-4">
            {accounts.map(account => (
                <div key={account.id} className="flex items-center gap-2">
                    <div className="flex-1">
                        <label className="text-sm font-medium">{account.name}</label>
                        <Input 
                            type="number"
                            defaultValue={account.initialBalance}
                            onBlur={(e) => handleBalanceChange(account.id, parseInt(e.target.value) || 0)}
                            className="mt-1"
                            placeholder="Saldo Awal"
                        />
                    </div>
                     {account.type === 'bank' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    )}
                </div>
            ))}
            </div>
        </div>

        <hr className="my-4"/>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="font-semibold text-lg">Tambah Akun Bank Baru</h3>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bank</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Mandiri" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Awal</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Tambah Akun Bank
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
