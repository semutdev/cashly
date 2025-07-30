'use client';

import * as React from 'react';
import { Home, PlusCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
    onAddTransaction: () => void;
    onManageAccounts: () => void;
}

export function BottomNavigation({ onAddTransaction, onManageAccounts }: BottomNavigationProps) {
  const [activeTab, setActiveTab] = React.useState('home');

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        <Button
          variant="ghost"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 rounded-none",
            activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'
            )}
          onClick={() => setActiveTab('home')}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs">Home</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 rounded-none",
             activeTab === 'add' ? 'text-primary' : 'text-muted-foreground'
            )}
          onClick={() => {
            setActiveTab('add');
            onAddTransaction();
            // Reset to home after sheet is likely closed
            setTimeout(() => setActiveTab('home'), 1000);
          }}
        >
          <PlusCircle className="w-6 h-6 mb-1" />
          <span className="text-xs">Tambah</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 rounded-none",
            activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'
            )}
          onClick={() => {
            setActiveTab('settings');
            onManageAccounts();
            // Reset to home after sheet is likely closed
            setTimeout(() => setActiveTab('home'), 1000);
          }}
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-xs">Akun</span>
        </Button>
      </div>
    </div>
  );
}
