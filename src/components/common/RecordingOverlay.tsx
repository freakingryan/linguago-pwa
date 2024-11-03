import React from 'react';

interface RecordingOverlayProps {
    isRecording: boolean;
    duration: number;
    onStop: () => void;
}

const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
    isRecording,
    duration,
    onStop
}) => {
    if (!isRecording) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <button
                onClick={onStop}
                className="relative group"
            >
                {/* 外圈动画 */}
                <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping"></div>

                {/* 中圈动画 */}
                <div className="absolute -inset-2 bg-red-500/40 rounded-full animate-pulse"></div>

                {/* 麦克风按钮 */}
                <div className="relative w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transition-transform group-hover:scale-95">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                    </svg>

                    {/* 时间显示 */}
                    <div className="absolute -bottom-8 text-lg font-mono text-white">
                        {Math.floor(duration / 60).toString().padStart(2, '0')}:
                        {(duration % 60).toString().padStart(2, '0')}
                    </div>
                </div>
            </button>
        </div>
    );
};

export default RecordingOverlay; 