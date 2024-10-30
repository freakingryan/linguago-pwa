import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { chatService } from '../services/api';
import { SpeechRecognitionService } from '../services/speechRecognition';
import { TextToSpeechService } from '../services/textToSpeech';
import { addRecord } from '../store/slices/historySlice';
import { v4 as uuidv4 } from 'uuid';
import Toast from '../components/common/Toast';

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

// 添加 toast 状态
interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

const Home = () => {
    const [sourceText, setSourceText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [customLanguage, setCustomLanguage] = useState('');
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [sourceLanguage, setSourceLanguage] = useState('zh');
    const [voiceError, setVoiceError] = useState<string>('');
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: '',
        type: 'info'
    });

    const { apiKey, apiUrl, model } = useSelector((state: RootState) => state.settings);

    const speechRecognition = useMemo(() => new SpeechRecognitionService(), []);
    const textToSpeech = useMemo(() => new TextToSpeechService(), []);

    const dispatch = useDispatch();

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
            const translatedText = result.choices[0].message.content.trim();
            setTranslation(translatedText);

            dispatch(addRecord({
                id: uuidv4(),
                sourceText,
                translatedText,
                sourceLang: 'auto',
                targetLang: targetLanguage || customLanguage,
                timestamp: Date.now(),
            }));
        } catch (error: any) {
            console.error('Translation error:', error);
            setError(error.response?.data?.error?.message || '翻译失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 显示 toast 的辅助函数
    const showToast = (message: string, type: ToastState['type'] = 'info') => {
        setToast({ show: true, message, type });
    };

    // 修改语音输入处理函数
    const handleVoiceInput = async () => {
        try {
            setIsListening(true);
            const transcript = await speechRecognition.startListening();
            setSourceText(transcript);
            showToast('语音识别成功', 'success');
        } catch (error) {
            console.error('Speech recognition error:', error);
            showToast(typeof error === 'string' ? error : '语音识别失败', 'error');
        } finally {
            setIsListening(false);
        }
    };

    const handleSpeak = (text: string, language: string) => {
        textToSpeech.speak(text, language);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* 添加 Toast 组件 */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 源文本输入 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        输入要翻译的文本
                    </label>
                    <div className="relative">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12"
                            placeholder="请输入任何语言的文本..."
                            rows={4}
                            required
                        />
                        {/* 语音输入按钮移到右下角 */}
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            disabled={isListening}
                            className="absolute right-2 bottom-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            title="语音输入"
                        >
                            {isListening ? (
                                <svg className="w-6 h-6 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 18.5a6.5 6.5 0 006.5-6.5V8.5a6.5 6.5 0 00-13 0V12a6.5 6.5 0 006.5 6.5z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M16 12a4 4 0 01-8 0V8a4 4 0 118 0v4z"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                </svg>
                            )}
                        </button>
                        {/* 错误提示放在输入框下方 */}
                        {voiceError && (
                            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {voiceError}
                            </div>
                        )}
                    </div>
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
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">翻译结果：</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSpeak(translation, targetLanguage)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="朗读翻译结果"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(translation)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="复制翻译结果"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {translation}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Home; 