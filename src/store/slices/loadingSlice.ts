import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
    isLoading: boolean;
    loadingType?: 'processing' | 'recording' | 'translating';
}

const initialState: LoadingState = {
    isLoading: false,
    loadingType: undefined
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        startLoading: (state, action: PayloadAction<LoadingState['loadingType']>) => {
            state.isLoading = true;
            state.loadingType = action.payload;
        },
        stopLoading: (state) => {
            state.isLoading = false;
            state.loadingType = undefined;
        }
    }
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export default loadingSlice.reducer; 