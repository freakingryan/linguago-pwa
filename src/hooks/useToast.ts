import { useState, useCallback } from 'react';
import { ToastState, ToastType } from '../types/toast';

export const useToast = () => {
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: '',
        type: 'info'
    });

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({
            show: true,
            message,
            type
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({
            ...prev,
            show: false
        }));
    }, []);

    return {
        toast,
        showToast,
        hideToast
    };
}; 