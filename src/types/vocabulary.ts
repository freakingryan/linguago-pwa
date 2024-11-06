export interface VocabularyWord {
    id: string;
    word: string;           // 日语单词
    reading: string;        // 读音
    meaning: string;        // 中文含义
    level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';  // JLPT 等级
    tags: string[];         // 标签(如: 动词、名词等)
    examples?: string[];    // 例句
    notes?: string;         // 笔记
    timestamp: number;      // 创建时间
    lastReviewed?: number;  // 最后复习时间
}

export interface VocabularyList {
    id: string;
    name: string;
    description?: string;
    words: VocabularyWord[];
    timestamp: number;
} 