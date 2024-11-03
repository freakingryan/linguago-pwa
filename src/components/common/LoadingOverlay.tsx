import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const LoadingOverlay: React.FC = () => {
    const { isLoading, loadingType } = useSelector((state: RootState) => state.loading);

    if (!isLoading) return null;

    // 根据不同类型返回不同的图标
    const renderIcon = () => {
        switch (loadingType) {
            case 'recording':
                // 录音图标
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                    </svg>
                );
            case 'processing':
                // 处理图标
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                );
            case 'translating':
            default:
                // 翻译/默认图标
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                    </svg>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                    {/* 旋转动画容器 */}
                    <div className="relative">
                        {/* 外圈动画 */}
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-500"></div>
                        {/* 内圈旋转 */}
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-spin">
                            <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-800"></div>
                        </div>
                        {/* 图标 */}
                        <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                            {renderIcon()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay; 