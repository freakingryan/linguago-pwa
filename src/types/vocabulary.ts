export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type WordType = '名词' | '动词' | '形容词' | '副词' | '助词' | '连体词' | '感叹词';

export interface Example {
    japanese: string;      // 日语例句
    reading: string;       // 例句读音
    meaning: string;       // 例句翻译
    source?: string;       // 例句来源
}

export interface VocabularyWord {
    id: string;
    word: string;           // 日语单词
    reading: string;        // 读音
    meaning: string;        // 中文含义
    level: JLPTLevel;       // JLPT 等级
    types: WordType[];      // 词性
    tags: string[];         // 标签(如: 商务、旅游、日常等)
    examples: Example[];    // 例句
    etymology?: string;     // 词源/历史典故
    mnemonic?: string;     // 助记方法
    associations?: string[];// 联想记忆
    commonCollocations?: string[]; // 常见搭配
    similarWords?: {       // 相似词
        word: string;
        explanation: string;
    }[];
    antonyms?: string[];   // 反义词
    notes?: string;        // 学习笔记
    usageNotes?: string;   // 使用注意事项
    culturalNotes?: string;// 文化背景注释
    frequency?: number;    // 使用频率（1-5，5最常用）
    timestamp: number;     // 创建时间
    lastReviewed?: number; // 最后复习时间
    reviewCount?: number;  // 复习次数
}

// AI 推荐单词的响应类型
export interface AIWordRecommendation {
    words: VocabularyWord[];
    category: string;      // 推荐分类
    description: string;   // 推荐说明
    totalCount: number;    // 总词数
}

export interface VocabularyList {
    id: string;
    name: string;
    description?: string;
    words: VocabularyWord[];
    timestamp: number;
} 