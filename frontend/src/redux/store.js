import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import outfitsReducer from './slices/outfitsSlice';
import arReducer from './slices/arSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    outfits: outfitsReducer,
    ar: arReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['ar/setVideoRef', 'ar/setCanvasRef'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.videoRef', 'payload.canvasRef'],
        // Ignore these paths in the state
        ignoredPaths: ['ar.videoRef', 'ar.canvasRef'],
      },
    }),
});

export default store;
