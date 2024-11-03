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
        addConversationRecord: (state, action: PayloadAction<ConversationRecord>) => {
            state.records.unshift(action.payload);
        },
        setConversationRecords: (state, action: PayloadAction<ConversationRecord[]>) => {
            state.records = action.payload;
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
    addConversationRecord,
    setConversationRecords,
    deleteConversationRecords,
    clearConversationHistory
} = conversationHistorySlice.actions;

export default conversationHistorySlice.reducer; 