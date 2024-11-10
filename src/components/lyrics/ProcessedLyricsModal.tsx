import React from 'react';
import { ProcessedLyrics } from '../../types/lyrics';

interface ProcessedLyricsModalProps {
    lyrics: ProcessedLyrics;
    onClose: () => void;
    onSave: () => void;
}

const ProcessedLyricsModal: React.FC<ProcessedLyricsModalProps> = ({
    lyrics,
    onClose,
    onSave,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">处理后的歌词</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">日文（带注音）</h3>
                        <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            {lyrics.japanese}
                        </pre>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">中文翻译</h3>
                        <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            {lyrics.chinese}
                        </pre>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        取消
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessedLyricsModal; 