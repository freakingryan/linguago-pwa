import { useCallback } from 'react';
import { UnifiedApiService } from '../services/api';
import { Dispatch } from 'redux';
import { startLoading, stopLoading } from '../store/slices/loadingSlice';
import { PromptService } from '../services/promptService';

interface UseAITranslationProps {
    apiService: UnifiedApiService;
    onError: (error: string) => void;
    dispatch: Dispatch;
}

export const useAITranslation = ({ apiService, onError, dispatch }: UseAITranslationProps) => {
    const translateText = useCallback(async (
        text: string,
        targetLang: string,
        options?: {
            formatAsJson?: boolean;
            customPrompt?: string;
        }
    ) => {
        if (!text || !targetLang) return null;

        try {
            dispatch(startLoading('translating'));
            const prompt = options?.customPrompt ||
                PromptService.getTranslationPrompt(text, targetLang, options?.formatAsJson);

            const response = await apiService.generateText(prompt, options?.formatAsJson);
            return response;
        } catch (error) {
            onError('翻译失败，请重试');
            return null;
        } finally {
            dispatch(stopLoading());
        }
    }, [apiService, onError, dispatch]);

    return { translateText };
}; 