interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresIn: number;
}

export class CacheService {
    private readonly CACHE_PREFIX = 'linguago-';
    private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
    private readonly DEFAULT_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7天

    // 图片缓存
    async cacheImage(key: string, imageData: string): Promise<void> {
        const cacheKey = `${this.CACHE_PREFIX}img-${key}`;
        const item: CacheItem<string> = {
            data: imageData,
            timestamp: Date.now(),
            expiresIn: this.DEFAULT_EXPIRATION
        };
        await this.setItem(cacheKey, item);
        await this.cleanCache();
    }

    async getCachedImage(key: string): Promise<string | null> {
        const cacheKey = `${this.CACHE_PREFIX}img-${key}`;
        const item = await this.getItem<string>(cacheKey);
        return item?.data || null;
    }

    // 翻译结果缓存
    async cacheTranslation(text: string, targetLang: string, result: string): Promise<void> {
        const key = `${this.CACHE_PREFIX}trans-${this.hashString(`${text}-${targetLang}`)}`;
        const item: CacheItem<string> = {
            data: result,
            timestamp: Date.now(),
            expiresIn: this.DEFAULT_EXPIRATION
        };
        await this.setItem(key, item);
    }

    async getCachedTranslation(text: string, targetLang: string): Promise<string | null> {
        const key = `${this.CACHE_PREFIX}trans-${this.hashString(`${text}-${targetLang}`)}`;
        const item = await this.getItem<string>(key);
        return item?.data || null;
    }

    private async setItem<T>(key: string, item: CacheItem<T>): Promise<void> {
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                await this.cleanCache();
                localStorage.setItem(key, JSON.stringify(item));
            }
        }
    }

    private async getItem<T>(key: string): Promise<CacheItem<T> | null> {
        const data = localStorage.getItem(key);
        if (!data) return null;

        const item: CacheItem<T> = JSON.parse(data);
        if (Date.now() - item.timestamp > item.expiresIn) {
            localStorage.removeItem(key);
            return null;
        }

        return item;
    }

    private async cleanCache(): Promise<void> {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

        // 按时间排序
        const items = cacheKeys
            .map(key => ({
                key,
                item: JSON.parse(localStorage.getItem(key)!) as CacheItem<any>
            }))
            .sort((a, b) => a.item.timestamp - b.item.timestamp);

        // 清理过期和过多的缓存
        let totalSize = 0;
        for (const { key, item } of items) {
            if (Date.now() - item.timestamp > item.expiresIn) {
                localStorage.removeItem(key);
                continue;
            }

            totalSize += new Blob([JSON.stringify(item.data)]).size;
            if (totalSize > this.MAX_CACHE_SIZE) {
                localStorage.removeItem(key);
            }
        }
    }

    private hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
} 