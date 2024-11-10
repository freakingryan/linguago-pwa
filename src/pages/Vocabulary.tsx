import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { VocabularyWord, AIWordRecommendation } from '../types/vocabulary';
import { useAITranslation } from '../hooks/useAITranslation';
import { PromptService } from '../services/promptService';
import { indexedDBService } from '../services/indexedDB';
import { startLoading, stopLoading } from '../store/slices/loadingSlice';
import { useToast } from '../hooks/useToast';
import { UnifiedApiService } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { v4 as uuidv4 } from 'uuid';

// 添加 AI 响应的接口定义
interface AIResponse {
    words: {
        word: string;
        reading: string;
        meaning: string;
        level: string;
        types: string[];
        tags: string[];
        examples: {
            japanese: string;
            reading: string;
            meaning: string;
        }[];
        frequency?: number;
    }[];
    category: string;
    description: string;
    totalCount: number;
}

const Vocabulary: React.FC = () => {
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const { apiKey, apiUrl, model } = useSelector((state: RootState) => state.settings);

    const apiService = useMemo(() => new UnifiedApiService(apiUrl, apiKey, model), [apiUrl, apiKey, model]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
    const [showAIRecommendation, setShowAIRecommendation] = useState(false);
    const [aiCondition, setAICondition] = useState('');
    const [recommendation, setRecommendation] = useState<AIWordRecommendation | null>(null);
    const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const { translateText } = useAITranslation({
        apiService,
        onError: (error) => showToast(error, 'error'),
        dispatch
    });

    const initialWords: VocabularyWord[] = useMemo(() => [
        {
            id: '1',
            word: '勉強',
            reading: 'べんきょう',
            meaning: '学习',
            level: 'N5',
            types: ['名词'],
            examples: [],
            tags: ['名词', '动词'],
            timestamp: Date.now()
        }
    ], []);

    const filteredWords = useMemo(() => {
        return searchTerm
            ? words.filter(word =>
                word.word.includes(searchTerm) ||
                word.reading.includes(searchTerm) ||
                word.meaning.includes(searchTerm)
            )
            : words;
    }, [words, searchTerm]);

    const handleAIRecommendation = async () => {
        if (!aiCondition.trim()) return;

        try {
            dispatch(startLoading('processing'));
            const response = await translateText(aiCondition, 'Japanese', {
                formatAsJson: true,
                customPrompt: PromptService.getWordRecommendationPrompt(aiCondition)
            });

            console.log('AI Response:', response);

            // 先转换为 unknown，再转换为 AIResponse
            const responseData = (response as unknown) as AIResponse;

            // 验证响应数据的结构
            if (responseData &&
                typeof responseData === 'object' &&
                'words' in responseData &&
                Array.isArray(responseData.words) &&
                responseData.words.length > 0
            ) {
                // 转换为 VocabularyWord 类型并添加必要字段
                const wordsWithIds = responseData.words.map(word => ({
                    ...word,
                    id: uuidv4(),
                    timestamp: Date.now(),
                    types: word.types || [],  // 确保必需字段存在
                    examples: word.examples || [],  // 确保必需字段存在
                    tags: word.tags || []  // 确保必需字段存在
                })) as VocabularyWord[];

                const result: AIWordRecommendation = {
                    words: wordsWithIds,
                    category: responseData.category || aiCondition,
                    description: responseData.description || '推荐单词列表',
                    totalCount: wordsWithIds.length
                };

                setRecommendation(result);
                setShowAIRecommendation(true);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('AI recommendation error:', error);
            showToast('获取推荐失败', 'error');
        } finally {
            dispatch(stopLoading());
        }
    };

    const handleToggleRecommendation = (wordId: string) => {
        setSelectedRecommendations(prev => {
            const next = new Set(prev);
            if (next.has(wordId)) {
                next.delete(wordId);
            } else {
                next.add(wordId);
            }
            return next;
        });
    };

    const handleSaveRecommendations = async () => {
        if (!recommendation || selectedRecommendations.size === 0) return;

        try {
            setIsSaving(true);
            const selectedWords = recommendation.words.filter(
                word => selectedRecommendations.has(word.id)
            );

            // 使用 Promise.all 和 addVocabularyWord 替代 addVocabularyWords
            await Promise.all(
                selectedWords.map(word => indexedDBService.addVocabularyWord(word))
            );

            showToast(`成功添加 ${selectedWords.length} 个单词`, 'success');
            setShowAIRecommendation(false);
            setSelectedRecommendations(new Set());

            // 重新加载词库
            loadVocabulary();
        } catch (error) {
            console.error('Save words error:', error);
            showToast('保存单词失败', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const loadVocabulary = useCallback(async () => {
        try {
            const data = await indexedDBService.getAllVocabulary();
            setWords(data);
        } catch (error) {
            console.error('Load vocabulary error:', error);
            showToast('加载词库失败', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        loadVocabulary();
    }, [loadVocabulary]);

    return (
        <div className="container mx-auto px-4 py-6">
            {/* 重新设计顶部工具栏 */}
            <div className="mb-6 flex items-center justify-between gap-4">
                {/* 左侧按钮组 */}
                <div className="flex items-center gap-3">
                    {/* 添加单词按钮 */}
                    <button
                        className="px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                        onClick={() => {/* 添加新单词的处理函数 */ }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        添加单词
                    </button>

                    {/* AI 推荐按钮 */}
                    <div className="relative">
                        <button
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
                            onClick={() => setShowAIRecommendation(!showAIRecommendation)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            AI 推荐
                        </button>

                        {/* AI 推荐下拉框 */}
                        {showAIRecommendation && (
                            <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border dark:border-gray-700">
                                <div className="p-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            输入推荐条件
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="如: N3词汇/与大海有关的词汇/旅行常用词"
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                                            value={aiCondition}
                                            onChange={(e) => setAICondition(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAIRecommendation}
                                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                    >
                                        获取推荐
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧搜索框 */}
                <div className="w-64 relative">
                    <input
                        type="text"
                        placeholder="搜索单词..."
                        className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* 单词表格 - 添加圆角和微妙的阴影 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {/* 表头部分保持不变 */}
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                单词
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                读音
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                含义
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                等级
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredWords.map((word) => (
                            <tr
                                key={word.id}
                                onClick={() => setSelectedWord(word)}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-lg">
                                    {word.word}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                    {word.reading}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {word.meaning}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        {word.level}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* AI 推荐结果弹窗 - 优化样式 */}
            {showAIRecommendation && recommendation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{recommendation.category}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{recommendation.description}</p>
                                </div>
                                <button
                                    onClick={() => setShowAIRecommendation(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                共 {recommendation.totalCount} 个单词，已选择 {selectedRecommendations.size} 个
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            <div className="space-y-2">
                                {/* 全选/重置按钮 */}
                                <div className="flex justify-end gap-4 mb-4">
                                    <button
                                        onClick={() => {
                                            const allIds = recommendation.words.map(word => word.id);
                                            setSelectedRecommendations(new Set(allIds));
                                        }}
                                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        全选
                                    </button>
                                    <button
                                        onClick={() => setSelectedRecommendations(new Set())}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        重置
                                    </button>
                                </div>

                                {/* 单词列表 */}
                                {recommendation.words.map(word => (
                                    <div
                                        key={word.id}
                                        className={`p-4 rounded-lg border ${selectedRecommendations.has(word.id)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700'
                                            } cursor-pointer hover:shadow-md transition-all`}
                                        onClick={() => handleToggleRecommendation(word.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold">{word.word}</span>
                                                    <span className="text-gray-600">【{word.reading}】</span>
                                                    <span>{word.meaning}</span>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                                {selectedRecommendations.has(word.id) && (
                                                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                已选择 {selectedRecommendations.size} 个单词
                            </span>
                            <button
                                onClick={handleSaveRecommendations}
                                disabled={selectedRecommendations.size === 0 || isSaving}
                                className={`px-6 py-2 rounded-lg transition-colors ${selectedRecommendations.size === 0 || isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                            >
                                {isSaving ? '保存中...' : '添加到词库'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vocabulary; 