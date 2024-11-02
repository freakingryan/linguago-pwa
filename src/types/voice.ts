export interface VoiceCache {
    audioData: ArrayBuffer;
    text: string;
    lang: string;
    timestamp: number;
    expiresIn: number;
} 