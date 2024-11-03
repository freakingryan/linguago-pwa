interface LocationLanguageMap {
    [key: string]: { code: string; name: string };
}

export class LocationService {
    private readonly languageMap: LocationLanguageMap = {
        'CN': { code: 'zh', name: '中文' },
        'US': { code: 'en', name: '英语' },
        'JP': { code: 'ja', name: '日语' },
        'KR': { code: 'ko', name: '韩语' },
        'DE': { code: 'de', name: '德语' },
        'FR': { code: 'fr', name: '法语' },
        'ES': { code: 'es', name: '西班牙语' },
        'IT': { code: 'it', name: '意大利语' },
        'RU': { code: 'ru', name: '俄语' },
        // 可以添加更多国家和语言映射
    };

    async detectLanguage(): Promise<{ code: string; name: string } | null> {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return this.languageMap[data.country_code] || null;
        } catch (error) {
            console.error('Failed to detect location:', error);
            return null;
        }
    }
} 