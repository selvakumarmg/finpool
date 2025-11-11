import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EMI {
  month: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
}

export interface Loan {
  id: string;
  lenderName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  remainingAmount: number;
  paidAmount: number;
  emis: EMI[];
  status: 'active' | 'completed' | 'overdue';
  description?: string;
  timestamp: number;
}

interface LoanState {
  loans: Loan[];
  totalLoanAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
}

const initialState: LoanState = {
  loans: [],
  totalLoanAmount: 0,
  totalPaidAmount: 0,
  totalRemainingAmount: 0,
};

const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    addLoan: (state, action: PayloadAction<Loan>) => {
      state.loans.unshift(action.payload);
      
      // Update totals
      state.totalLoanAmount += action.payload.principalAmount;
      state.totalRemainingAmount += action.payload.remainingAmount;
    },
    payEMI: (state, action: PayloadAction<{ loanId: string; emiMonth: number }>) => {
      const loan = state.loans.find(l => l.id === action.payload.loanId);
      if (loan) {
        const emi = loan.emis.find(e => e.month === action.payload.emiMonth);
        if (emi && !emi.isPaid) {
          emi.isPaid = true;
          emi.paidDate = new Date().toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          });
          
          // Update loan amounts
          loan.paidAmount += emi.amount;
          loan.remainingAmount -= emi.amount;
          
          // Update totals
          state.totalPaidAmount += emi.amount;
          state.totalRemainingAmount -= emi.amount;
          
          // Check if loan is completed
          if (loan.remainingAmount <= 0) {
            loan.status = 'completed';
          }
        }
      }
    },
    deleteLoan: (state, action: PayloadAction<string>) => {
      const loan = state.loans.find(l => l.id === action.payload);
      if (loan) {
        // Update totals
        state.totalLoanAmount -= loan.principalAmount;
        state.totalPaidAmount -= loan.paidAmount;
        state.totalRemainingAmount -= loan.remainingAmount;
        
        // Remove loan
        state.loans = state.loans.filter(l => l.id !== action.payload);
      }
    },
    clearLoans: (state) => {
      state.loans = [];
      state.totalLoanAmount = 0;
      state.totalPaidAmount = 0;
      state.totalRemainingAmount = 0;
    },
  },
});

export const { addLoan, payEMI, deleteLoan, clearLoans } = loanSlice.actions;
export default loanSlice.reducer;

