import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UnifiedApiService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { ConversationMessage } from '../types/conversation';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useVoicePlayer } from '../hooks/useVoicePlayer';
import { LocationService } from '../services/locationService';
import RecordingOverlay from '../components/common/RecordingOverlay';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import ProcessingOverlay from '../components/common/ProcessingOverlay';
import { useAITranslation } from '../hooks/useAITranslation';
import { useDispatch } from 'react-redux';

// 添加常用语言列表
const COMMON_LANGUAGES = [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: '英语', nativeName: 'English' },
    { code: 'ja', name: '日语', nativeName: '日本語' },
    { code: 'ko', name: '韩语', nativeName: '한국어' },
    { code: 'fr', name: '法语', nativeName: 'Français' },
    { code: 'de', name: '德语', nativeName: 'Deutsch' },
    { code: 'es', name: '西班牙语', nativeName: 'Español' },
    { code: 'ru', name: '俄语', nativeName: 'Русский' },
    // ... 可以添加更多语言
];

// 添加返回结果的类型定义
interface TranslationResult {
    detectedLang: string;
    sourceLangName: string;
    translation: string;
}

const Conversation: React.FC = () => {
    const { apiKey, apiUrl, model } = useSelector((state: RootState) => state.settings);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const { toast, showToast, hideToast } = useToast();
    const apiService = useMemo(() => new UnifiedApiService(apiUrl, apiKey, model), [apiUrl, apiKey, model]);
    const { playVoice } = useVoicePlayer();
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const locationService = useMemo(() => new LocationService(), []);
    const [editingMessage, setEditingMessage] = useState<ConversationMessage | null>(null);
    const [editingText, setEditingText] = useState('');
    const [sourceLang, setSourceLang] = useState('zh');
    const [sourceCustomLang, setSourceCustomLang] = useState('');
    const [showSourceCustomInput, setShowSourceCustomInput] = useState(false);
    const [targetLang, setTargetLang] = useState('en');
    const [targetCustomLang, setTargetCustomLang] = useState('');
    const [showTargetCustomInput, setShowTargetCustomInput] = useState(false);
    const [currentMode, setCurrentMode] = useState<'source' | 'target'>('source');
    const [enlargedText, setEnlargedText] = useState<{
        text: string;
        lang: string;
    } | null>(null);
    const dispatch = useDispatch();

    const { translateText } = useAITranslation({
        apiService,
        onError: (error) => showToast(error, 'error'),
        dispatch
    });

    // 获取语言显示名称
    const getLanguageDisplay = useCallback((langCode: string, customLang: string, isSource: boolean) => {
        if (customLang) return customLang;
        const lang = COMMON_LANGUAGES.find(l => l.code === langCode);
        if (!lang) return langCode;
        // 源语言显示中文名，目标语言显示本地语言名
        return isSource ? lang.name : lang.nativeName;
    }, []);

    // 切换语言方向
    const handleSwapLanguages = useCallback(() => {
        const tempLang = sourceLang;
        const tempCustomLang = sourceCustomLang;
        const tempShowCustom = showSourceCustomInput;

        setSourceLang(targetLang);
        setSourceCustomLang(targetCustomLang);
        setShowSourceCustomInput(showTargetCustomInput);

        setTargetLang(tempLang);
        setTargetCustomLang(tempCustomLang);
        setShowTargetCustomInput(tempShowCustom);
    }, [sourceLang, targetLang, sourceCustomLang, targetCustomLang, showSourceCustomInput, showTargetCustomInput]);

    // 添加地理位置检测函数
    const detectLocation = useCallback(async () => {
        setIsDetectingLocation(true);
        try {
            const detectedLanguage = await locationService.detectLanguage();
            if (detectedLanguage) {
                setTargetLang(detectedLanguage.code);
                setTargetCustomLang('');
                setShowTargetCustomInput(false);
                showToast(`已设置为${detectedLanguage.name}`, 'success');
            } else {
                showToast('无法检测当前位置语言，请手动选择', 'error');
            }
        } catch (error) {
            showToast('语言检测失败，请手动选择', 'error');
        } finally {
            setIsDetectingLocation(false);
        }
    }, [locationService, showToast]);

    const handleTranslation = useCallback(async (text: string, mode: 'source' | 'target' = 'source') => {
        if (!text) return;

        const targetLanguage = mode === 'source'
            ? (showTargetCustomInput ? targetCustomLang : targetLang)
            : (showSourceCustomInput ? sourceCustomLang : sourceLang);

        // 添加类型断言
        const result = await translateText(text, targetLanguage, { formatAsJson: true }) as TranslationResult | null;

        if (result) {
            const newMessage: ConversationMessage = {
                id: uuidv4(),
                text,
                translation: result.translation,
                sourceLang: result.detectedLang,
                sourceLangName: result.sourceLangName,
                targetLang: targetLanguage,
                timestamp: Date.now(),
                isEdited: false
            };

            setMessages(prev => [...prev, newMessage]);
        }
    }, [
        targetLang,
        sourceLang,
        sourceCustomLang,
        targetCustomLang,
        showSourceCustomInput,
        showTargetCustomInput,
        translateText
    ]);

    // 修改 handleVoiceResult 函数
    const handleVoiceResult = useCallback((text: string) => {
        handleTranslation(text, currentMode);
    }, [handleTranslation, currentMode]);

    // 使用语音输入hook
    const {
        isRecording,
        recordingDuration,
        handleVoiceInput,
        cleanup: cleanupRecording
    } = useVoiceRecording({
        apiService,
        onResult: handleVoiceResult,
        onError: (error) => showToast(error, 'error'),
        dispatch
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

    // 处理文本更新和重新翻译
    const handleUpdateText = useCallback(async (messageId: string) => {
        if (!editingText.trim()) return;

        try {
            await handleEdit(messageId, editingText);
            setEditingMessage(null);
            setEditingText('');
            showToast('翻译已更新', 'success');
        } catch (error) {
            showToast('更新失败，请重试', 'error');
        }
    }, [editingText, handleEdit, showToast]);

    // 修改语音输入按钮的点击处理
    const handleVoiceButtonClick = useCallback(() => {
        if (enlargedText) {
            setEnlargedText(null);
        }
        handleVoiceInput();
    }, [handleVoiceInput, enlargedText]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            cleanupRecording();
        };
    }, [cleanupRecording]);

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            {/* 语言选择区域 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-between gap-4">
                    {/* 源语言 */}
                    <div className="flex-1">
                        {showSourceCustomInput ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={sourceCustomLang}
                                    onChange={(e) => setSourceCustomLang(e.target.value)}
                                    placeholder="输入源语言..."
                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    onClick={() => {
                                        setShowSourceCustomInput(false);
                                        setSourceLang('zh');
                                        setSourceCustomLang('');
                                    }}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    value={sourceLang}
                                    onChange={(e) => setSourceLang(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {COMMON_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {`${lang.name}（${lang.nativeName}）`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setShowSourceCustomInput(true)}
                                    className="p-2 text-blue-600 hover:text-blue-700"
                                    title="自定义语言"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 切换按钮 */}
                    <button
                        onClick={handleSwapLanguages}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </button>

                    {/* 目标语言 */}
                    <div className="flex-1">
                        {showTargetCustomInput ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={targetCustomLang}
                                    onChange={(e) => setTargetCustomLang(e.target.value)}
                                    placeholder="输入目标语言..."
                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    onClick={() => {
                                        setShowTargetCustomInput(false);
                                        setTargetLang('en');
                                        setTargetCustomLang('');
                                    }}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    value={targetLang}
                                    onChange={(e) => setTargetLang(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {COMMON_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {`${lang.name}（${lang.nativeName}）`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={detectLocation}
                                    disabled={isDetectingLocation}
                                    className="p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                                    title="获取当地语言"
                                >
                                    {isDetectingLocation ? (
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowTargetCustomInput(true)}
                                    className="p-2 text-blue-600 hover:text-blue-700"
                                    title="自定义语言"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 翻译历史记录 */}
            <div className="space-y-4 mb-24">
                {[...messages].reverse().map((message, index) => (
                    <div
                        key={message.id}
                        className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-all duration-300 ${index === 0 ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'opacity-80'
                            }`}
                    >
                        {/* 原文部分 */}
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400">
                                {message.text}
                            </p>
                            {index === 0 && (
                                <button
                                    onClick={() => {
                                        if (editingMessage?.id === message.id) {
                                            setEditingMessage(null);
                                            setEditingText('');
                                        } else {
                                            setEditingMessage(message);
                                            setEditingText(message.text);
                                        }
                                    }}
                                    className="ml-2 p-1.5 text-gray-400 hover:text-blue-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* 编辑框 */}
                        {editingMessage?.id === message.id && (
                            <div className="mt-2 space-y-2">
                                <textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows={2}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleUpdateText(message.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        重新翻译
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 分割线 */}
                        <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>

                        {/* 译文部分 */}
                        <div className="flex items-center justify-between">
                            <p className="text-xl font-medium text-blue-600 dark:text-blue-400">
                                {message.translation}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => playVoice(message.translation, message.targetLang)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                    title="朗读"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(message.translation);
                                        showToast('已复制译文', 'success');
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                    title="复制"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setEnlargedText({
                                        text: message.translation,
                                        lang: message.targetLang
                                    })}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                    title="放大显示"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 放大显示浮窗 */}
            {enlargedText && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center p-8 z-50 backdrop-blur-sm"
                    onClick={() => setEnlargedText(null)}
                >
                    <div className="relative flex flex-col items-center max-w-4xl w-full">
                        {/* 主卡片 */}
                        <div
                            className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-2xl w-full relative animate-fade-in"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* 关闭按钮 */}
                            <button
                                onClick={() => setEnlargedText(null)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* 译文内容 */}
                            <div className="mt-4 mb-16">
                                <p className="text-5xl font-medium text-blue-600 dark:text-blue-400 text-center leading-relaxed break-words">
                                    {enlargedText.text}
                                </p>
                            </div>

                            {/* 功能按钮组 */}
                            <div className="absolute bottom-6 right-6 flex gap-3">
                                <button
                                    onClick={() => playVoice(enlargedText.text, enlargedText.lang)}
                                    className="p-3 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="朗读"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(enlargedText.text);
                                        showToast('已复制译文', 'success');
                                    }}
                                    className="p-3 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="复制"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* 语音输入按钮 */}
                        <button
                            onClick={handleVoiceButtonClick}
                            className={`mt-12 flex items-center gap-3 px-8 py-4 rounded-full shadow-lg transition-all ${isRecording
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } text-white text-lg animate-bounce-gentle`}
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            <span>
                                {showTargetCustomInput
                                    ? targetCustomLang
                                    : getLanguageDisplay(targetLang, targetCustomLang, false)}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* 录音提示 */}
            <RecordingOverlay
                isRecording={isRecording}
                duration={recordingDuration}
                onStop={handleVoiceInput}
            />

            {/* AI 处理提示 */}
            <ProcessingOverlay isProcessing={false} />

            {/* 添加轻微弹跳动画 */}
            <style>{`
                @keyframes bounce-gentle {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                }
                .animate-bounce-gentle {
                    animation: bounce-gentle 2s infinite;
                }
            `}</style>

            {/* 悬浮的语音输入按钮 */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
                {/* 源语言按钮 */}
                <button
                    onClick={() => {
                        setCurrentMode('source');
                        handleVoiceInput();
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-lg transition-all ${isRecording && currentMode === 'source'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>
                        {showSourceCustomInput
                            ? sourceCustomLang
                            : getLanguageDisplay(sourceLang, sourceCustomLang, true)}
                    </span>
                </button>

                {/* 目标语言按钮 */}
                <button
                    onClick={() => {
                        setCurrentMode('target');
                        handleVoiceInput();
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-lg transition-all ${isRecording && currentMode === 'target'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>
                        {showTargetCustomInput
                            ? targetCustomLang
                            : getLanguageDisplay(targetLang, targetCustomLang, false)}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Conversation; 