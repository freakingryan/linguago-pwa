import { useState, useEffect, useCallback } from 'react';
import { indexedDBService } from '../services/indexedDB';
import { ConversationMessage, ConversationRecord } from '../types/conversation';
import { VocabularyWord } from '../types/vocabulary';
import { Lyrics } from '../types/lyrics';
import { ClipboardItem } from '../types/clipboard';

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

    // 添加歌词相关方法
    const addLyrics = useCallback(async (lyrics: Lyrics): Promise<void> => {
        try {
            await indexedDBService.addLyrics(lyrics);
        } catch (err) {
            console.error('Failed to add lyrics:', err);
            throw err;
        }
    }, []);

    const getAllLyrics = useCallback(async (): Promise<Lyrics[]> => {
        try {
            return await indexedDBService.getAllLyrics();
        } catch (err) {
            console.error('Failed to get lyrics:', err);
            return [];
        }
    }, []);

    // 添加删除歌词方法
    const deleteLyrics = useCallback(async (id: string): Promise<void> => {
        try {
            await indexedDBService.deleteLyrics(id);
        } catch (err) {
            console.error('Failed to delete lyrics:', err);
            throw err;
        }
    }, []);

    const addClipboardItem = useCallback(async (item: ClipboardItem): Promise<void> => {
        try {
            await indexedDBService.addClipboardItem(item);
        } catch (err) {
            console.error('Failed to add clipboard item:', err);
            throw err;
        }
    }, []);

    const getAllClipboardItems = useCallback(async (): Promise<ClipboardItem[]> => {
        try {
            return await indexedDBService.getAllClipboardItems();
        } catch (err) {
            console.error('Failed to get clipboard items:', err);
            return [];
        }
    }, []);

    const updateClipboardItem = useCallback(async (item: ClipboardItem): Promise<void> => {
        try {
            await indexedDBService.updateClipboardItem(item);
        } catch (err) {
            console.error('Failed to update clipboard item:', err);
            throw err;
        }
    }, []);

    const deleteClipboardItem = useCallback(async (id: string): Promise<void> => {
        try {
            await indexedDBService.deleteClipboardItem(id);
        } catch (err) {
            console.error('Failed to delete clipboard item:', err);
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
        deleteVocabularyWord,
        addLyrics,
        getAllLyrics,
        deleteLyrics,
        addClipboardItem,
        getAllClipboardItems,
        updateClipboardItem,
        deleteClipboardItem,
    };
}; 