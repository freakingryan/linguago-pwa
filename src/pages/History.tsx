import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearHistory, setHistoryFilter, clearHistoryFilter } from '../store/slices/historySlice';
import { TextToSpeechService } from '../services/textToSpeech';
import { useMemo, useState } from 'react';
import { useToast } from '../hooks/useToast';
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

const History = () => {
    const dispatch = useDispatch();
    const { records, filter } = useSelector((state: RootState) => state.history);
    const textToSpeech = useMemo(() => new TextToSpeechService(), []);
    const { toast, showToast, hideToast } = useToast();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleSpeak = (text: string, language: string) => {
        textToSpeech.speak(text, language);
    };

    const handleClearHistory = () => {
        dispatch(clearHistory());
        showToast('历史记录已清空', 'success');
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success');
    };

    // 筛选记录
    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            if (filter.type !== 'all' && record.type !== filter.type) {
                return false;
            }
            if (filter.language && record.targetLang !== filter.language) {
                return false;
            }
            return true;
        });
    }, [records, filter]);

    // 获取历史记录中出现过的所有目标语言
    const availableLanguages = useMemo(() => {
        const languages = new Set(records.map(record => record.targetLang));
        return Array.from(languages).map(code => ({
            code,
            name: COMMON_LANGUAGES.find(lang => lang.code === code)?.name || code
        }));
    }, [records]);

    // 获取语言名称的辅助函数
    const getLanguageName = (code: string) => {
        return COMMON_LANGUAGES.find(lang => lang.code === code)?.name || code;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            {/* 优化筛选器样式 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="flex flex-wrap items-center gap-4">
                    {/* 记录类型筛选 */}
                    <div className="flex items-center space-x-2">
                        {[
                            { value: 'all', label: '全部' },
                            { value: 'text', label: '文本' },
                            { value: 'image', label: '图片' }
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => dispatch(setHistoryFilter({ type: option.value as 'all' | 'text' | 'image' }))}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter.type === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* 分隔线 */}
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                    {/* 目标语言筛选 */}
                    <div className="flex items-center space-x-2">
                        <select
                            value={filter.language || ''}
                            onChange={(e) => dispatch(setHistoryFilter({ language: e.target.value || null }))}
                            className="px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">所有语言</option>
                            {availableLanguages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>

                        {/* 重置按钮 */}
                        {(filter.type !== 'all' || filter.language) && (
                            <button
                                onClick={() => dispatch(clearHistoryFilter())}
                                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                title="重置筛选"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 历史记录列表 */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">翻译历史</h2>
                {records.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                        清空历史
                    </button>
                )}
            </div>

            {filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    暂无翻译历史
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRecords.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                        >
                            {/* 时间戳 */}
                            <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(record.timestamp).toLocaleString()}
                            </div>

                            {/* 翻译内容 - 新布局 */}
                            <div className="flex gap-4">
                                {/* 图片部分（如果有） */}
                                {record.type === 'image' && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={record.imageUrl}
                                            alt="Translated"
                                            className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setSelectedImage(record.imageUrl)}
                                        />
                                    </div>
                                )}

                                {/* 文本内容部分 */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    {/* 原文 */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">原文</span>
                                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                                    {getLanguageName(record.sourceLang)}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleSpeak(record.sourceText, record.sourceLang)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                    title="朗读原文"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(record.sourceText)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                    title="复制原文"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 break-words line-clamp-2 hover:line-clamp-none">
                                            {record.sourceText}
                                        </p>
                                    </div>

                                    {/* 分隔线 */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                                    {/* 译文 */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">译文</span>
                                                <span className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                    {getLanguageName(record.targetLang)}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleSpeak(record.translatedText, record.targetLang)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                    title="朗读译文"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(record.translatedText)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                    title="复制译文"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 break-words line-clamp-2 hover:line-clamp-none">
                                            {record.translatedText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 图片预览模态框 */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-3xl max-h-[90vh] p-4">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-full rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default History; 