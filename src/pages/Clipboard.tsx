import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { ClipboardItem } from '../types/clipboard';

const AddClipboardModal: React.FC<{
    onClose: () => void;
    onSubmit: (title: string, content: string) => void;
}> = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: { title?: string; content?: string } = {};

        if (!title.trim()) {
            newErrors.title = '请输入标题';
        } else if (title.trim().length > 50) {
            newErrors.title = '标题不能超过50个字符';
        }

        if (!content.trim()) {
            newErrors.content = '请输入内容';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(title.trim(), content.trim());
        }
    };

    // 处理输入变化时清除对应的错误提示
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (errors.title) {
            setErrors(prev => ({ ...prev, title: undefined }));
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (errors.content) {
            setErrors(prev => ({ ...prev, content: undefined }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">添加新内容</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            标题 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : ''
                                }`}
                            placeholder="输入标题"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            内容 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={handleContentChange}
                            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.content ? 'border-red-500' : ''
                                }`}
                            rows={5}
                            placeholder="输入内容"
                        />
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            确认添加
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Clipboard = () => {
    const [items, setItems] = useState<ClipboardItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showToast } = useToast();
    const { addClipboardItem, getAllClipboardItems, updateClipboardItem, deleteClipboardItem } = useIndexedDB();

    // 加载数据
    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        const savedItems = await getAllClipboardItems();
        setItems(savedItems.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
    };

    // 添加新项目
    const handleAdd = async (title: string, content: string) => {
        const newItem: ClipboardItem = {
            id: Date.now().toString(),
            title,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            await addClipboardItem(newItem);
            await loadItems();
            setIsModalOpen(false);
            showToast('添加成功', 'success');
        } catch (error) {
            showToast('添加失败', 'error');
        }
    };

    // 更新项目
    const handleUpdate = async (id: string, title: string, content: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const updatedItem: ClipboardItem = {
            ...item,
            title,
            content,
            updatedAt: new Date().toISOString(),
        };

        try {
            await updateClipboardItem(updatedItem);
            await loadItems();
            showToast('更新成功', 'success');
        } catch (error) {
            showToast('更新失败', 'error');
        }
    };

    // 删除项目
    const handleDelete = async (id: string) => {
        try {
            await deleteClipboardItem(id);
            await loadItems();
            showToast('删除成功', 'success');
        } catch (error) {
            showToast('删除失败', 'error');
        }
    };

    // 复制内容
    const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            showToast('复制成功', 'success');
        } catch (error) {
            showToast('复制失败', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 顶部按钮 */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">剪贴板</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加内容
                </button>
            </div>

            {/* 列表内容 */}
            <div className="space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 flex items-center gap-4"
                    >
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleUpdate(item.id, e.target.value, item.content)}
                                onDoubleClick={(e) => e.currentTarget.select()}
                                className="px-2 py-1 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none dark:text-white font-medium"
                                title="双击编辑标题"
                            />
                            <input
                                type="text"
                                value={item.content}
                                onChange={(e) => handleUpdate(item.id, item.title, e.target.value)}
                                onDoubleClick={(e) => e.currentTarget.select()}
                                className="col-span-2 px-2 py-1 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none dark:text-white"
                                title="双击编辑内容"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleCopy(item.content)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:bg-gray-700"
                                title="复制内容"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-gray-700"
                                title="删除"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        暂无数据
                    </div>
                )}
            </div>

            {/* 添加内容模态框 */}
            {isModalOpen && (
                <AddClipboardModal
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAdd}
                />
            )}
        </div>
    );
};

export default Clipboard; 