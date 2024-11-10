import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lyrics } from '../types/lyrics';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useEffect, useState } from 'react';

const LyricsDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lyrics, setLyrics] = useState<Lyrics | null>(null);
    const { getAllLyrics } = useIndexedDB();

    useEffect(() => {
        const loadLyrics = async () => {
            const allLyrics = await getAllLyrics();
            const found = allLyrics.find(l => l.id === id);
            if (found) {
                setLyrics(found);
            }
        };
        loadLyrics();
    }, [id, getAllLyrics]);

    if (!lyrics) {
        return <div>加载中...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {lyrics.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        演唱：{lyrics.artist}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        导入时间：{new Date(lyrics.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/lyrics')}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    返回列表
                </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">日文歌词</h2>
                    <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {lyrics.japaneseWithReading}
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">中文翻译</h2>
                    <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {lyrics.chineseTranslation}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LyricsDetail; 