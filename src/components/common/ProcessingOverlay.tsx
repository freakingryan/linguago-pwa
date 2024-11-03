import React from 'react';

interface ProcessingOverlayProps {
    isProcessing: boolean;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ isProcessing }) => {
    if (!isProcessing) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="relative">
                {/* 外圈动画 */}
                <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20"></div>

                {/* AI 图标和动画 */}
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg">
                    <div className="w-12 h-12 relative">
                        {/* 旋转的圆圈 */}
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                        {/* AI 图标 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessingOverlay; 