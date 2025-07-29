'use client';

import * as React from 'react';
import {
  Car,
  HeartPulse,
  Home as HomeIcon,
  Landmark,
  PiggyBank,
  Plus,
  Popcorn,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Wallet,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { BalanceCards } from '@/components/BalanceCards';
import { RecentTransactions } from '@/components/RecentTransactions';
import { SpendingChart } from '@/components/SpendingChart';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    date: new Date('2024-07-01'),
    description: 'Gaji Bulanan',
    category: 'salary',
    paymentMethod: 'bank',
  },
  {
    id: '2',
    type: 'expense',
    amount: 50,
    date: new Date('2024-07-05'),
    description: 'Makan siang',
    category: 'food',
    paymentMethod: 'cash',
  },
  {
    id: '3',
    type: 'expense',
    amount: 120,
    date: new Date('2024-07-03'),
    description: 'Transportasi ke kantor',
    category: 'transportation',
    paymentMethod: 'bank',
  },
  {
    id: '4',
    type: 'expense',
    amount: 1000,
    date: new Date('2024-07-02'),
    description: 'Sewa bulanan',
    category: 'housing',
    paymentMethod: 'bank',
  },
   {
    id: '5',
    type: 'income',
    amount: 200,
    date: new Date('2024-06-15'),
    description: 'Proyek Freelance',
    category: 'other',
    paymentMethod: 'bank',
  },
  {
    id: '6',
    type: 'expense',
    amount: 75,
    date: new Date('2024-06-20'),
    description: 'Belanja mingguan',
    category: 'shopping',
    paymentMethod: 'bank',
  },
];


export default function HomePage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isSheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions, (key, value) => {
        if (key === 'date') {
          return new Date(value);
        }
        return value;
      }));
    } else {
      setTransactions(initialTransactions);
    }
  }, []);

  React.useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [
      { ...transaction, id: crypto.randomUUID() },
      ...prev,
    ]);
    setSheetOpen(false);
  };

  const { cashBalance, bankBalance } = React.useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.paymentMethod === 'cash') {
          acc.cashBalance += t.type === 'income' ? t.amount : -t.amount;
        } else if (t.paymentMethod === 'bank') {
          acc.bankBalance += t.type === 'income' ? t.amount : -t.amount;
        }
        return acc;
      },
      { cashBalance: 0, bankBalance: 0 }
    );
  }, [transactions]);

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
        <h1 className="font-headline text-2xl font-bold text-foreground md:text-3xl">
          KeuanganKu
        </h1>
        <AddTransactionSheet
          isOpen={isSheetOpen}
          setIsOpen={setSheetOpen}
          addTransaction={addTransaction}
          pastTransactions={transactions}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Button>
        </AddTransactionSheet>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BalanceCards cashBalance={cashBalance} bankBalance={bankBalance} />
            <RecentTransactions transactions={transactions} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <SpendingChart transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
