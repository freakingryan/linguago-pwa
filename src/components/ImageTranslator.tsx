import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UnifiedApiService } from '../services/api';
import Toast from './common/Toast';
import { useToast } from '../hooks/useToast';

const COMMON_LANGUAGES = [
    { code: 'en', name: '英语' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'es', name: '西班牙语' },
    { code: 'ru', name: '俄语' },
];

// 在 ImageTranslator 组件中添加一个新的类型定义
interface TranslationResult {
    originalText: string;
    detectedLanguage: string;
    translation: string;
}

// 添加一个解析翻译结果的函数
const parseTranslationResult = (text: string): TranslationResult | null => {
    try {
        const lines = text.split('\n').map(line => line.trim());
        const originalText = lines.find(line => line.startsWith('Original Text:'))?.replace('Original Text:', '').trim() || '';
        const detectedLanguage = lines.find(line => line.startsWith('Detected Language:'))?.replace('Detected Language:', '').trim() || '';
        const translation = lines.find(line => line.startsWith('Translation:'))?.replace('Translation:', '').trim() || '';

        return {
            originalText,
            detectedLanguage,
            translation
        };
    } catch (error) {
        console.error('Failed to parse translation result:', error);
        return null;
    }
};

const ImageTranslator: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [translation, setTranslation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { apiKey, apiUrl, model } = useSelector((state: RootState) => state.settings);
    const { toast, showToast, hideToast } = useToast();
    const [targetLanguage, setTargetLanguage] = useState('zh');
    const [customLanguage, setCustomLanguage] = useState('');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                showToast('图片大小不能超过4MB', 'error');
                return;
            }
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setTranslation('');
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                resolve(base64String.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleTranslate = async () => {
        if (!selectedImage || !apiKey) return;

        setIsLoading(true);
        try {
            const base64Data = await convertToBase64(selectedImage);
            const apiService = new UnifiedApiService(apiUrl, apiKey, model);

            const targetLang = customLanguage ||
                COMMON_LANGUAGES.find(lang => lang.code === targetLanguage)?.name ||
                targetLanguage;

            const prompt = `Please analyze this image and translate any text content you find into ${targetLang}. 
            Follow these rules:
            1. First detect the language of the text in the image
            2. Then translate the detected text into ${targetLang}
            3. Format the output as follows:
               Original Text: (original text from image)
               Detected Language: (language name)
               Translation: (translated text)
            4. If no text is found, respond with "未在图片中检测到文字"
            5. Ensure accurate translation while maintaining the original structure
            6. Handle any special characters or formatting appropriately`;

            const response = await apiService.generateImageContent(prompt, base64Data, selectedImage.type);
            console.log('AI Response:', response);
            setTranslation(response);
        } catch (error: any) {
            console.error('Translation error:', error);
            showToast(error.message || '图片翻译失败，请重试', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-input"
                />
                <label
                    htmlFor="image-input"
                    className="block text-center cursor-pointer"
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg"
                        />
                    ) : (
                        <div className="py-8">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                点击选择图片或拖拽图片到此处
                            </p>
                        </div>
                    )}
                </label>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    选择目标语言
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {COMMON_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                                setTargetLanguage(lang.code);
                                setCustomLanguage('');
                            }}
                            className={`px-3 py-2 rounded-md text-sm ${targetLanguage === lang.code && !customLanguage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
                <div className="mt-2">
                    <input
                        type="text"
                        value={customLanguage}
                        onChange={(e) => {
                            setCustomLanguage(e.target.value);
                            setTargetLanguage('');
                        }}
                        placeholder="或输入其他语言..."
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
            </div>

            <button
                onClick={handleTranslate}
                disabled={!selectedImage || isLoading || !apiKey || (!targetLanguage && !customLanguage)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? '翻译中...' : '翻译图片'}
            </button>

            {translation && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">翻译结果</h3>
                        <button
                            onClick={() => navigator.clipboard.writeText(translation)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="复制全部内容"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </button>
                    </div>

                    {(() => {
                        const result = parseTranslationResult(translation);
                        if (!result) {
                            return (
                                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                    {translation}
                                </p>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            原文
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                            {result.detectedLanguage}
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-900 dark:text-white font-medium">
                                        {result.originalText}
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            译文
                                        </span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(result.translation)}
                                            className="text-xs px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                            title="复制译文"
                                        >
                                            复制
                                        </button>
                                    </div>
                                    <p className="text-lg text-gray-900 dark:text-white font-medium">
                                        {result.translation}
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default ImageTranslator; 