'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Transaction, Account } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { ALL_CATEGORIES } from '@/lib/constants';
import { Button } from './ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteTransaction } from '@/lib/supabase/queries';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';


interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
}

export function RecentTransactions({ transactions, accounts }: RecentTransactionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);


  const getCategory = (value: string) => {
    return ALL_CATEGORIES.find(c => c.value === value);
  };
  
  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'N/A';
  }

  const handleDelete = async (transactionId: string) => {
    const success = await deleteTransaction(transactionId);
    if(success) {
      toast({
        title: "Transaksi Dihapus",
        description: "Transaksi berhasil dihapus.",
        variant: "destructive"
      });
      router.refresh(); // Refresh page to reflect changes
    } else {
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus transaksi.",
        variant: "destructive"
      });
    }
    setIsDeleting(null);
    setDialogOpen(false);
  }

  return (
    <>
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus transaksi secara permanen.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleting(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                if(isDeleting) handleDelete(isDeleting)
            }}>
                Ya, Hapus
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Transaksi Terakhir</CardTitle>
            <CardDescription>5 transaksi terakhir Anda akan ditampilkan di sini.</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/transactions">
            Lihat Semua
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaksi</TableHead>
              <TableHead className="hidden md:table-cell">Akun</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => {
              const category = getCategory(transaction.category);
              const Icon = category?.icon || ArrowDownCircle;

              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'rounded-full p-2',
                          transaction.type === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-900'
                            : 'bg-rose-100 dark:bg-rose-900'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                             transaction.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(transaction.date, 'd MMM yyyy', {
                            locale: id,
                          })}
                           {' · '}
                           {category?.label}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col items-start gap-1">
                        <Badge variant="outline">{getAccountName(transaction.accountId)}</Badge>
                        {transaction.ownerTag && <Badge variant="secondary">{transaction.ownerTag}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      transaction.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-destructive'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <DropdownMenuItem asChild>
                                <Link href={`/transactions/${transaction.id}`} className="flex items-center">
                                    <Pencil className="mr-2 h-4 w-4"/> Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="flex items-center text-destructive focus:text-destructive focus:bg-destructive/10" 
                                onSelect={() => {
                                    setIsDeleting(transaction.id);
                                    setDialogOpen(true);
                                }}>
                                <Trash2 className="mr-2 h-4 w-4"/> Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
