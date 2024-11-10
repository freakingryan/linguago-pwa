import { useState, useEffect } from 'react';
import { Lyrics, ProcessedLyrics } from '../types/lyrics';
import ProcessedLyricsModal from '../components/lyrics/ProcessedLyricsModal';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useToast } from '../hooks/useToast';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UnifiedApiService } from '../services/api';
import { PromptService } from '../services/promptService';
import LyricsImportPage from '../components/lyrics/LyricsImportPage';
import { useNavigate } from 'react-router-dom';

const LyricsManagement = () => {
    const [lyrics, setLyrics] = useState<Lyrics[]>([]);
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
    const [processedLyrics, setProcessedLyrics] = useState<ProcessedLyrics | null>(null);
    const [isImportPage, setIsImportPage] = useState(false);

    const { addLyrics, getAllLyrics, deleteLyrics } = useIndexedDB();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // 获取 API 配置
    const { apiUrl, apiKey, model } = useSelector((state: RootState) => state.settings);
    const apiService = new UnifiedApiService(apiUrl, apiKey, model);

    useEffect(() => {
        loadLyrics();
    }, []);

    const loadLyrics = async () => {
        try {
            const savedLyrics = await getAllLyrics();
            setLyrics(savedLyrics);
        } catch (error) {
            console.error('加载歌词失败:', error);
            showToast('加载歌词失败', 'error');
        }
    };

    // 处理删除歌词
    const handleDelete = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation(); // 阻止事件冒泡，避免触发行点击
        try {
            await deleteLyrics(id);
            await loadLyrics();
            showToast('删除成功', 'success');
        } catch (error) {
            console.error('删除歌词失败:', error);
            showToast('删除失败，请重试', 'error');
        }
    };

    const handleLyricsSeparation = async (
        title: string,
        artist: string,
        japanese: string,
        chinese: string,
        needProcessing?: boolean
    ) => {
        try {
            if (needProcessing) {
                // 需要处理注音
                const prompt = PromptService.getLyricsProcessingPrompt(japanese);
                const response = await apiService.generateText(prompt, true);
                const processedResponse = typeof response === 'object'
                    ? response as ProcessedLyrics
                    : JSON.parse(response) as ProcessedLyrics;

                setProcessedLyrics({
                    japanese: processedResponse.japanese,
                    chinese: chinese || processedResponse.chinese
                });
                setIsImportPage(false);
                setIsProcessingModalOpen(true);
            } else {
                // 直接保存
                const newLyrics: Lyrics = {
                    id: Date.now().toString(),
                    title,
                    artist,
                    content: japanese,
                    japaneseWithReading: japanese, // 没有注音的原文
                    chineseTranslation: chinese,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                await addLyrics(newLyrics);
                await loadLyrics();
                setIsImportPage(false);
                showToast('歌词保存成功', 'success');
            }
        } catch (error) {
            console.error('处理歌词失败:', error);
            showToast('处理歌词失败，请重试', 'error');
        }
    };

    const handleSaveProcessedLyrics = async () => {
        if (!processedLyrics) return;

        try {
            const newLyrics: Lyrics = {
                id: Date.now().toString(),
                title: '新歌词', // 这里可以添加标题和歌手的输入框
                artist: '未知歌手',
                content: processedLyrics.japanese, // 原始内容
                japaneseWithReading: processedLyrics.japanese,
                chineseTranslation: processedLyrics.chinese,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await addLyrics(newLyrics);
            await loadLyrics();
            setIsProcessingModalOpen(false);
            setProcessedLyrics(null);
            showToast('歌词保存成功', 'success');
        } catch (error) {
            console.error('保存歌词失败:', error);
            showToast('保存歌词失败，请重试', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {isImportPage ? (
                <LyricsImportPage
                    onSubmit={handleLyricsSeparation}
                    onCancel={() => setIsImportPage(false)}
                />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">歌词管理</h1>
                        <button
                            onClick={() => setIsImportPage(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            导入歌词
                        </button>
                    </div>

                    {/* 歌词列表 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        歌名
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        歌手
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        导入时间
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {lyrics.map((lyric) => (
                                    <tr
                                        key={lyric.id}
                                        onClick={() => navigate(`/lyrics/${lyric.id}`)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {lyric.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                                {lyric.artist}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                                {new Date(lyric.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={(e) => handleDelete(lyric.id, e)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {lyrics.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                暂无歌词数据
                            </div>
                        )}
                    </div>

                    {/* 处理后的歌词模态框 */}
                    {isProcessingModalOpen && processedLyrics && (
                        <ProcessedLyricsModal
                            lyrics={processedLyrics}
                            onClose={() => setIsProcessingModalOpen(false)}
                            onSave={handleSaveProcessedLyrics}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default LyricsManagement; 