import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/profile');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update profile');
    }
  }
);

export const updateMeasurements = createAsyncThunk(
  'user/updateMeasurements',
  async (measurements, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/measurements', measurements);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update measurements');
    }
  }
);

const initialState = {
  profile: null,
  measurements: null,
  bodyType: null,
  preferences: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setBodyScanResults: (state, action) => {
      state.measurements = action.payload.measurements;
      state.bodyType = action.payload.bodyType;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.measurements = null;
      state.bodyType = null;
      state.preferences = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.measurements = action.payload.measurements;
        state.bodyType = action.payload.bodyType;
        state.preferences = action.payload.preferences;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Update Measurements
      .addCase(updateMeasurements.fulfilled, (state, action) => {
        state.measurements = action.payload.measurements;
        state.bodyType = action.payload.bodyType;
      });
  },
});

export const { setBodyScanResults, clearUserData } = userSlice.actions;
export default userSlice.reducer;
