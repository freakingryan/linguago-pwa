import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { TextToSpeechService } from '../services/textToSpeech';
import { addRecord } from '../store/slices/historySlice';
import { v4 as uuidv4 } from 'uuid';
import Toast from '../components/common/Toast';
import { AudioRecorderService } from '../services/audioRecorder';
import { UnifiedApiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import RecordingOverlay from '../components/common/RecordingOverlay';
import ImageTranslator from '../components/ImageTranslator';

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
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const audioRecorder = useMemo(() => new AudioRecorderService(), []);
    const { apiKey, apiUrl, model } = useSelector((state: RootState) => state.settings);
    const apiService = useMemo(() => new UnifiedApiService(apiUrl, apiKey, model), [apiUrl, apiKey, model]);

    const textToSpeech = useMemo(() => new TextToSpeechService(), []);

    const dispatch = useDispatch();

    // 使用 useToast hook
    const { toast, showToast, hideToast } = useToast();

    // 添加录音时长状态
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingTimer = useRef<NodeJS.Timeout | null>(null);

    const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceText.trim() || !apiKey) return;

        const targetLang = customLanguage ||
            COMMON_LANGUAGES.find(lang => lang.code === targetLanguage)?.name ||
            targetLanguage;

        setIsLoading(true);

        try {
            const prompt = `Please translate the following text to ${targetLang}. Only provide the translation without any additional explanation or text:

${sourceText}`;

            const translatedText = await apiService.generateText(prompt);
            setTranslation(translatedText);

            dispatch(addRecord({
                id: uuidv4(),
                type: 'text',
                sourceText,
                translatedText,
                sourceLang: 'auto',
                targetLang: targetLanguage || customLanguage,
                timestamp: Date.now(),
            }));
        } catch (error: any) {
            console.error('Translation error:', error);
            showToast(error.message || '翻译失败，请重试', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // 修改语音输入处理函数
    const handleVoiceInput = async () => {
        if (isProcessing) return;

        try {
            if (!isRecording) {
                await audioRecorder.startRecording();
                setIsRecording(true);
                showToast('开始录音...', 'info');

                // 开始计时
                setRecordingDuration(0);
                recordingTimer.current = setInterval(() => {
                    setRecordingDuration(prev => prev + 1);
                }, 1000);
            } else {
                setIsRecording(false);
                setIsProcessing(true);
                showToast('正在处理录音...', 'info');

                // 停止计时
                if (recordingTimer.current) {
                    clearInterval(recordingTimer.current);
                    recordingTimer.current = null;
                }

                const audioBlob = await audioRecorder.stopRecording();
                const text = await apiService.processAudio(audioBlob);
                setSourceText(text);
                showToast('录音处理完成', 'success');
                setRecordingDuration(0);
            }
        } catch (error) {
            console.error('Voice input error:', error);
            showToast(error instanceof Error ? error.message : '录音处理失败', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // 在组件卸载时清理计时器
    useEffect(() => {
        return () => {
            if (recordingTimer.current) {
                clearInterval(recordingTimer.current);
            }
        };
    }, []);

    const handleSpeak = (text: string, language: string) => {
        textToSpeech.speak(text, language);
    };

    // 修改录音按钮的图标
    const renderMicrophoneIcon = () => {
        if (isProcessing) {
            return (
                <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            );
        }
        if (isRecording) {
            return (
                <svg className="w-6 h-6 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="6" />
                </svg>
            );
        }
        return (
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
            </svg>
        );
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <RecordingOverlay
                isRecording={isRecording}
                duration={recordingDuration}
                onStop={handleVoiceInput}
            />
            {/* 添加 Toast 组件 */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 py-2 px-4 rounded-md ${activeTab === 'text'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                    >
                        文本翻译
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`flex-1 py-2 px-4 rounded-md ${activeTab === 'image'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                    >
                        图片翻译
                    </button>
                </div>

                {activeTab === 'text' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    disabled={isProcessing}
                                    className="absolute right-2 bottom-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    title={isRecording ? '点击停止录音' : '点击开始录音'}
                                >
                                    {renderMicrophoneIcon()}
                                </button>
                            </div>
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
                            type="submit"
                            disabled={isLoading || !apiKey || (!targetLanguage && !customLanguage)}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? '翻译中...' : '翻译'}
                        </button>
                    </form>
                ) : (
                    <ImageTranslator />
                )}
            </div>

            {/* API 配置提示 */}
            {!apiKey && (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-800 rounded-md text-yellow-800 dark:text-yellow-100">
                    请先在设置页面配置 API Key
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