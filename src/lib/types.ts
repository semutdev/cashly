export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description: string;
  category: string;
  accountId: string;
  ownerTag?: string;
};

export type TransactionWithAccount = Transaction & {
    accounts: { name: string } | null;
}

export type Category = {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type Account = {
  id: string;
  name: string;
  initialBalance: number;
  type: 'cash' | 'bank';
  ownerTag?: string;
};

export type Transfer = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: Date;
  description?: string;
};
