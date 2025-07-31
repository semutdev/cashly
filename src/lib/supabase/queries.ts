
'use server';

import { createClient as createServerClient } from './server'
import type { Account, Transaction, Transfer } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

export async function getAccounts(): Promise<Account[]> {
    noStore();
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching accounts:', error);
        return [];
    }
    return data.map(d => ({...d, id: d.id.toString(), initialBalance: d.initial_balance}));
}

export async function getTransactions(): Promise<Transaction[]> {
    noStore();
    const supabase = createServerClient();
     const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
    return data.map(d => ({...d, id: d.id.toString(), accountId: d.account_id.toString()}));
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>): Promise<Transaction | null> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase.from('transactions').insert({
        ...transaction,
        user_id: user.id,
        account_id: transaction.accountId,
    }).select();

    if (error) {
        console.error('Error adding transaction:', error);
        return null;
    }
    const result = data?.[0]
    return result ? {...result, id: result.id.toString(), accountId: result.account_id.toString()} : null;
}

export async function addTransfer(transfer: Transfer): Promise<Transaction[] | null> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const transferTransactions = [
        {
            type: 'expense',
            amount: transfer.amount,
            date: transfer.date,
            description: transfer.description || "Transfer",
            category: 'transfer',
            account_id: transfer.fromAccountId,
            user_id: user.id,
        },
        {
            type: 'income',
            amount: transfer.amount,
            date: transfer.date,
            description: transfer.description || "Transfer",
            category: 'transfer',
            account_id: transfer.toAccountId,
            user_id: user.id,
        },
    ];

    const { data, error } = await supabase.from('transactions').insert(transferTransactions).select();

     if (error) {
        console.error('Error adding transfer transaction:', error);
        return null;
    }
    
    return data ? data.map(d => ({...d, id: d.id.toString(), accountId: d.account_id.toString()})) : null;
}


export async function addAccount(account: Omit<Account, 'id' | 'createdAt' | 'userId'>): Promise<Account | null> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const newAccountData = {
        name: account.name,
        type: account.type,
        initial_balance: account.initialBalance,
        user_id: user.id,
    };

    const { data, error } = await supabase.from('accounts').insert(newAccountData).select();

    if (error) {
        console.error('Error adding account:', error);
        return null;
    }
    const result = data?.[0]
    return result ? {...result, id: result.id.toString(), initialBalance: result.initial_balance} : null;
}

export async function updateAccountBalance(accountId: string, initialBalance: number): Promise<Account | null> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('accounts')
        .update({ initial_balance: initialBalance })
        .eq('id', accountId)
        .eq('user_id', user.id)
        .select();

    if (error) {
        console.error('Error updating account balance:', error);
        return null;
    }
    const result = data?.[0]
    return result ? {...result, id: result.id.toString(), initialBalance: result.initial_balance} : null;
}

export async function deleteAccount(accountId: string): Promise<boolean> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);
        
    if (error) {
        console.error('Error deleting account:', error);
        return false;
    }
    return true;
}

export async function deleteAllTransactions(): Promise<boolean> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
   
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting all transactions:', error);
        return false;
    }
    return true;
}

export async function resetAllBalances(): Promise<boolean> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { error } = await supabase
        .from('accounts')
        .update({ initial_balance: 0 })
        .eq('user_id', user.id);

    if (error) {
        console.error('One or more balance resets failed.', error);
        return false;
    }

    return true;
}
