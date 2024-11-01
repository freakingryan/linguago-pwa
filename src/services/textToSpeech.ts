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
        // 在移动设备上预加载语音
        if (this.isMobileDevice()) {
            this.preloadVoices();
        }
    }

    speak(text: string, language: string) {
        if (!this.synthesis) {
            console.warn('当前设备不支持语音合成');
            return;
        }

        // 停止当前正在播放的语音
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = this.languageMap[language] || language;
        utterance.lang = langCode;

        // 获取可用的语音
        const voices = this.synthesis.getVoices();

        // 针对移动设备优化语音选择
        const voice = this.findBestVoice(voices, langCode);
        if (voice) {
            utterance.voice = voice;
        }

        // 针对移动设备优化语音参数
        if (this.isMobileDevice()) {
            utterance.rate = 0.9;    // 稍微降低语速
            utterance.pitch = 1.0;   // 保持正常音调
            utterance.volume = 1.0;  // 最大音量
        } else {
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
        }

        // 添加事件处理
        utterance.onstart = () => {
            console.log('开始播放语音');
        };

        utterance.onend = () => {
            console.log('语音播放结束');
        };

        utterance.onerror = (event) => {
            console.error('语音合成错误:', event);
            // 尝试使用备用语音
            if (event.error === 'synthesis-failed' && voices.length > 1) {
                const fallbackVoice = voices.find(v => v !== utterance.voice && v.lang.startsWith(langCode.split('-')[0]));
                if (fallbackVoice) {
                    utterance.voice = fallbackVoice;
                    this.synthesis.speak(utterance);
                }
            }
        };

        // 在 iOS 设备上特殊处理
        if (this.isIOSDevice()) {
            // iOS 需要用户交互后才能播放语音
            this.synthesis.speak(utterance);
        } else {
            // 其他设备正常播放
            this.synthesis.speak(utterance);
        }
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

    // 检查是否为移动设备
    private isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 检查是否为 iOS 设备
    private isIOSDevice(): boolean {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    // 为特定语言找到最佳语音
    private findBestVoice(voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | null {
        // 首选本地语音
        const nativeVoice = voices.find(v => v.lang === langCode && v.localService);
        if (nativeVoice) return nativeVoice;

        // 其次选择任何匹配语言的语音
        const matchingVoice = voices.find(v => v.lang === langCode);
        if (matchingVoice) return matchingVoice;

        // 最后选择匹配语言代码前缀的语音
        const fallbackVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
        if (fallbackVoice) return fallbackVoice;

        // 如果都没有找到，返回第一个可用的语音
        return voices[0] || null;
    }
} 