import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
}

interface FinanceState {
  expenses: Expense[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 1. Supabase se expenses fetch karne ke liye Async Thunk
export const fetchExpensesFromSupabase = createAsyncThunk(
  'finance/fetchExpenses',
  async () => {
    const { data, error } = await supabase.from('expenses').select('*');
    if (error) throw error;

    return data.map((e: any) => ({
      id: e.id.toString(),
      title: e.title,
      amount: Number(e.amount) || 0,
      date: e.date || new Date().toISOString().split('T')[0]
    })) as Expense[];
  }
);

// 2. Supabase mein naya expense add karne ke liye Async Thunk
export const addExpenseToSupabase = createAsyncThunk(
  'finance/addExpense',
  async (newExpense: Omit<Expense, 'id'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          title: newExpense.title,
          amount: newExpense.amount,
          date: newExpense.date
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id.toString(),
      title: data.title,
      amount: Number(data.amount) || 0,
      date: data.date
    } as Expense;
  }
);

// 3. Supabase se expense delete karne ke liye Async Thunk
export const deleteExpenseFromSupabase = createAsyncThunk(
  'finance/deleteExpense',
  async (expenseId: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return expenseId;
  }
);

const initialState: FinanceState = {
  expenses: [],
  status: 'idle',
  error: null,
};

export const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    // Local state mein foran add karne ke liye (Optimistic update ya offline use)
    // addExpenseLocal: (state, action: PayloadAction<Expense>) => {
    //   state.expenses.push(action.payload);
    // },
    // Local state se foran delete karne ke liye
    deleteExpenseLocal: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(e => e.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpensesFromSupabase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpensesFromSupabase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.expenses = action.payload;
      })
      .addCase(fetchExpensesFromSupabase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      .addCase(addExpenseToSupabase.fulfilled, (state, action) => {
        // Agar local id temporary thi aur database se real id aagayi hai, toh usay replace kar dein ya push karein
        const exists = state.expenses.some(e => e.id === action.payload.id);
        if (!exists) {
          state.expenses.push(action.payload);
        }
      })
      .addCase(deleteExpenseFromSupabase.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
      });
  },
});

export const {  deleteExpenseLocal } = financeSlice.actions;
export default financeSlice.reducer;