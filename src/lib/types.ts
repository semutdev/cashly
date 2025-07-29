export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description: string;
  category: string;
  paymentMethod?: 'cash' | 'bank';
};

export type Category = {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};
