import React from 'react';

interface RecordingOverlayProps {
    isRecording: boolean;
    duration: number;
    onStop: () => void;
}

const RecordingOverlay: React.FC<RecordingOverlayProps> = ({ isRecording, duration, onStop }) => {
    if (!isRecording) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-red-500 rounded-full w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="6" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-xl font-semibold dark:text-white">
                        正在录音...
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        点击下方按钮停止录音
                    </p>
                    <button
                        onClick={onStop}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        停止录音
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordingOverlay; 