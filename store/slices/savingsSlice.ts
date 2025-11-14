import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SavingsReminderGap = 1 | 2;

export interface SavingsTarget {
  id: string;
  purpose: string;
  amount: number;
  targetDate: string;
  reminderGapDays: SavingsReminderGap;
  lastUpdated: number;
  notificationId?: string;
  lastReminderScheduledAt?: number;
}

interface SavingsState {
  targets: SavingsTarget[];
}

const initialState: SavingsState = {
  targets: [],
};

const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {
    addSavingsTarget: (state, action: PayloadAction<SavingsTarget>) => {
      state.targets.unshift(action.payload);
    },
    updateSavingsTarget: (state, action: PayloadAction<SavingsTarget>) => {
      const index = state.targets.findIndex((item) => item.id === action.payload.id);
      if (index === -1) {
        state.targets.unshift(action.payload);
        return;
      }

      const existing = state.targets[index];
      const updated: SavingsTarget = {
        ...existing,
        ...action.payload,
      };

      state.targets.splice(index, 1);
      state.targets.unshift(updated);
    },
    recordSavingsUpdate: (
      state,
      action: PayloadAction<{
        id: string;
        lastUpdated: number;
        notificationId?: string;
        reminderScheduledAt?: number;
      }>,
    ) => {
      const target = state.targets.find((item) => item.id === action.payload.id);
      if (target) {
        target.lastUpdated = action.payload.lastUpdated;
        target.notificationId = action.payload.notificationId;
        if (action.payload.reminderScheduledAt) {
          target.lastReminderScheduledAt = action.payload.reminderScheduledAt;
        }
      }
    },
    removeSavingsTarget: (state, action: PayloadAction<string>) => {
      state.targets = state.targets.filter((target) => target.id !== action.payload);
    },
  },
});

export const { addSavingsTarget, updateSavingsTarget, recordSavingsUpdate, removeSavingsTarget } = savingsSlice.actions;
export default savingsSlice.reducer;


