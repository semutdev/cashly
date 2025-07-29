'use server';

import {
  categorizeExpenseSuggestion,
  type CategorizeExpenseSuggestionInput,
  type CategorizeExpenseSuggestionOutput,
} from '@/ai/flows/categorize-expense-suggestion';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

export async function getCategorySuggestion(
  expenseDescription: string,
  pastTransactions: Transaction[]
): Promise<CategorizeExpenseSuggestionOutput> {
  const formattedTransactions: CategorizeExpenseSuggestionInput['pastTransactions'] = pastTransactions.map(t => ({
    ...t,
    date: format(t.date, 'yyyy-MM-dd'),
  }));

  const result = await categorizeExpenseSuggestion({
    expenseDescription,
    pastTransactions: formattedTransactions,
  });

  return result;
}
