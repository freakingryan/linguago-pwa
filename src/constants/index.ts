export const COMMON_LANGUAGES = [
    { code: 'en', name: '英语' },
    { code: 'zh', name: '中文' },
    // ...
] as const;

export const LANGUAGE_MAP = {
    'zh': 'zh-CN',
    'en': 'en-US',
    // ...
} as const; 