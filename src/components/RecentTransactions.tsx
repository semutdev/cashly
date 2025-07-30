'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Transaction, Account } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { ALL_CATEGORIES } from '@/lib/constants';

interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
}

export function RecentTransactions({ transactions, accounts }: RecentTransactionsProps) {
  const getCategory = (value: string) => {
    return ALL_CATEGORIES.find(c => c.value === value);
  };
  
  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'N/A';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaksi</TableHead>
              <TableHead className="hidden md:table-cell">Akun</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 5).map(transaction => {
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
                    <Badge variant="outline">{getAccountName(transaction.accountId)}</Badge>
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
