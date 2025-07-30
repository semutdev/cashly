
import { createClient } from '@supabase/supabase-js'
import type { Account, Transaction, Transfer } from '@/lib/types';

const supabaseUrl = 'https://rwztlabcmstqxtcukfif.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3enRsYWJjbXN0cXh0Y3VrZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzM2MDIsImV4cCI6MjA2OTQwOTYwMn0.YJeqUNwFuD1NqMMQ1R2oS32y5NUuoNg17PRz777VFDM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) {
        console.error('Error fetching accounts:', error);
        return [];
    }
    return data.map(d => ({...d, initialBalance: d.initial_balance}));
}

export async function getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
    return data.map(d => ({...d, accountId: d.account_id}));
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> {
    const { data, error } = await supabase.from('transactions').insert({
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        account_id: transaction.accountId,
    }).select();

    if (error) {
        console.error('Error adding transaction:', error);
        return null;
    }
    const result = data?.[0]
    return result ? {...result, accountId: result.account_id} : null;
}

export async function addTransfer(transfer: Transfer): Promise<Transaction[] | null> {
    const transferTransactions = [
        {
            type: 'expense',
            amount: transfer.amount,
            date: transfer.date,
            description: transfer.description || "Transfer",
            category: 'transfer',
            account_id: transfer.fromAccountId,
        },
        {
            type: 'income',
            amount: transfer.amount,
            date: transfer.date,
            description: transfer.description || "Transfer",
            category: 'transfer',
            account_id: transfer.toAccountId,
        },
    ];

    const { data, error } = await supabase.from('transactions').insert(transferTransactions).select();

     if (error) {
        console.error('Error adding transfer transaction:', error);
        return null;
    }
    
    return data ? data.map(d => ({...d, accountId: d.account_id})) : null;
}


export async function addAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account | null> {
    const { data, error } = await supabase.from('accounts').insert({
        name: account.name,
        type: account.type,
        initial_balance: account.initialBalance,
    }).select();

    if (error) {
        console.error('Error adding account:', error);
        return null;
    }
    const result = data?.[0]
    return result ? {...result, initialBalance: result.initial_balance} : null;
}

export async function updateAccountBalance(accountId: string, initialBalance: number): Promise<Account | null> {
    const { data, error } = await supabase
        .from('accounts')
        .update({ initial_balance: initialBalance })
        .eq('id', accountId)
        .select();

    if (error) {
        console.error('Error updating account balance:', error);
        return null;
    }
    const result = data?.[0]
    return result ? {...result, initialBalance: result.initial_balance} : null;
}

export async function deleteAccount(accountId: string): Promise<boolean> {
    const { error } = await supabase.from('accounts').delete().eq('id', accountId);
    if (error) {
        console.error('Error deleting account:', error);
        return false;
    }
    return true;
}

export async function deleteAllTransactions(): Promise<boolean> {
    const { error } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
        console.error('Error deleting all transactions:', error);
        return false;
    }
    return true;
}

export async function resetAllBalances(): Promise<boolean> {
    const { data, error: fetchError } = await supabase.from('accounts').select('id');
    if (fetchError) {
        console.error('Error fetching accounts for reset:', fetchError);
        return false;
    }
    if (!data) return false;
    
    const updates = data.map(acc => 
        supabase.from('accounts').update({ initial_balance: 0 }).eq('id', acc.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(res => res.error);

    if (hasError) {
        console.error('One or more balance resets failed.');
        return false;
    }

    return true;
}
