export interface ConversationMessage {
    id: string;
    text: string;
    translation: string;
    sourceLang: string;
    sourceLangName: string;
    targetLang: string;
    timestamp: number;
    isEdited: boolean;
}

export interface ConversationRecord {
    id: string;
    messages: ConversationMessage[];
    timestamp: number;
    startTime: number;
    endTime: number;
}

export interface ConversationState {
    messages: ConversationMessage[];
    firstLang: string;
    secondLang: string;
    isRecording: boolean;
    currentSpeaker: 1 | 2;  // 1 表示第一个说话者，2 表示第二个说话者
} 