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

    speak = async (text: string, lang: string = 'en') => {
        // 在 try 块外部定义 fullLangCode，这样 catch 块也能访问到
        const fullLangCode = this.getFullLanguageCode(lang);

        try {
            // iOS 设备特殊处理
            if (this.isIOSDevice()) {
                return this.speakOnIOS(text, fullLangCode);
            }

            // 检查浏览器支持
            if (!('speechSynthesis' in window)) {
                return this.fallbackSpeak(text, fullLangCode);
            }

            // 确保语音已加载（iOS 特别需要）
            await this.preloadVoices();

            // Web Speech API 实现
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = fullLangCode;

            // 选择最佳语音
            const voices = this.synthesis.getVoices();
            const bestVoice = this.findBestVoice(voices, fullLangCode);
            if (bestVoice) {
                utterance.voice = bestVoice;
            }

            // iOS Safari 的特殊处理
            if (this.isIOSDevice()) {
                this.synthesis.cancel(); // 防止重复播放
            }

            return new Promise((resolve, reject) => {
                utterance.onend = () => {
                    this.synthesis.cancel(); // 清理
                    resolve(undefined);
                };
                utterance.onerror = (event) => {
                    console.error('语音合成错误:', event);
                    this.fallbackSpeak(text, fullLangCode).then(resolve).catch(reject);
                };
                this.synthesis.speak(utterance);
            });
        } catch (error) {
            console.error('语音合成错误:', error);
            return this.fallbackSpeak(text, fullLangCode);
        }
    };

    // iOS 设备的特殊处理
    private async speakOnIOS(text: string, lang: string): Promise<void> {
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;  // 使用转换后的语言代码

            // iOS 需要用户交互才能播放
            return new Promise((resolve, reject) => {
                utterance.onend = () => {
                    this.synthesis.cancel();
                    resolve();
                };
                utterance.onerror = () => {
                    // 如果失败，使用回退方案
                    this.fallbackSpeak(text, lang).then(resolve).catch(reject);
                };

                // iOS Safari 特殊处理
                this.synthesis.cancel(); // 清除之前的语音队列
                setTimeout(() => {
                    this.synthesis.speak(utterance);
                }, 100);
            });
        } catch (error) {
            return this.fallbackSpeak(text, lang);
        }
    }

    // 回退方案：使用音频 API
    private fallbackSpeak(text: string, lang: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // 使用 Google TTS API 作为备选
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
            const audio = new Audio();

            // iOS Safari 需要这些设置
            audio.autoplay = true;
            audio.crossOrigin = "anonymous";
            audio.src = url;

            const playHandler = () => {
                audio.play().catch(error => {
                    console.error('播放失败:', error);
                    if (error.name === 'NotAllowedError') {
                        // 需要用户交互，可以在这里触发 UI 提示
                        console.log('需要用户交互才能播放音频');
                    }
                });
            };

            audio.onended = () => resolve();
            audio.onerror = (e) => {
                console.error('音频加载失败:', e);
                reject(e);
            };

            // iOS Safari 特殊处理
            if (this.isIOSDevice()) {
                audio.load(); // 预加载音频
                document.addEventListener('touchend', playHandler, { once: true });
            } else {
                playHandler();
            }
        });
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
        return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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

    // 添加一个获取完整语言代码的辅助方法
    private getFullLanguageCode(lang: string): string {
        return this.languageMap[lang] || lang;
    }
} 