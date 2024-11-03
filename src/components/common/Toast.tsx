import React, { useEffect } from 'react';
import { ToastType } from '../../types/toast';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    const bgColorClass = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    }[type];

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div
                className={`px-4 py-2 rounded-lg text-white shadow-lg ${bgColorClass}`}
                role="alert"
            >
                {message}
            </div>
        </div>
    );
};

export default Toast; 