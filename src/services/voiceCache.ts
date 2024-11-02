import { VoiceCache } from '../types/voice';

export class VoiceCacheService {
    private readonly CACHE_NAME = 'voice-cache-v1';
    private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
    private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天

    async cacheVoice(text: string, lang: string, audioData: ArrayBuffer): Promise<void> {
        const cache = await caches.open(this.CACHE_NAME);
        const key = this.getCacheKey(text, lang);

        const voiceCache: VoiceCache = {
            audioData,
            text,
            lang,
            timestamp: Date.now(),
            expiresIn: this.CACHE_DURATION
        };

        // 存储音频数据
        await cache.put(key, new Response(audioData));

        // 存储元数据
        await this.saveMetadata(key, voiceCache);

        // 清理过期缓存
        await this.cleanExpiredCache();
    }

    async getVoice(text: string, lang: string): Promise<ArrayBuffer | null> {
        const cache = await caches.open(this.CACHE_NAME);
        const key = this.getCacheKey(text, lang);
        const response = await cache.match(key);

        if (!response) return null;

        // 检查是否过期
        const metadata = await this.getMetadata(key);
        if (!metadata || Date.now() - metadata.timestamp > metadata.expiresIn) {
            await cache.delete(key);
            return null;
        }

        return await response.arrayBuffer();
    }

    private getCacheKey(text: string, lang: string): string {
        return `voice-${lang}-${text}`;
    }

    private async saveMetadata(key: string, data: VoiceCache): Promise<void> {
        const metadata = await this.getAllMetadata();
        metadata[key] = data;
        await localStorage.setItem('voice-cache-metadata', JSON.stringify(metadata));
    }

    private async getMetadata(key: string): Promise<VoiceCache | null> {
        const metadata = await this.getAllMetadata();
        return metadata[key] || null;
    }

    private async getAllMetadata(): Promise<Record<string, VoiceCache>> {
        const data = localStorage.getItem('voice-cache-metadata');
        return data ? JSON.parse(data) : {};
    }

    private async cleanExpiredCache(): Promise<void> {
        const cache = await caches.open(this.CACHE_NAME);
        const keys = await cache.keys();
        const metadata = await this.getAllMetadata();

        for (const key of keys) {
            const data = metadata[key.url];
            if (!data || Date.now() - data.timestamp > data.expiresIn) {
                await cache.delete(key);
                delete metadata[key.url];
            }
        }

        await localStorage.setItem('voice-cache-metadata', JSON.stringify(metadata));
    }
} 