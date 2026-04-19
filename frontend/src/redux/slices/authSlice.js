import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Login failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/google', payload);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Google login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Signup failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

// ── State ─────────────────────────────────────────────────────────────────────

const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('ss_user')); } catch { return null; }
})();

const initialState = {
    user:            storedUser,
    token:           localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading:         false,
    error:           null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser:    (state, action) => {
      state.user            = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Helper to handle fulfilled auth action (login, signup, googleLogin all return same shape)
    const onFulfilled = (state, action) => {
      state.loading         = false;
      state.isAuthenticated = true;
      state.token           = action.payload.token;
      state.user            = action.payload.user;
      state.error           = null;
      // Persist so initials survive page navigation/refresh
      try { localStorage.setItem('ss_user', JSON.stringify(action.payload.user)); } catch {}
    };
    const onPending  = (state) => { state.loading = true;  state.error = null; };
    const onRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(login.pending,           onPending)
      .addCase(login.fulfilled,         onFulfilled)
      .addCase(login.rejected,          onRejected)
      .addCase(loginWithGoogle.pending,  onPending)
      .addCase(loginWithGoogle.fulfilled, onFulfilled)
      .addCase(loginWithGoogle.rejected, onRejected)
      .addCase(signup.pending,          onPending)
      .addCase(signup.fulfilled,        onFulfilled)
      .addCase(signup.rejected,         onRejected)
      .addCase(logout.fulfilled, (state) => {
        state.user            = null;
        state.token           = null;
        state.isAuthenticated = false;
        state.loading         = false;
        state.error           = null;
        try { localStorage.removeItem('ss_user'); } catch {}
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
