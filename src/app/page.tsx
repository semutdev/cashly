'use client';

import * as React from 'react';
import {
  Plus,
  Settings,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { Account, Transaction, Transfer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { BalanceCards } from '@/components/BalanceCards';
import { RecentTransactions } from '@/components/RecentTransactions';
import { SpendingChart } from '@/components/SpendingChart';
import { ManageAccountsSheet } from '@/components/ManageAccountsSheet';
import { BottomNavigation } from '@/components/BottomNavigation';
import { getAccounts, getTransactions, addTransaction as dbAddTransaction, addTransfer as dbAddTransfer } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';


export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isAddSheetOpen, setAddSheetOpen] = React.useState(false);
  const [isManageSheetOpen, setManageSheetOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    }
    getUser();
  }, [router, supabase.auth]);

  React.useEffect(() => {
    if(!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [accountsData, transactionsData] = await Promise.all([
          getAccounts(),
          getTransactions()
        ]);
        setAccounts(accountsData);
        setTransactions(transactionsData.map(t => ({...t, date: new Date(t.date)})));
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };


  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = await dbAddTransaction(transaction);
    if (newTransaction) {
        setTransactions(prev => [
            {...newTransaction, date: new Date(newTransaction.date)},
            ...prev,
        ].sort((a,b) => b.date.getTime() - a.date.getTime()));
    }
    setAddSheetOpen(false);
  };
  
  const addTransfer = async (transfer: Transfer) => {
    const newTransactions = await dbAddTransfer(transfer);
    if (newTransactions) {
      setTransactions(prev => [
        ...newTransactions.map(t => ({...t, date: new Date(t.date)})),
        ...prev,
      ].sort((a,b) => b.date.getTime() - a.date.getTime()));
    }
  };

  const balances = React.useMemo(() => {
    const balanceMap = new Map<string, number>();
    accounts.forEach(acc => {
      balanceMap.set(acc.id, acc.initialBalance);
    });
    
    // Create a copy of transactions and sort them by date ascending
    const sortedTransactions = [...transactions].sort((a,b) => a.date.getTime() - b.date.getTime());

    sortedTransactions.forEach(t => {
      if (!t.accountId) return;
      const currentBalance = balanceMap.get(t.accountId) || 0;
      const newBalance = t.type === 'income' 
        ? currentBalance + t.amount 
        : currentBalance - t.amount;
      balanceMap.set(t.accountId, newBalance);
    });

    return accounts.map(account => {
        const balance = balanceMap.get(account.id) ?? account.initialBalance;
        return {
            ...account,
            balance,
        };
    });
  }, [accounts, transactions]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
        </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
        <h1 className="font-headline text-2xl font-bold text-foreground md:text-3xl">
          KeuanganKu
        </h1>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" asChild>
            <Link href="/transactions">
              Semua Transaksi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
           <ManageAccountsSheet
            isOpen={isManageSheetOpen}
            setIsOpen={setManageSheetOpen}
            accounts={accounts}
            setAccounts={setAccounts}
            setTransactions={setTransactions}
          >
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </ManageAccountsSheet>
          <AddTransactionSheet
            isOpen={isAddSheetOpen}
            setIsOpen={setAddSheetOpen}
            addTransaction={addTransaction}
            addTransfer={addTransfer}
            accounts={accounts}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Transaksi
            </Button>
          </AddTransactionSheet>
           <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BalanceCards balances={balances} />
            <RecentTransactions transactions={transactions.slice(0, 5)} accounts={accounts} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <SpendingChart transactions={transactions} />
          </div>
        </div>
      </main>
      
      <BottomNavigation>
        <AddTransactionSheet
            isOpen={isAddSheetOpen}
            setIsOpen={setAddSheetOpen}
            addTransaction={addTransaction}
            addTransfer={addTransfer}
            accounts={accounts}
        />
        <ManageAccountsSheet
            isOpen={isManageSheetOpen}
            setIsOpen={setManageSheetOpen}
            accounts={accounts}
            setAccounts={setAccounts}
            setTransactions={setTransactions}
        />
      </BottomNavigation>
    </div>
  );
}
