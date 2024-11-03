export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), wait);
    };
}

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// 内存使用优化
export function cleanupMemory() {
    if ('gc' in window) {
        (window as any).gc();
    }

    // 清理未使用的图片缓存
    const imgs = document.getElementsByTagName('img');
    for (const img of imgs) {
        if (img.dataset.src) {
            URL.revokeObjectURL(img.src);
        }
    }
} 