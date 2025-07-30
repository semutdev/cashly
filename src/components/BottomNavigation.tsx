'use client';

import * as React from 'react';
import { Home, PlusCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetTrigger } from './ui/sheet';

interface BottomNavigationProps {
    children: React.ReactNode;
}

export function BottomNavigation({ children }: BottomNavigationProps) {
  const [activeTab, setActiveTab] = React.useState('home');

  const childrenArray = React.Children.toArray(children);
  const addTransactionSheet = childrenArray[0];
  const manageAccountsSheet = childrenArray[1];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        <Button
          variant="ghost"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 rounded-none h-full",
            activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'
            )}
          onClick={() => setActiveTab('home')}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs">Home</span>
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
