
'use client';

import * as React from 'react';
import { ArrowLeft, ListFilter } from 'lucide-react';
import Link from 'next/link';
import {
  getTransactions,
  getAccounts,
} from '@/lib/supabase';
import type { Transaction, Account } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TransactionsList } from '@/components/TransactionsList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { startOfWeek, startOfMonth, startOfYear, sub } from 'date-fns';

type FilterOption = 'all' | 'week' | 'month' | 'year';

export default function TransactionsPage() {
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = React.useState<Transaction[]>([]);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<FilterOption>('all');

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [transactionsData, accountsData] = await Promise.all([
          getTransactions(),
          getAccounts(),
        ]);
        const mappedTransactions = transactionsData.map(t => ({...t, date: new Date(t.date)}));
        setAllTransactions(mappedTransactions);
        setFilteredTransactions(mappedTransactions);
        setAccounts(accountsData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    const now = new Date();
    let startDate: Date | null = null;

    switch (filter) {
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      case 'all':
      default:
        setFilteredTransactions(allTransactions);
        return;
    }

    if (startDate) {
      const filtered = allTransactions.filter(t => t.date >= startDate!);
      setFilteredTransactions(filtered);
    }
  }, [filter, allTransactions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
            Semua Transaksi
          </h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuRadioGroup
              value={filter}
              onValueChange={value => setFilter(value as FilterOption)}
            >
              <DropdownMenuRadioItem value="all">
                Semua
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="week">
                Minggu Ini
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="month">
                Bulan Ini
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="year">
                Tahun Ini
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <TransactionsList
          transactions={filteredTransactions}
          accounts={accounts}
        />
      </main>
    </div>
  );
}
