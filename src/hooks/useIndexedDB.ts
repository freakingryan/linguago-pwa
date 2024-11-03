import { useState, useEffect, useCallback } from 'react';
import { indexedDBService } from '../services/indexedDB';
import { ConversationMessage, ConversationRecord } from '../types/conversation';

export const useIndexedDB = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // 初始化数据库
    useEffect(() => {
        indexedDBService.initialize()
            .then(() => setIsLoading(false))
            .catch((err) => {
                console.error('Failed to initialize IndexedDB:', err);
                setError(err as Error);
                setIsLoading(false);
            });
    }, []);

    // 获取当前对话
    const getCurrentConversation = useCallback(async (): Promise<ConversationMessage[]> => {
        try {
            return await indexedDBService.getCurrentConversation();
        } catch (err) {
            console.error('Failed to get current conversation:', err);
            return [];
        }
    }, []);

    // 保存当前对话
    const saveCurrentConversation = useCallback(async (messages: ConversationMessage[]): Promise<void> => {
        try {
            await indexedDBService.saveCurrentConversation(messages);
        } catch (err) {
            console.error('Failed to save current conversation:', err);
            throw err;
        }
    }, []);

    // 获取所有对话历史
    const getAllConversations = useCallback(async (): Promise<ConversationRecord[]> => {
        try {
            return await indexedDBService.getAllConversations();
        } catch (err) {
            console.error('Failed to get all conversations:', err);
            return [];
        }
    }, []);

    // 添加新的对话记录
    const addConversation = useCallback(async (record: ConversationRecord): Promise<void> => {
        try {
            await indexedDBService.addConversation(record);
        } catch (err) {
            console.error('Failed to add conversation:', err);
            throw err;
        }
    }, []);

    return {
        isLoading,
        error,
        getCurrentConversation,
        saveCurrentConversation,
        getAllConversations,
        addConversation
    };
}; 