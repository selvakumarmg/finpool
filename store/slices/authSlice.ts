import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dob?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

// Mock user data for testing
const mockUser: User = {
  id: '1',
  email: 'demo@finpool.com',
  name: 'John Doe',
  avatar: 'https://i.pravatar.cc/150?u=demo@finpool.com',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
    },
    // Mock login - simulates successful authentication
    mockLogin: (state) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = mockUser;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, mockLogin, updateProfile } = authSlice.actions;
export default authSlice.reducer;

