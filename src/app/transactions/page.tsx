
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

type FilterOption = 'all' | 'today' | 'week' | 'month' | 'last-month' | 'year' | 'custom';

export default function TransactionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>(
    []
  );
  const [filteredTransactions, setFilteredTransactions] = React.useState<
    Transaction[]
  >([]);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<FilterOption>('all');
  const [customDateRange, setCustomDateRange] = React.useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  })
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
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (filter) {
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
            startDate = customDateRange.from;
            endDate = customDateRange.to;
        } else {
             setFilteredTransactions(allTransactions);
             return;
        }
        break;
      case 'all':
      default:
        setFilteredTransactions(allTransactions);
        return;
    }

    if (startDate && endDate) {
      const filtered = allTransactions.filter(
        t => t.date >= startDate! && t.date <= endDate!
      );
      setFilteredTransactions(filtered);
    }
  }, [filter, allTransactions, customDateRange]);

  const handleCustomFilterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setFilter('custom');
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
            <DropdownMenuRadioGroup
              value={filter}
              onValueChange={value => setFilter(value as FilterOption)}
            >
              <DropdownMenuRadioItem value="all">
                Semua
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="today">
                Hari Ini
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="week">
                Minggu Ini
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="month">
                Bulan Ini
              </DropdownMenuRadioItem>
               <DropdownMenuRadioItem value="last-month">
                Bulan Lalu
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="year">
                Tahun Ini
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
                <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setFilter('custom')}
                >
                    <span className={cn("w-full", filter === 'custom' && 'font-bold')}>
                      Custom
                    </span>
                </DropdownMenuItem>
                {filter === 'custom' && (
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
