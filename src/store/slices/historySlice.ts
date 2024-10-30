import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TranslationRecord {
    id: string;
    sourceText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    timestamp: number;
}

interface HistoryState {
    records: TranslationRecord[];
}

const initialState: HistoryState = {
    records: JSON.parse(localStorage.getItem('translationHistory') || '[]'),
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        addRecord: (state, action: PayloadAction<TranslationRecord>) => {
            state.records.unshift(action.payload);
            if (state.records.length > 50) {
                state.records.pop();
            }
            localStorage.setItem('translationHistory', JSON.stringify(state.records));
        },
        clearHistory: (state) => {
            state.records = [];
            localStorage.removeItem('translationHistory');
        },
    },
});

export const { addRecord, clearHistory } = historySlice.actions;
export default historySlice.reducer; 