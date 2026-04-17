import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isActive: false,
  currentOutfit: null,
  videoRef: null,
  canvasRef: null,
  adjustments: {
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  },
};

const arSlice = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    setARActive: (state, action) => {
      state.isActive = action.payload;
    },
    setAROutfit: (state, action) => {
      state.currentOutfit = action.payload;
    },
    updateAdjustments: (state, action) => {
      state.adjustments = { ...state.adjustments, ...action.payload };
    },
    resetAdjustments: (state) => {
      state.adjustments = initialState.adjustments;
    },
  },
});

export const { setARActive, setAROutfit, updateAdjustments, resetAdjustments } = arSlice.actions;
export default arSlice.reducer;
