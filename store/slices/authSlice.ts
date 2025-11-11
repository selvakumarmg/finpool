import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
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
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, mockLogin } = authSlice.actions;
export default authSlice.reducer;

