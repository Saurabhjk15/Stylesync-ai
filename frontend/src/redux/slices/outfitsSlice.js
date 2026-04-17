import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recommendations: [],
  savedOutfits: [],
  currentOutfit: null,
  loading: false,
  error: null,
};

const outfitsSlice = createSlice({
  name: 'outfits',
  initialState,
  reducers: {
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
    },
    setSavedOutfits: (state, action) => {
      state.savedOutfits = action.payload;
    },
    setCurrentOutfit: (state, action) => {
      state.currentOutfit = action.payload;
    },
  },
});

export const { setRecommendations, setSavedOutfits, setCurrentOutfit } = outfitsSlice.actions;
export default outfitsSlice.reducer;
