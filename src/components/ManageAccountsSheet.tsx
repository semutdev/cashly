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
import { CurrencyInput } from '@/components/ui/currency-input';
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
import { useToast } from '@/hooks/use-toast';
import type { Account } from '@/lib/types';
import { PlusCircle, Trash2, AlertTriangle, Save } from 'lucide-react';
import { addAccount, updateAccount, deleteAccount, deleteAllTransactions, resetAllBalances } from '@/lib/supabase/queries';
import { Badge } from './ui/badge';


const addAccountFormSchema = z.object({
  name: z.string().min(2, 'Nama akun minimal 2 karakter'),
  initialBalance: z.coerce.number().min(0, 'Saldo awal tidak boleh negatif'),
  type: z.enum(['bank', 'cash'], {
    required_error: "Tipe akun harus dipilih"
  }),
  ownerTag: z.string().optional(),
});

type AddAccountFormValues = z.infer<typeof addAccountFormSchema>;

interface ManageAccountsSheetProps {
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  accounts: Account[];
  setAccounts: (accounts: Account[] | ((prev: Account[]) => Account[])) => void;
  setTransactions: (transactions: any[] | ((prev: any[]) => any[])) => void;
}

const EditableAccountRow = ({ account: initialAccount, onUpdate, onDelete }: { account: Account, onUpdate: (account: Account) => void, onDelete: (accountId: string) => void}) => {
    const {toast} = useToast();
    const [account, setAccount] = React.useState(initialAccount);
    const [isSaving, setIsSaving] = React.useState(false);
    
    const handleSave = async () => {
        setIsSaving(true);
        const updatedAccount = await updateAccount(account);
        if(updatedAccount) {
            onUpdate(updatedAccount);
            toast({
                title: "Akun Diperbarui",
                description: `Akun ${updatedAccount.name} berhasil diperbarui.`
            })
        } else {
             toast({
                title: "Gagal Memperbarui",
                description: `Gagal memperbarui akun.`,
                variant: "destructive"
            })
        }
        setIsSaving(false);
    }
    
    return (
        <div className="p-3 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
                <Input
                    value={account.name}
                    onChange={(e) => setAccount(prev => ({...prev, name: e.target.value}))}
                    placeholder="Nama Akun"
                    className="flex-1 font-semibold"
                />
                 <Button variant="ghost" size="icon" onClick={() => onDelete(account.id)} disabled={isSaving}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Saldo Awal</label>
                    <CurrencyInput
                        value={account.initialBalance}
                        onValueChange={(newBalance) => setAccount(prev => ({...prev, initialBalance: newBalance}))}
                        placeholder="Saldo Awal"
                        disabled={isSaving}
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Tag Pemilik</label>
                    <Input
                        value={account.ownerTag || ''}
                        onChange={(e) => setAccount(prev => ({...prev, ownerTag: e.target.value}))}
                        placeholder="Contoh: Istri"
                        disabled={isSaving}
                    />
                </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="w-full">
                <Save className="mr-2 h-4 w-4"/>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
        </div>
    )
}


