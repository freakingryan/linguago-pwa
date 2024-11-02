import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BaseTranslationRecord {
    id: string;
    sourceText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    timestamp: number;
}

interface TextTranslationRecord extends BaseTranslationRecord {
    type: 'text';
}

interface ImageTranslationRecord extends BaseTranslationRecord {
    type: 'image';
    imageUrl: string; // base64格式的压缩图片
}

export type TranslationRecord = TextTranslationRecord | ImageTranslationRecord;

interface HistoryState {
    records: TranslationRecord[];
    filter: {
        type: 'all' | 'text' | 'image';
        language: string | null;
    };
}

const initialState: HistoryState = {
    records: JSON.parse(localStorage.getItem('translationHistory') || '[]'),
    filter: {
        type: 'all',
        language: null
    }
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        addRecord: (state, action: PayloadAction<TranslationRecord>) => {
            state.records.unshift(action.payload);
            if (state.records.length > 100) { // 限制历史记录数量
                state.records.pop();
            }
            localStorage.setItem('translationHistory', JSON.stringify(state.records));
        },
        clearHistory: (state) => {
            state.records = [];
            localStorage.removeItem('translationHistory');
        },
        setHistoryFilter: (state, action: PayloadAction<Partial<HistoryState['filter']>>) => {
            state.filter = { ...state.filter, ...action.payload };
        },
        clearHistoryFilter: (state) => {
            state.filter = initialState.filter;
        }
    },
});

export const {
    addRecord,
    clearHistory,
    setHistoryFilter,
    clearHistoryFilter
} = historySlice.actions;

export default historySlice.reducer; 