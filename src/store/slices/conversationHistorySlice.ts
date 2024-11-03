import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConversationRecord } from '../../types/conversation';

interface ConversationHistoryState {
    records: ConversationRecord[];
}

const initialState: ConversationHistoryState = {
    records: []
};

const conversationHistorySlice = createSlice({
    name: 'conversationHistory',
    initialState,
    reducers: {
        saveCurrentConversation: (state, action: PayloadAction<ConversationRecord>) => {
            state.records.unshift(action.payload);
        },
        deleteConversationRecords: (state, action: PayloadAction<string[]>) => {
            state.records = state.records.filter(record => !action.payload.includes(record.id));
        },
        clearConversationHistory: (state) => {
            state.records = [];
        }
    }
});

export const {
    saveCurrentConversation,
    deleteConversationRecords,
    clearConversationHistory
} = conversationHistorySlice.actions;

export default conversationHistorySlice.reducer; 