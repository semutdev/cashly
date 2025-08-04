'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Wallet, Banknote, Users, User as UserIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Account } from '@/lib/types';
import * as React from 'react';

interface BalanceCardsProps {
  balances: (Account & { balance: number })[];
}

export function BalanceCards({ balances }: BalanceCardsProps) {
  const totalBalance = balances.reduce((acc, account) => acc + account.balance, 0);

  const groupedBalances = React.useMemo(() => {
    const groups: { [key: string]: number } = {};
    balances.forEach(account => {
      const owner = account.ownerTag || 'Lainnya';
      if (!groups[owner]) {
        groups[owner] = 0;
      }
      groups[owner] += account.balance;
    });
    return groups;
  }, [balances]);
  
  const hasGroups = Object.keys(groupedBalances).some(key => key !== 'Lainnya') || Object.keys(groupedBalances).length > 1;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
       <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo Keseluruhan</CardTitle>
            <Banknote className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Akumulasi dari semua akun</p>
          </CardContent>
        </Card>

      {hasGroups && Object.entries(groupedBalances).map(([owner, balance]) => (
        <Card key={owner}>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo {owner}</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance)}
            </div>
             <p className="text-xs text-muted-foreground">Akumulasi dari semua akun milik {owner}</p>
          </CardContent>
        </Card>
      ))}

      <div className="md:col-span-2 mt-4">
        <h3 className="text-lg font-semibold mb-2">Rincian Akun</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {balances.map(account => (
          <Card key={`${account.id}-${account.name}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
               {account.ownerTag && <Badge variant="secondary" className="text-xs">{account.ownerTag}</Badge>}
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
      </div>
    </div>
  );
}
