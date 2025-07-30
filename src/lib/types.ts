export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description: string;
  category: string;
  accountId: string;
};

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
};
