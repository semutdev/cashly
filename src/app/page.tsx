'use client';

import * as React from 'react';
import {
  Plus,
  Settings,
} from 'lucide-react';

import type { Account, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { BalanceCards } from '@/components/BalanceCards';
import { RecentTransactions } from '@/components/RecentTransactions';
import { SpendingChart } from '@/components/SpendingChart';
import { ManageAccountsSheet } from '@/components/ManageAccountsSheet';

const initialAccounts: Account[] = [
  { id: 'cash', name: 'Tunai', initialBalance: 1000000, type: 'cash' },
  { id: 'bank-bca', name: 'Bank BCA', initialBalance: 5000000, type: 'bank' },
];

const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    date: new Date('2024-07-01'),
    description: 'Gaji Bulanan',
    category: 'salary',
    accountId: 'bank-bca',
  },
  {
    id: '2',
    type: 'expense',
    amount: 50,
    date: new Date('2024-07-05'),
    description: 'Makan siang',
    category: 'food',
    accountId: 'cash',
  },
  {
    id: '3',
    type: 'expense',
    amount: 120,
    date: new Date('2024-07-03'),
    description: 'Transportasi ke kantor',
    category: 'transportation',
    accountId: 'bank-bca',
  },
  {
    id: '4',
    type: 'expense',
    amount: 1000,
    date: new Date('2024-07-02'),
    description: 'Sewa bulanan',
    category: 'housing',
    accountId: 'bank-bca',
  },
   {
    id: '5',
    type: 'income',
    amount: 200,
    date: new Date('2024-06-15'),
    description: 'Proyek Freelance',
    category: 'other',
    accountId: 'bank-bca',
  },
  {
    id: '6',
    type: 'expense',
    amount: 75,
    date: new Date('2024-06-20'),
    description: 'Belanja mingguan',
    category: 'shopping',
    accountId: 'cash',
  },
];


export default function HomePage() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isAddSheetOpen, setAddSheetOpen] = React.useState(false);
  const [isManageSheetOpen, setManageSheetOpen] = React.useState(false);

  React.useEffect(() => {
    const storedAccounts = localStorage.getItem('accounts');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    } else {
      setAccounts(initialAccounts);
    }

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
    if (accounts.length > 0) {
      localStorage.setItem('accounts', JSON.stringify(accounts));
    }
  }, [accounts]);

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
    setAddSheetOpen(false);
  };

  const balances = React.useMemo(() => {
    const balanceMap = new Map<string, number>();
    accounts.forEach(acc => {
      balanceMap.set(acc.id, acc.initialBalance);
    });

    transactions.forEach(t => {
      const currentBalance = balanceMap.get(t.accountId) || 0;
      const newBalance = t.type === 'income' 
        ? currentBalance + t.amount 
        : currentBalance - t.amount;
      balanceMap.set(t.accountId, newBalance);
    });

    return Array.from(balanceMap.entries()).map(([accountId, balance]) => {
      const account = accounts.find(acc => acc.id === accountId);
      return {
        ...account!,
        balance,
      };
    });
  }, [accounts, transactions]);

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
        <h1 className="font-headline text-2xl font-bold text-foreground md:text-3xl">
          KeuanganKu
        </h1>
        <div className="flex items-center gap-2">
           <ManageAccountsSheet
            isOpen={isManageSheetOpen}
            setIsOpen={setManageSheetOpen}
            accounts={accounts}
            setAccounts={setAccounts}
          >
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </ManageAccountsSheet>
          <AddTransactionSheet
            isOpen={isAddSheetOpen}
            setIsOpen={setAddSheetOpen}
            addTransaction={addTransaction}
            accounts={accounts}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Transaksi
            </Button>
          </AddTransactionSheet>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BalanceCards balances={balances} />
            <RecentTransactions transactions={transactions} accounts={accounts} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <SpendingChart transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
