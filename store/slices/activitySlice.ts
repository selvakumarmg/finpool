import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ActivitySubitem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  unit?: string;
  timestamp: string;
}

export type ActivityPaymentMethod = 'cash' | 'account' | 'card' | 'upi';

export interface Activity {
  id: string;
  name: string;
  category: string;
  description?: string;
  subitems: ActivitySubitem[];
  totalAmount: number;
  date: string;
  timestamp: number;
  paymentMethod: ActivityPaymentMethod;
}

interface ActivityState {
  activities: Activity[];
  totalSpent: number;
}

const initialState: ActivityState = {
  activities: [],
  totalSpent: 0,
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
      state.totalSpent += action.payload.totalAmount;
    },
    
    updateActivity: (state, action: PayloadAction<Activity>) => {
      const index = state.activities.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        const oldAmount = state.activities[index].totalAmount;
        state.activities[index] = action.payload;
        state.totalSpent = state.totalSpent - oldAmount + action.payload.totalAmount;
      }
    },
    
    deleteActivity: (state, action: PayloadAction<string>) => {
      const activity = state.activities.find(a => a.id === action.payload);
      if (activity) {
        state.totalSpent -= activity.totalAmount;
        state.activities = state.activities.filter(a => a.id !== action.payload);
      }
    },
    
    addSubitem: (state, action: PayloadAction<{ activityId: string; subitem: ActivitySubitem }>) => {
      const activity = state.activities.find(a => a.id === action.payload.activityId);
      if (activity) {
        activity.subitems.push(action.payload.subitem);
        activity.totalAmount += action.payload.subitem.price * (action.payload.subitem.quantity || 1);
        state.totalSpent += action.payload.subitem.price * (action.payload.subitem.quantity || 1);
      }
    },
    
    removeSubitem: (state, action: PayloadAction<{ activityId: string; subitemId: string }>) => {
      const activity = state.activities.find(a => a.id === action.payload.activityId);
      if (activity) {
        const subitem = activity.subitems.find(s => s.id === action.payload.subitemId);
        if (subitem) {
          const amount = subitem.price * (subitem.quantity || 1);
          activity.totalAmount -= amount;
          state.totalSpent -= amount;
          activity.subitems = activity.subitems.filter(s => s.id !== action.payload.subitemId);
        }
      }
    },
  },
});

export const { 
  addActivity, 
  updateActivity, 
  deleteActivity, 
  addSubitem, 
  removeSubitem 
} = activitySlice.actions;

export default activitySlice.reducer;

