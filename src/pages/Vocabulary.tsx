import React, { useState } from 'react';
import { VocabularyWord } from '../types/vocabulary';

const Vocabulary: React.FC = () => {
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);

    // 示例数据，后续需要从 IndexedDB 获取
    const words: VocabularyWord[] = [
        {
            id: '1',
            word: '勉強',
            reading: 'べんきょう',
            meaning: '学习',
            level: 'N5',
            tags: ['名词', '动词'],
            timestamp: Date.now()
        },
        // ... 其他单词
    ];

    const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];

    const filteredWords = words.filter(word => {
        const matchesLevel = selectedLevel === 'all' || word.level === selectedLevel;
        const matchesSearch = searchTerm === '' ||
            word.word.includes(searchTerm) ||
            word.reading.includes(searchTerm) ||
            word.meaning.includes(searchTerm);
        return matchesLevel && matchesSearch;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 顶部工具栏 */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* 搜索框 */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="搜索单词..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 等级筛选 */}
                <div className="flex gap-2">
                    <button
                        className={`px-3 py-1 rounded-lg ${selectedLevel === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        onClick={() => setSelectedLevel('all')}
                    >
                        全部
                    </button>
                    {levels.map(level => (
                        <button
                            key={level}
                            className={`px-3 py-1 rounded-lg ${selectedLevel === level
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            onClick={() => setSelectedLevel(level)}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* 单词列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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

            {/* 单词详情浮窗 */}
            {selectedWord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold">{selectedWord.word}</h3>
                            <button
                                onClick={() => setSelectedWord(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">读音</label>
                                <p className="text-lg">{selectedWord.reading}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">含义</label>
                                <p className="text-lg">{selectedWord.meaning}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">标签</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedWord.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {selectedWord.examples && (
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">例句</label>
                                    <ul className="list-disc list-inside space-y-2 mt-1">
                                        {selectedWord.examples.map((example, index) => (
                                            <li key={index}>{example}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 添加按钮 */}
            <button
                className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="添加新单词"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
};

export default Vocabulary; 