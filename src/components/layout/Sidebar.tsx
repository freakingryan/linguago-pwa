import { Link } from 'react-router-dom';
import { SidebarProps } from '../../types/layout';
import { useState } from 'react';

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    // 添加子菜单展开状态
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    // 处理菜单展开/收起
    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev =>
            prev.includes(menuId)
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            菜单
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {/* 翻译功能菜单组 */}
                        <div>
                            <button
                                onClick={() => toggleMenu('translate')}
                                className="w-full flex justify-between items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    翻译
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${expandedMenus.includes('translate') ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {expandedMenus.includes('translate') && (
                                <div className="ml-4 mt-2 space-y-2">
                                    <Link
                                        to="/conversation"
                                        className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={onClose}
                                    >
                                        实时对话
                                    </Link>
                                    <Link
                                        to="/history"
                                        className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={onClose}
                                    >
                                        对话历史
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* 日语学习菜单组 */}
                        <div>
                            <button
                                onClick={() => toggleMenu('japanese')}
                                className="w-full flex justify-between items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    日语学习
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${expandedMenus.includes('japanese') ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {expandedMenus.includes('japanese') && (
                                <div className="ml-4 mt-2 space-y-2">
                                    <Link
                                        to="/vocabulary"
                                        className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={onClose}
                                    >
                                        单词表
                                    </Link>
                                    <Link
                                        to="/lyrics"
                                        className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={onClose}
                                    >
                                        歌词管理
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar; 