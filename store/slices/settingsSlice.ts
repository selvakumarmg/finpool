import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import appConfig, { SupportedLanguage } from '@/config/appConfig';

export type UserPlan = 'free' | 'premium';

export const defaultTransactionCategories = {
  income: ['Salary', 'Business', 'Investment', 'Freelance', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
};

export const defaultLoanTypes = ['Personal', 'Home', 'Car', 'Education', 'Business', 'Other'];

export interface SettingsState {
  language: SupportedLanguage;
  userPlan: UserPlan;
  premiumPriceMonthly: number;
  featureFlags: Record<string, boolean>;
  transactionCategories: {
    income: string[];
    expense: string[];
  };
  loanTypes: string[];
}

const initialState: SettingsState = {
  language: appConfig.localization.defaultLanguage as SupportedLanguage,
  userPlan: 'free',
  premiumPriceMonthly: appConfig.premium.monthlyAmount,
  featureFlags: {
    ...appConfig.featureFlags,
  },
  transactionCategories: {
    income: [...defaultTransactionCategories.income],
    expense: [...defaultTransactionCategories.expense],
  },
  loanTypes: [...defaultLoanTypes],
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<SupportedLanguage>) {
      state.language = action.payload;
    },
    setUserPlan(state, action: PayloadAction<UserPlan>) {
      state.userPlan = action.payload;
    },
    setPremiumPriceMonthly(state, action: PayloadAction<number>) {
      state.premiumPriceMonthly = action.payload;
    },
    updateFeatureFlag(state, action: PayloadAction<{ key: string; enabled: boolean }>) {
      const { key, enabled } = action.payload;
      state.featureFlags[key] = enabled;
    },
    hydrateFeatureFlags(state, action: PayloadAction<Record<string, boolean>>) {
      state.featureFlags = {
        ...state.featureFlags,
        ...action.payload,
      };
    },
    addTransactionCategory(
      state,
      action: PayloadAction<{ type: keyof SettingsState['transactionCategories']; label: string }>
    ) {
      const { type, label } = action.payload;
      const normalized = label.trim();
      if (!normalized) return;

      if (!state.transactionCategories) {
        state.transactionCategories = {
          income: [...defaultTransactionCategories.income],
          expense: [...defaultTransactionCategories.expense],
        };
      }

      if (!state.transactionCategories[type]) {
        state.transactionCategories[type] = [...defaultTransactionCategories[type]];
      }

      if (!state.transactionCategories[type].some((item) => item.toLowerCase() === normalized.toLowerCase())) {
        state.transactionCategories[type].push(normalized);
      }
    },
    addLoanType(state, action: PayloadAction<string>) {
      const normalized = action.payload.trim();
      if (!normalized) return;

      if (!state.loanTypes || !Array.isArray(state.loanTypes)) {
        state.loanTypes = [...defaultLoanTypes];
      }

      const hasDuplicate = state.loanTypes.some(
        (type) => type.toLowerCase() === normalized.toLowerCase()
      );

      if (!hasDuplicate) {
        state.loanTypes.push(normalized);
      }
    },
  },
});

export const {
  setLanguage,
  setUserPlan,
  setPremiumPriceMonthly,
  updateFeatureFlag,
  hydrateFeatureFlags,
  addTransactionCategory,
  addLoanType,
} = settingsSlice.actions;

export default settingsSlice.reducer;

