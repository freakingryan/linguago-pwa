import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearHistory } from '../store/slices/historySlice';
import { TextToSpeechService } from '../services/textToSpeech';
import { useMemo } from 'react';

const History = () => {
    const dispatch = useDispatch();
    const { records } = useSelector((state: RootState) => state.history);
    const textToSpeech = useMemo(() => new TextToSpeechService(), []);

    const handleSpeak = (text: string, language: string) => {
        textToSpeech.speak(text, language);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">翻译历史</h2>
                {records.length > 0 && (
                    <button
                        onClick={() => dispatch(clearHistory())}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                        清空历史
                    </button>
                )}
            </div>

            {records.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    暂无翻译历史
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(record.timestamp).toLocaleString()}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSpeak(record.sourceText, record.sourceLang)}
                                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title="朗读原文"
                                    >
                                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(record.sourceText)}
                                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title="复制原文"
                                    >
                                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-700 dark:text-gray-200">{record.sourceText}</p>
                                <div className="border-l-4 border-blue-500 pl-3">
                                    <p className="text-gray-700 dark:text-gray-200">{record.translatedText}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History; 