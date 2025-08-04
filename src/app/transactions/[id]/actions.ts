
'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { updateTransaction, deleteTransaction } from '@/lib/supabase/queries';
import type { Transaction } from '@/lib/types';


const formSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Jumlah harus positif'),
  date: z.date(),
  description: z.string().min(2, 'Deskripsi minimal 2 karakter'),
  category: z.string().min(1, 'Kategori harus diisi'),
  accountId: z.string().min(1, 'Akun harus dipilih'),
  ownerTag: z.string().optional(),
});


export async function updateTransactionAction(values: z.infer<typeof formSchema>) {
    const validatedFields = formSchema.safeParse(values);

    if(!validatedFields.success) {
        return { error: 'Input tidak valid.' };
    }

    const result = await updateTransaction(validatedFields.data as Transaction);

    if(!result) {
        return { error: 'Gagal memperbarui transaksi.' };
    }
    
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath(`/transactions/${result.id}`);

    return { error: null };
}

export async function deleteTransactionAction(id: string) {
    if(!id) {
        return { error: 'ID Transaksi tidak valid.'}
    }
    const success = await deleteTransaction(id);

    if(!success) {
        return { error: 'Gagal menghapus transaksi.' };
    }

    revalidatePath('/');
    revalidatePath('/transactions');

    return { error: null };
}
