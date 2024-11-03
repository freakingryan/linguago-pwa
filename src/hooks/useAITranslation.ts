import { useState, useCallback } from 'react';
import { UnifiedApiService } from '../services/api';

interface UseAITranslationProps {
    apiService: UnifiedApiService;
    onError: (error: string) => void;
}

export const useAITranslation = ({ apiService, onError }: UseAITranslationProps) => {
    const [isTranslating, setIsTranslating] = useState(false);

    const translateText = useCallback(async (
        text: string,
        targetLang: string,
        options?: {
            formatAsJson?: boolean;
            customPrompt?: string;
        }
    ) => {
        if (!text || !targetLang) return null;

        setIsTranslating(true);
        try {
            const prompt = options?.customPrompt || (options?.formatAsJson
                ? `Please perform the following tasks:
1. Detect the language of this text: "${text}"
2. Translate it to ${targetLang}
3. Format the response as JSON:
{
    "detectedLang": "detected language code",
    "sourceLangName": "language name in Chinese",
    "translation": "translated text"
}
Important: Return ONLY the JSON object, no markdown formatting or other text.`
                : `Please translate the following text to ${targetLang}. Only provide the translation without any additional explanation or text:

${text}`);

            const response = await apiService.generateText(prompt);

            if (options?.formatAsJson) {
                // 清理响应内容，移除可能的 markdown 格式
                const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
                const result = JSON.parse(cleanResponse);

                // 验证 JSON 格式的响应
                if (!result.detectedLang || !result.sourceLangName || !result.translation) {
                    throw new Error('Invalid response format');
                }
                return result;
            }

            return response;
        } catch (error) {
            console.error('Translation error:', error);
            onError('翻译失败，请重试');
            return null;
        } finally {
            setIsTranslating(false);
        }
    }, [apiService, onError]);

    return {
        isTranslating,
        translateText,
        setIsTranslating
    };
}; 