export function ManageAccountsSheet({ children, isOpen, setIsOpen, accounts, setAccounts, setTransactions }: ManageAccountsSheetProps) {
  const { toast } = useToast();
  
  const form = useForm<AddAccountFormValues>({
    resolver: zodResolver(addAccountFormSchema),
    defaultValues: {
      name: '',
      initialBalance: 0,
      type: 'bank',
      ownerTag: '',
    },
  });

  async function onSubmit(values: AddAccountFormValues) {
    const newAccount = await addAccount(values);
    if(newAccount){
        setAccounts(prev => [...prev, newAccount]);
        form.reset();
        toast({
            title: "Akun Ditambahkan",
            description: `Akun ${values.name} berhasil ditambahkan.`,
        })
    } else {
        toast({
            title: "Gagal Menambahkan Akun",
            description: `Terjadi kesalahan saat menambahkan akun.`,
            variant: "destructive"
        })
    }
  }

  const handleUpdateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };
  
  const handleDelete = async (accountId: string) => {
    // Prevent deleting the last account
    if (accounts.length <= 1) {
        toast({
            title: "Tidak Dapat Menghapus",
            description: "Anda harus memiliki setidaknya satu akun.",
            variant: "destructive"
        });
        return;
    }
    
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
  
  const handleResetTransactions = async () => {
    const success = await deleteAllTransactions();
    if(success) {
      setTransactions([]);
      toast({
        title: "Transaksi Dihapus",
        description: "Semua data transaksi berhasil dihapus.",
      });
    } else {
      toast({
        title: "Gagal Menghapus Transaksi",
        description: "Terjadi kesalahan saat menghapus data transaksi.",
        variant: "destructive",
      });
    }
  };

  const handleResetBalances = async () => {
    const success = await resetAllBalances();
    if(success) {
      setAccounts(prev => prev.map(acc => ({...acc, initialBalance: 0})));
      toast({
        title: "Saldo Direset",
        description: "Semua saldo awal akun berhasil direset menjadi nol.",
      });
    } else {
      toast({
        title: "Gagal Mereset Saldo",
        description: "Terjadi kesalahan saat mereset saldo awal.",
        variant: "destructive",
      });
    }
  };
  
  const handleResetAll = async () => {
    const [transactionsSuccess, balancesSuccess] = await Promise.all([
      deleteAllTransactions(),
      resetAllBalances()
    ]);

    if(transactionsSuccess && balancesSuccess) {
      setTransactions([]);
      setAccounts(prev => prev.map(acc => ({...acc, initialBalance: 0})));
      toast({
        title: "Semua Data Direset",
        description: "Seluruh transaksi dan saldo awal telah berhasil direset.",
      });
    } else {
      toast({
        title: "Gagal Mereset Data",
        description: `Gagal menghapus transaksi: ${transactionsSuccess}. Gagal mereset saldo: ${balancesSuccess}.`,
        variant: "destructive",
      });
    }
  };


  const content = (
      <>
        <SheetHeader>
          <SheetTitle>Kelola Akun</SheetTitle>
          <SheetDescription>
            Atur saldo awal, nama, dan tag pemilik. Tambah akun baru di sini.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 py-6">
            <h3 className="font-semibold text-lg">Akun Tersimpan</h3>
            <div className="space-y-3">
            {accounts.map(account => (
                <EditableAccountRow key={account.id} account={account} onUpdate={handleUpdateAccount} onDelete={handleDelete} />
            ))}
            </div>
        </div>

        <hr className="my-4"/>

        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="font-semibold text-lg">Tambah Akun Baru</h3>
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nama Akun</FormLabel>
                <FormControl>
                    <Input placeholder="Contoh: Dompet, Mandiri" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            
            <FormField
                control={form.control}
                name="ownerTag"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tag Pemilik (Opsional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: Istri, Suami" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />


            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Akun</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="cash">Kas</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>

            <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Tambah Akun
            </Button>
        </form>
        </Form>
        <hr className="my-4"/>

        <div className="space-y-4 py-6">
          <h3 className="flex items-center font-semibold text-lg text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5"/>
            Zona Berbahaya
          </h3>
          <p className="text-sm text-muted-foreground">
            Tindakan di bawah ini tidak dapat diurungkan. Harap berhati-hati.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">Reset Semua Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus SEMUA transaksi dan mengatur ulang SEMUA saldo awal akun Anda menjadi nol. Data yang sudah dihapus tidak bisa dikembalikan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetAll}>Ya, Reset Semua</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1">Hapus Semua Transaksi</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus SEMUA data transaksi Anda. Saldo awal akun tidak akan berubah. Data yang sudah dihapus tidak bisa dikembalikan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetTransactions}>Ya, Hapus Transaksi</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button variant="outline" className="flex-1">Reset Saldo Awal</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan mengatur ulang SEMUA saldo awal akun Anda menjadi nol. Data transaksi tidak akan terpengaruh.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetBalances}>Ya, Reset Saldo</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </>
  )
  
  if (children) {
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto max-h-screen">
                {content}
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <SheetContent className="overflow-y-auto max-h-screen">
      {content}
    </SheetContent>
  );
}
