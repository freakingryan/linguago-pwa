export interface Lyrics {
    id: string;
    title: string;
    artist: string;
    content: string;
    japaneseWithReading: string;
    chineseTranslation: string;
    createdAt: string;
    updatedAt: string;
}

export interface LyricsFormData {
    title: string;
    artist: string;
    content: string;
}

export interface ProcessedLyrics {
    japanese: string;
    chinese: string;
} 