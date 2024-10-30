import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    apiKey: string;
    apiUrl: string;
    model: string;
    language: string;
    theme: 'light' | 'dark';
}

const initialState: SettingsState = {
    apiKey: localStorage.getItem('apiKey') || '',
    apiUrl: localStorage.getItem('apiUrl') || 'https://api.chatanywhere.tech/v1',
    model: localStorage.getItem('model') || 'gpt-4o-mini',
    language: 'zh',
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setApiKey: (state, action: PayloadAction<string>) => {
            state.apiKey = action.payload;
        },
        setApiUrl: (state, action: PayloadAction<string>) => {
            state.apiUrl = action.payload;
        },
        setModel: (state, action: PayloadAction<string>) => {
            state.model = action.payload;
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
    },
});

export const { setApiKey, setApiUrl, setModel, setLanguage, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer; 