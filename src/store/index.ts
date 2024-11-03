import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import historyReducer from './slices/historySlice';
import loadingReducer from './slices/loadingSlice';
import conversationHistoryReducer from './slices/conversationHistorySlice';

export const store = configureStore({
    reducer: {
        settings: settingsReducer,
        history: historyReducer,
        loading: loadingReducer,
        conversationHistory: conversationHistoryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 