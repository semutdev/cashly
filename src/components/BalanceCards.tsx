'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BalanceCardsProps {
  cashBalance: number;
  bankBalance: number;
}

export function BalanceCards({ cashBalance, bankBalance }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Bank</CardTitle>
          <Landmark className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(bankBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Total saldo di semua rekening bank</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Tunai</CardTitle>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
          <p className="text-xs text-muted-foreground">Total uang tunai yang Anda miliki</p>
        </CardContent>
      </Card>
    </div>
  );
}
