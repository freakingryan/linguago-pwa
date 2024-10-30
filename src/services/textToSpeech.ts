export class TextToSpeechService {
    private synthesis: SpeechSynthesis;
    private readonly languageMap: { [key: string]: string } = {
        'zh': 'zh-CN',
        'en': 'en-US',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'es': 'es-ES',
        'ru': 'ru-RU'
    };

    constructor() {
        this.synthesis = window.speechSynthesis;
    }

    speak(text: string, language: string) {
        if (!this.synthesis) return;

        // 停止当前正在播放的语音
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = this.languageMap[language] || language;
        utterance.lang = langCode;

        // 获取可用的语音
        const voices = this.synthesis.getVoices();
        // 尝试找到匹配的语音
        const voice = voices.find(v => v.lang.startsWith(langCode)) ||
            voices.find(v => v.lang.startsWith(langCode.split('-')[0]));

        if (voice) {
            utterance.voice = voice;
        }

        // 调整语速和音量
        utterance.rate = 1.0;  // 正常语速
        utterance.pitch = 1.0; // 正常音调
        utterance.volume = 1.0; // 最大音量

        // 添加错误处理
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };

        this.synthesis.speak(utterance);
    }

    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    // 预加载语音
    preloadVoices(): Promise<void> {
        return new Promise((resolve) => {
            if (this.synthesis.getVoices().length > 0) {
                resolve();
            } else {
                this.synthesis.onvoiceschanged = () => {
                    resolve();
                };
            }
        });
    }
} 