
'use client';

import * as React from 'react';
import { ArrowLeft, ListFilter, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { getTransactions, getAccounts } from '@/lib/supabase/queries';
import type { Transaction, Account } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TransactionsList } from '@/components/TransactionsList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  sub,
  endOfMonth,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ALL_CATEGORIES } from '@/lib/constants';

type FilterOption = 'all' | 'today' | 'week' | 'month' | 'last-month' | 'year' | 'custom';

export default function TransactionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = React.useState<Transaction[]>([]);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filter states
  const [dateFilter, setDateFilter] = React.useState<FilterOption>('all');
  const [customDateRange, setCustomDateRange] = React.useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [accountFilter, setAccountFilter] = React.useState<string>('all');
  const [ownerTagFilter, setOwnerTagFilter] = React.useState<string>('all');

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
     const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const fetchData = async () => {
        setLoading(true);
        try {
          const [transactionsData, accountsData] = await Promise.all([
            getTransactions(),
            getAccounts(),
          ]);
          const mappedTransactions = transactionsData.map(t => ({
            ...t,
            date: new Date(t.date),
          }));
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
    }
    getUser();
  }, [router, supabase.auth]);


  React.useEffect(() => {
    let filtered = [...allTransactions];

    // Date filtering
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (dateFilter) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = now;
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = now;
        break;
      case 'last-month':
        const lastMonth = sub(now, { months: 1 });
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = now;
        break;
      case 'custom':
        if(customDateRange.from && customDateRange.to){
            startDate = startOfDay(customDateRange.from);
            endDate = endOfDay(customDateRange.to);
        }
        break;
    }

    if (startDate && endDate) {
      filtered = filtered.filter(t => t.date >= startDate! && t.date <= endDate!);
    }

    // Category filtering
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Account filtering
    if (accountFilter !== 'all') {
      filtered = filtered.filter(t => t.accountId === accountFilter);
    }

    // Owner Tag filtering
    if (ownerTagFilter !== 'all') {
      if (ownerTagFilter === '_none_') {
         filtered = filtered.filter(t => !t.ownerTag);
      } else {
         filtered = filtered.filter(t => t.ownerTag === ownerTagFilter);
      }
    }

    setFilteredTransactions(filtered);
  }, [dateFilter, customDateRange, categoryFilter, accountFilter, ownerTagFilter, allTransactions]);

  const ownerTags = React.useMemo(() => {
    const tags = new Set(accounts.map(acc => acc.ownerTag).filter(Boolean));
    return Array.from(tags) as string[];
  }, [accounts]);

  const resetFilters = () => {
    setDateFilter('all');
    setCategoryFilter('all');
    setAccountFilter('all');
    setOwnerTagFilter('all');
    setCustomDateRange({ from: undefined, to: undefined });
  };


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
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Filter Tanggal</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={dateFilter}
              onValueChange={value => setDateFilter(value as FilterOption)}
            >
              <DropdownMenuRadioItem value="all">Semua</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="today">Hari Ini</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="week">Minggu Ini</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="month">Bulan Ini</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="last-month">Bulan Lalu</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="year">Tahun Ini</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <div className="px-2 pt-1.5">
                <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setDateFilter('custom')}
                    className={cn(dateFilter === 'custom' && 'bg-accent')}
                >
                    Custom
                </DropdownMenuItem>
                {dateFilter === 'custom' && (
                    <div className="flex flex-col gap-2 pt-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !customDateRange.from && 'text-muted-foreground'
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customDateRange.from ? format(customDateRange.from, 'PPP') : <span>Dari tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={customDateRange.from}
                                onSelect={(date) => setCustomDateRange(prev => ({...prev, from: date}))}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !customDateRange.to && 'text-muted-foreground'
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customDateRange.to ? format(customDateRange.to, 'PPP') : <span>Ke tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={customDateRange.to}
                                onSelect={(date) => setCustomDateRange(prev => ({...prev, to: date}))}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter Kategori</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
              <DropdownMenuRadioItem value="all">Semua Kategori</DropdownMenuRadioItem>
              {ALL_CATEGORIES.map(cat => (
                <DropdownMenuRadioItem key={cat.value} value={cat.value}>{cat.label}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter Akun</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={accountFilter} onValueChange={setAccountFilter}>
              <DropdownMenuRadioItem value="all">Semua Akun</DropdownMenuRadioItem>
              {accounts.map(acc => (
                <DropdownMenuRadioItem key={acc.id} value={acc.id}>{acc.name}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter Pemilik</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={ownerTagFilter} onValueChange={setOwnerTagFilter}>
              <DropdownMenuRadioItem value="all">Semua Pemilik</DropdownMenuRadioItem>
               <DropdownMenuRadioItem value="_none_">Tidak Ada</DropdownMenuRadioItem>
              {ownerTags.map(tag => (
                <DropdownMenuRadioItem key={tag} value={tag}>{tag}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={resetFilters} className="font-semibold text-destructive">
                Reset Semua Filter
            </DropdownMenuItem>

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
