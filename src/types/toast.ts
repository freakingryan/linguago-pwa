export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
    show: boolean;
    message: string;
    type: ToastType;
} 