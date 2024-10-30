import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
    reducer: {
        settings: settingsReducer,
        history: historyReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 