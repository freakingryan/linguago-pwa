import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UnifiedApiService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { ConversationMessage } from '../types/conversation';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useVoicePlayer } from '../hooks/useVoicePlayer';

// 添加常用语言列表
const COMMON_LANGUAGES = [
    { code: 'en', name: '英语' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'es', name: '西班牙语' },
    { code: 'ru', name: '俄语' },
    { code: 'it', name: '意大利语' },
    { code: 'pt', name: '葡萄牙语' },
    { code: 'vi', name: '越南语' },
    { code: 'th', name: '泰语' },
    { code: 'ar', name: '阿拉伯语' },
    { code: 'hi', name: '印地语' },
];

const Conversation: React.FC = () => {
    const { apiKey, apiUrl, model } = useSelector((state: RootState) => state.settings);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [targetLang, setTargetLang] = useState('en');
    const [customLang, setCustomLang] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const apiService = useMemo(() => new UnifiedApiService(apiUrl, apiKey, model), [apiUrl, apiKey, model]);
    const { playVoice } = useVoicePlayer();

    // 处理语音或文本输入的翻译
    const handleTranslate = useCallback(async (text: string) => {
        if (!text) return;

        try {
            const prompt = `Please perform the following tasks:
1. Detect the language of this text: "${text}"
2. Translate it to ${customLang || targetLang}
3. Format the response as JSON:
{
    "detectedLang": "detected language code",
    "sourceLangName": "language name in Chinese",
    "translation": "translated text"
}
Important: Return ONLY the JSON object, no markdown formatting or other text.`;

            const response = await apiService.generateText(prompt);
            console.log('Raw response:', response);

            // 清理响应内容，移除可能的 markdown 格式
            const jsonStr = response.replace(/```json\n?|\n?```/g, '').trim();
            console.log('Cleaned JSON string:', jsonStr);

            try {
                const result = JSON.parse(jsonStr);
                console.log('Parsed result:', result);

                if (!result.detectedLang || !result.sourceLangName || !result.translation) {
                    throw new Error('Invalid response format');
                }

                const newMessage: ConversationMessage = {
                    id: uuidv4(),
                    text,
                    translation: result.translation,
                    sourceLang: result.detectedLang,
                    sourceLangName: result.sourceLangName,
                    targetLang: customLang || targetLang,
                    timestamp: Date.now(),
                    isEdited: false
                };

                setMessages(prev => [...prev, newMessage]);
                setInputText('');
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                console.log('Response that failed to parse:', jsonStr);
                showToast('翻译结果格式错误，请重试', 'error');
                return;
            }
        } catch (error) {
            console.error('Translation error:', error);
            if (error instanceof Error) {
                showToast(error.message || '翻译失败，请重试', 'error');
            } else {
                showToast('翻译失败，请重试', 'error');
            }
        }
    }, [targetLang, customLang, apiService, showToast]);

    // 处理语音输入结果
    const handleVoiceResult = useCallback((text: string) => {
        handleTranslate(text);
    }, [handleTranslate]);

    // 处理文本输入提交
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleTranslate(inputText);
    }, [inputText, handleTranslate]);

    // 使用语音输入hook
    const { isRecording, startRecording, stopRecording } = useVoiceInput({
        apiService,
        onResult: handleVoiceResult,
        onError: (error) => showToast(error, 'error')
    });

    // 处理消息编辑
    const handleEdit = useCallback(async (messageId: string, newText: string) => {
        try {
            const message = messages.find(m => m.id === messageId);
            if (!message) return;

            const prompt = `Please translate this text: "${newText}" to ${message.targetLang}`;
            const translation = await apiService.generateText(prompt);

            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? { ...m, text: newText, translation, isEdited: true }
                    : m
            ));
        } catch (error) {
            showToast('修改失败，请重试', 'error');
        }
    }, [messages, apiService, showToast]);

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            {/* 目标语言选择 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    翻译成
                </label>

                {/* 常用语言快速选择 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {COMMON_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setTargetLang(lang.code);
                                setCustomLang('');
                            }}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${targetLang === lang.code && !customLang
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>

                {/* 自定义语言输入 */}
                <div className="relative">
                    <input
                        type="text"
                        value={customLang}
                        onChange={(e) => {
                            setCustomLang(e.target.value);
                            setTargetLang('');
                        }}
                        placeholder="或输入其他语言（如：西班牙语、德语等）"
                        className="w-full p-2 pr-8 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {customLang && (
                        <button
                            onClick={() => {
                                setCustomLang('');
                                setTargetLang('en');  // 重置为默认语言
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="输入要翻译的文本..."
                        className="w-full p-3 border rounded-lg resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            翻译
                        </button>
                        <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`flex-1 py-2 px-4 rounded-lg ${isRecording
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {isRecording ? '停止录音' : '语音输入'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 对话历史 */}
            <div className="space-y-4">
                {[...messages].reverse().map((message, index) => (
                    <div
                        key={message.id}
                        className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-all duration-300 ${index === 0  // 因为已经反转，所以最新的消息索引是 0
                                ? 'border-2 border-blue-500 dark:border-blue-400 transform -translate-y-1 scale-102'
                                : 'border border-gray-200 dark:border-gray-700 opacity-80'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(message.timestamp).toLocaleString()}
                                </span>
                                {index === 0 && (  // 修改这里的判断条件
                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                                        最新
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 原文部分 */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        原文
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                        {message.sourceLangName}
                                    </span>
                                </div>
                                <button
                                    onClick={() => playVoice(message.text, message.sourceLang)}
                                    className="p-1 text-gray-500 hover:text-blue-600"
                                    title="朗读原文"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <p className={`text-lg text-gray-800 dark:text-gray-200 ${index === messages.length - 1 ? 'font-medium' : ''
                                }`}>
                                {message.text}
                            </p>
                        </div>

                        {/* 译文部分 */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    译文
                                </span>
                                <button
                                    onClick={() => playVoice(message.translation, message.targetLang)}
                                    className="p-1 text-gray-500 hover:text-blue-600"
                                    title="朗读译文"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <p className={`text-lg text-blue-600 dark:text-blue-400 ${index === messages.length - 1 ? 'font-medium' : ''
                                }`}>
                                {message.translation}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Conversation; 