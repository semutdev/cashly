'use server';
/**
 * @fileOverview AI flow for suggesting expense categories based on past spending habits.
 *
 * - categorizeExpenseSuggestion - A function that suggests a category for an uncategorized expense.
 * - CategorizeExpenseSuggestionInput - The input type for the categorizeExpenseSuggestion function.
 * - CategorizeExpenseSuggestionOutput - The return type for the categorizeExpenseSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseSuggestionInputSchema = z.object({
  expenseDescription: z.string().describe('Description of the uncategorized expense.'),
  pastTransactions: z.array(
    z.object({
      date: z.string().describe('Date of the transaction (YYYY-MM-DD).'),
      amount: z.number().describe('Amount of the transaction.'),
      category: z.string().describe('Category of the transaction.'),
      description: z.string().describe('Description of the transaction.'),
    })
  ).describe('A list of the user\'s past transactions.'),
});
export type CategorizeExpenseSuggestionInput = z.infer<typeof CategorizeExpenseSuggestionInputSchema>;

const CategorizeExpenseSuggestionOutputSchema = z.object({
  suggestedCategory: z.string().describe('The AI-suggested category for the expense.'),
  confidence: z.number().describe('A number between 0 and 1 indicating the AI\'s confidence in the suggestion.'),
});
export type CategorizeExpenseSuggestionOutput = z.infer<typeof CategorizeExpenseSuggestionOutputSchema>;

export async function categorizeExpenseSuggestion(input: CategorizeExpenseSuggestionInput): Promise<CategorizeExpenseSuggestionOutput> {
  return categorizeExpenseSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpenseSuggestionPrompt',
  input: {schema: CategorizeExpenseSuggestionInputSchema},
  output: {schema: CategorizeExpenseSuggestionOutputSchema},
  prompt: `You are a personal finance assistant that helps users categorize their expenses.

  Based on the user's past transactions, suggest the most appropriate category for the following uncategorized expense.

  Expense Description: {{{expenseDescription}}}

  Here are the user's past transactions:
  {{#each pastTransactions}}
  - Date: {{date}}, Amount: {{amount}}, Category: {{category}}, Description: {{description}}
  {{/each}}

  Consider the expense description and the user's past spending habits to determine the most likely category for the expense. Return a confidence score between 0 and 1 reflecting the certainty of your suggestion. The suggestedCategory should be one of the existing categories, or a new category if appropriate.  The description from the schema is:  ${CategorizeExpenseSuggestionOutputSchema.shape.suggestedCategory.description}
  The confidence should be a number between 0 and 1.  The description from the schema is: ${CategorizeExpenseSuggestionOutputSchema.shape.confidence.description}
`,
});

const categorizeExpenseSuggestionFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseSuggestionFlow',
    inputSchema: CategorizeExpenseSuggestionInputSchema,
    outputSchema: CategorizeExpenseSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
