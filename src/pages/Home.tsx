import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { chatService } from '../services/api';

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

const Home = () => {
    const [sourceText, setSourceText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [customLanguage, setCustomLanguage] = useState('');
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { apiKey, apiUrl, model } = useSelector((state: RootState) => state.settings);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceText.trim() || !apiKey) return;

        const targetLang = customLanguage ||
            COMMON_LANGUAGES.find(lang => lang.code === targetLanguage)?.name ||
            targetLanguage;

        setIsLoading(true);
        setError('');

        try {
            const prompt = `请将以下文本翻译成${targetLang}：\n\n${sourceText}\n\n只需要返回翻译结果，不需要任何解释或额外的文本。`;

            const result = await chatService.sendMessage(prompt);
            setTranslation(result.choices[0].message.content.trim());
        } catch (error: any) {
            console.error('Translation error:', error);
            setError(error.response?.data?.error?.message || '翻译失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 源文本输入 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        输入要翻译的文本
                    </label>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="请输入任何语言的文本..."
                        rows={4}
                        required
                    />
                </div>

                {/* 目标语言选择 */}
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

                {/* 翻译按钮 */}
                <button
                    type="submit"
                    disabled={isLoading || !apiKey || (!targetLanguage && !customLanguage)}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? '翻译中...' : '翻译'}
                </button>
            </form>

            {/* API 配置提示 */}
            {!apiKey && (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-800 rounded-md text-yellow-800 dark:text-yellow-100">
                    请先在设置页面配置 API Key
                </div>
            )}

            {/* 错误提示 */}
            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-800 rounded-md text-red-800 dark:text-red-100">
                    {error}
                </div>
            )}

            {/* 翻译结果 */}
            {translation && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white">翻译结果：</h3>
                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {translation}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Home; 