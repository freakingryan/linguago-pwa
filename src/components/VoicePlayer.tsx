import React, { useState } from 'react';
import { TextToSpeechService } from '../services/textToSpeech';

interface Props {
    text: string;
    lang: string;
}

export const VoicePlayer: React.FC<Props> = ({ text, lang }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [tts] = useState(() => new TextToSpeechService());

    const playVoice = async () => {
        if (isPlaying) return;

        try {
            setIsPlaying(true);
            await tts.speak(text, lang);
        } catch (error) {
            console.error('播放失败:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    return (
        <button
            onClick={playVoice}
            disabled={isPlaying}
            className={`play-button ${isPlaying ? 'opacity-50' : ''}`}
        >
            {isPlaying ? '播放中...' : '播放'}
        </button>
    );
}; 