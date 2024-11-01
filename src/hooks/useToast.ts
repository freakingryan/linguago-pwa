import { useState } from 'react';
import { ToastState } from '../types';

export const useToast = () => {
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: '',
        type: 'info'
    });

    const showToast = (message: string, type: ToastState['type'] = 'info') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    return { toast, showToast, hideToast };
}; 