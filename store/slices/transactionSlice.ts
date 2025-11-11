import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  timestamp: number;
}

interface TransactionState {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const initialState: TransactionState = {
  transactions: [],
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      
      // Update totals
      if (action.payload.type === 'income') {
        state.totalIncome += action.payload.amount;
      } else {
        state.totalExpense += action.payload.amount;
      }
      
      // Update balance
      state.balance = state.totalIncome - state.totalExpense;
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      const transaction = state.transactions.find(t => t.id === action.payload);
      if (transaction) {
        // Update totals
        if (transaction.type === 'income') {
          state.totalIncome -= transaction.amount;
        } else {
          state.totalExpense -= transaction.amount;
        }
        
        // Remove transaction
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
        
        // Update balance
        state.balance = state.totalIncome - state.totalExpense;
      }
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.totalIncome = 0;
      state.totalExpense = 0;
      state.balance = 0;
    },
  },
});

export const { addTransaction, deleteTransaction, clearTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;

