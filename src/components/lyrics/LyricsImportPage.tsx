import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Line {
    id: number;
    text: string;
    selected: boolean;
}

interface LyricsImportPageProps {
    onSubmit: (title: string, artist: string, japanese: string, chinese: string, needProcessing?: boolean) => void;
    onCancel: () => void;
}

const LyricsImportPage: React.FC<LyricsImportPageProps> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [leftLines, setLeftLines] = useState<Line[]>([]);
    const [rightLines, setRightLines] = useState<Line[]>([]);
    // 保存初始状态用于复原
    const initialLinesRef = useRef<Line[]>([]);

    // 处理文本粘贴
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const lines = text.split('\n').map((line, index) => ({
            id: index,
            text: line.trim(),
            selected: false
        })).filter(line => line.text);

        setLeftLines(lines);
        // 保存初始状态
        initialLinesRef.current = [...lines];
        // 清空右侧
        setRightLines([]);
    };

    // 取消所有选择
    const clearSelection = (side: 'left' | 'right') => {
        const setLines = side === 'left' ? setLeftLines : setRightLines;
        setLines(prev => prev.map(line => ({ ...line, selected: false })));
    };

    // 复原到初始状态
    const resetToInitial = () => {
        setLeftLines(initialLinesRef.current);
        setRightLines([]);
    };

    // 选择/取消选择行
    const toggleLineSelection = (side: 'left' | 'right', id: number) => {
        const setLines = side === 'left' ? setLeftLines : setRightLines;
        setLines(prev => prev.map(line =>
            line.id === id ? { ...line, selected: !line.selected } : line
        ));
    };

    // 自动选择间隔行
    const selectAlternateLines = (startIndex: number) => {
        setLeftLines(prev => prev.map((line, index) => ({
            ...line,
            selected: (index % 2) === startIndex
        })));
    };

    // 移动选中的行到右侧
    const moveSelectedToRight = () => {
        const selectedLines = leftLines.filter(line => line.selected);
        const unselectedLines = leftLines.filter(line => !line.selected);
        setLeftLines(unselectedLines);
        setRightLines(prev => [...prev, ...selectedLines.map(line => ({ ...line, selected: false }))]);
    };

    // 处理拖拽
    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // 如果没有目标位置或拖到原位置，不做任何操作
        if (!destination ||
            (source.droppableId === destination.droppableId &&
                source.index === destination.index)) {
            return;
        }

        const sourceList = [...(source.droppableId === 'left' ? leftLines : rightLines)];
        const destList = [...(destination.droppableId === 'left' ? leftLines : rightLines)];
        const [movedItem] = sourceList.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
            // 同列表内移动
            sourceList.splice(destination.index, 0, movedItem);
            if (source.droppableId === 'left') {
                setLeftLines(sourceList);
            } else {
                setRightLines(sourceList);
            }
        } else {
            // 跨列表移动
            destList.splice(destination.index, 0, movedItem);
            if (source.droppableId === 'left') {
                setLeftLines(sourceList);
                setRightLines(destList);
            } else {
                setRightLines(sourceList);
                setLeftLines(destList);
            }
        }
    };

    // 修改提交处理逻辑
    const handleSubmit = () => {
        if (!title.trim() || !artist.trim()) {
            alert('请输入歌名和歌手名');
            return;
        }

        const japaneseText = leftLines.map(l => l.text).join('\n');
        const chineseText = rightLines.map(l => l.text).join('\n');

        // 直接保存，不调用 AI
        onSubmit(title.trim(), artist.trim(), japaneseText, chineseText);
    };

    // 添加获取注音功能
    const handleGetReading = () => {
        if (!title.trim() || !artist.trim()) {
            alert('请输入歌名和歌手名');
            return;
        }

        const japaneseText = leftLines.map(l => l.text).join('\n');
        const chineseText = rightLines.map(l => l.text).join('\n');

        // 调用 AI 处理注音
        onSubmit(title.trim(), artist.trim(), japaneseText, chineseText, true);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-screen">
                {/* 页面标题和返回按钮 - 减少上下padding */}
                <div className="flex items-center px-4 py-2 border-b dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        className="mr-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="返回"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">导入歌词</h1>
                    <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 ml-3">
                        请在左侧粘贴歌词文本，选择需要分离的译文后点击箭头移动到右侧
                    </div>
                </div>

                {/* 歌曲信息和功能按钮区域 - 合并到一行 */}
                <div className="px-4 py-3 border-b dark:border-gray-700 space-y-3">
                    {/* 歌曲信息输入区域 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                歌名
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="请输入歌名"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                歌手
                            </label>
                            <input
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                className="w-full px-3 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="请输入歌手名"
                            />
                        </div>
                    </div>

                    {/* 功能按钮区域 */}
                    <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => selectAlternateLines(0)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                选择奇数行
                            </button>
                            <button
                                onClick={() => selectAlternateLines(1)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                选择偶数行
                            </button>
                            <button
                                onClick={() => clearSelection('left')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                取消选中
                            </button>
                            <button
                                onClick={resetToInitial}
                                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors duration-200 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                复原
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleGetReading}
                                className="px-6 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                获取注音
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                确认导入
                            </button>
                        </div>
                    </div>
                </div>

                {/* 主要内容区域 - 移除额外的padding */}
                <div className="flex-1 flex min-h-0 p-4">
                    {/* 左侧文本框 */}
                    <Droppable droppableId="left">
                        {(provided, snapshot) => (
                            <div
                                className="flex-1 border rounded-lg p-4 overflow-hidden flex flex-col"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <div className="font-medium mb-2">原文（可拖动排序）</div>
                                <div
                                    className="flex-1 overflow-y-auto"
                                    onPaste={handlePaste}
                                >
                                    {leftLines.map((line, index) => (
                                        <Draggable
                                            key={line.id}
                                            draggableId={`left-${line.id}`}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => toggleLineSelection('left', line.id)}
                                                    className={`p-1 cursor-pointer rounded mb-1 ${line.selected ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {line.text}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>

                    {/* 中间控制按钮 */}
                    <div className="flex items-center px-4">
                        <button
                            onClick={moveSelectedToRight}
                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
                            title="移动到右侧"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* 右侧文本框 */}
                    <Droppable droppableId="right">
                        {(provided) => (
                            <div
                                className="flex-1 border rounded-lg p-4 overflow-hidden flex flex-col"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <div className="font-medium mb-2">译文</div>
                                <div className="flex-1 overflow-y-auto">
                                    {rightLines.map((line, index) => (
                                        <Draggable
                                            key={line.id}
                                            draggableId={`right-${line.id}`}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="p-1 cursor-pointer rounded mb-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    {line.text}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        </DragDropContext>
    );
};

export default LyricsImportPage; 