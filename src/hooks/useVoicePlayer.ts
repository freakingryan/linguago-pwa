import { useMemo, useCallback } from 'react';
import { TextToSpeechService } from '../services/textToSpeech';

export const useVoicePlayer = () => {
    const textToSpeech = useMemo(() => new TextToSpeechService(), []);

    const playVoice = useCallback(async (text: string, lang: string) => {
        try {
            await textToSpeech.speak(text, lang);
        } catch (error) {
            console.error('播放失败:', error);
        }
    }, [textToSpeech]);

    return { playVoice };
}; 