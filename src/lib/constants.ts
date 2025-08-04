import {
  PiggyBank,
  Briefcase,
  TrendingUp,
  Utensils,
  Car,
  Home,
  HeartPulse,
  Popcorn,
  ShoppingCart,
  HelpCircle,
  ArrowRightLeft,
} from 'lucide-react';
import type { Category } from './types';

export const INCOME_CATEGORIES: Category[] = [
  { value: 'salary', label: 'Gaji', icon: Briefcase },
  { value: 'investments', label: 'Investasi', icon: TrendingUp },
  { value: 'other_income', label: 'Lainnya (Pemasukan)', icon: PiggyBank },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { value: 'food', label: 'Makanan', icon: Utensils },
  { value: 'transportation', label: 'Transportasi', icon: Car },
  { value: 'housing', label: 'Tempat Tinggal', icon: Home },
  { value: 'health', label: 'Kesehatan', icon: HeartPulse },
  { value: 'entertainment', label: 'Hiburan', icon: Popcorn },
  { value: 'shopping', label: 'Belanja', icon: ShoppingCart },
  { value: 'uncategorized', label: 'Belum Dikategorikan', icon: HelpCircle },
  { value: 'other_expense', label: 'Lainnya (Pengeluaran)', icon: PiggyBank },
];

export const ALL_CATEGORIES: Category[] = [
    ...INCOME_CATEGORIES, 
    ...EXPENSE_CATEGORIES,
    { value: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
];
