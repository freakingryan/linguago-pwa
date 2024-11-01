import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    apiKey: string;
    apiUrl: string;
    model: string;
    theme: 'light' | 'dark';
}

const initialState: SettingsState = {
    apiKey: localStorage.getItem('apiKey') || '',
    apiUrl: localStorage.getItem('apiUrl') || 'https://generativelanguage.googleapis.com/v1beta',
    model: localStorage.getItem('model') || 'gemini-1.5-flash',
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setApiKey: (state, action: PayloadAction<string>) => {
            state.apiKey = action.payload;
            localStorage.setItem('apiKey', action.payload);
        },
        setApiUrl: (state, action: PayloadAction<string>) => {
            state.apiUrl = action.payload;
            localStorage.setItem('apiUrl', action.payload);
        },
        setModel: (state, action: PayloadAction<string>) => {
            state.model = action.payload;
            localStorage.setItem('model', action.payload);
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
    },
});

export const {
    setApiKey,
    setApiUrl,
    setModel,
    setTheme
} = settingsSlice.actions;
export default settingsSlice.reducer; 