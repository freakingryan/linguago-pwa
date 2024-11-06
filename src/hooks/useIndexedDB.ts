import { useState, useEffect, useCallback } from 'react';
import { indexedDBService } from '../services/indexedDB';
import { ConversationMessage, ConversationRecord } from '../types/conversation';
import { VocabularyWord } from '../types/vocabulary';

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

    // 获取所有单词
    const getAllVocabulary = useCallback(async (): Promise<VocabularyWord[]> => {
        try {
            return await indexedDBService.getAllVocabulary();
        } catch (err) {
            console.error('Failed to get vocabulary:', err);
            return [];
        }
    }, []);

    // 添加单词
    const addVocabularyWord = useCallback(async (word: VocabularyWord): Promise<void> => {
        try {
            await indexedDBService.addVocabularyWord(word);
        } catch (err) {
            console.error('Failed to add vocabulary word:', err);
            throw err;
        }
    }, []);

    // 添加多个单词
    const addVocabularyWords = useCallback(async (words: VocabularyWord[]): Promise<void> => {
        try {
            await Promise.all(words.map(word => indexedDBService.addVocabularyWord(word)));
        } catch (err) {
            console.error('Failed to add vocabulary words:', err);
            throw err;
        }
    }, []);

    // 删除单词
    const deleteVocabularyWord = useCallback(async (id: string): Promise<void> => {
        try {
            await indexedDBService.deleteVocabularyWord(id);
        } catch (err) {
            console.error('Failed to delete vocabulary word:', err);
            throw err;
        }
    }, []);

    return {
        isLoading,
        error,
        getCurrentConversation,
        saveCurrentConversation,
        getAllConversations,
        addConversation,
        getAllVocabulary,
        addVocabularyWord,
        addVocabularyWords,
        deleteVocabularyWord
    };
}; 