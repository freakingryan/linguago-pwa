import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ConversationRecord } from '../types/conversation';

const ConversationHistory: React.FC = () => {
    const records = useSelector((state: RootState) => state.conversationHistory.records);
    const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null);

    // 对话详情弹窗
    const renderConversationDetail = () => {
        if (!selectedConversation) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-medium">对话详情</h3>
                        <button
                            onClick={() => setSelectedConversation(null)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)] space-y-4">
                        {selectedConversation.messages.map((message) => (
                            <div key={message.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow space-y-2">
                                <div className="text-gray-600 dark:text-gray-300">
                                    {message.text}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400 font-medium">
                                    {message.translation}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">对话历史</h2>
            <div className="space-y-4">
                {records.map((record: ConversationRecord) => (
                    <div
                        key={record.id}
                        onClick={() => setSelectedConversation(record)}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-blue-600 dark:text-blue-400">
                                {record.messages.length} 条对话记录
                            </span>
                            <span className="text-sm text-gray-500">
                                {new Date(record.timestamp).toLocaleString()}
                            </span>
                        </div>
                        {record.messages.length > 0 && (
                            <div className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                {record.messages[record.messages.length - 1].text}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {renderConversationDetail()}
        </div>
    );
};

export default ConversationHistory; 