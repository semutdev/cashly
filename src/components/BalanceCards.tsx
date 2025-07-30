'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Wallet, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Account } from '@/lib/types';

interface BalanceCardsProps {
  balances: (Account & { balance: number })[];
}

export function BalanceCards({ balances }: BalanceCardsProps) {
  const totalBalance = balances.reduce((acc, account) => acc + account.balance, 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
       <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
            <Banknote className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Akumulasi dari semua akun</p>
          </CardContent>
        </Card>
      {balances.map(account => (
        <Card key={`${account.id}-${account.name}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
            {account.type === 'bank' 
              ? <Landmark className="h-5 w-5 text-muted-foreground" />
              : <Wallet className="h-5 w-5 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(account.balance)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo saat ini</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
