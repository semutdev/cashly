'use client';

import * as React from 'react';
import { Home, PlusCircle, Settings, List } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetTrigger } from './ui/sheet';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface BottomNavigationProps {
    children: React.ReactNode;
}

export function BottomNavigation({ children }: BottomNavigationProps) {
  const pathname = usePathname();
  const childrenArray = React.Children.toArray(children);
  const addTransactionSheet = childrenArray[0];
  const manageAccountsSheet = childrenArray[1];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        <Button
          variant="ghost"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 rounded-none h-full",
            pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            )}
          asChild
        >
          <Link href="/">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 rounded-none h-full",
            pathname === '/transactions' ? 'text-primary' : 'text-muted-foreground'
            )}
           asChild
        >
          <Link href="/transactions">
            <List className="w-6 h-6 mb-1" />
            <span className="text-xs">Transaksi</span>
          </Link>
        </Button>

        {addTransactionSheet && React.isValidElement(addTransactionSheet) && (
            <Sheet>
                 <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        className="inline-flex flex-col items-center justify-center px-5 rounded-none h-full text-muted-foreground"
                    >
                        <PlusCircle className="w-6 h-6 mb-1" />
                        <span className="text-xs">Tambah</span>
                    </Button>
                </SheetTrigger>
                {addTransactionSheet}
            </Sheet>
        )}
       

        {manageAccountsSheet && React.isValidElement(manageAccountsSheet) && (
            <Sheet>
                 <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        className="inline-flex flex-col items-center justify-center px-5 rounded-none h-full text-muted-foreground"
                    >
                        <Settings className="w-6 h-6 mb-1" />
                        <span className="text-xs">Akun</span>
                    </Button>
                </SheetTrigger>
                {manageAccountsSheet}
            </Sheet>
        )}
      </div>
    </div>
  );
}
