const PLATFORM = {
    IOS: 'ios',
    ANDROID: 'android',
    DESKTOP: 'desktop'
} as const;

type Platform = typeof PLATFORM[keyof typeof PLATFORM];

export class TextToSpeechService {
    private synthesis: SpeechSynthesis;
    private platform: Platform;

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.platform = this.detectPlatform();
    }

    async speak(text: string, lang: string = 'en'): Promise<void> {
        try {
            // 根据平台选择播放策略
            switch (this.platform) {
                case PLATFORM.IOS:
                    return this.speakOnIOS(text, lang);
                case PLATFORM.ANDROID:
                    return this.speakOnAndroid(text, lang);
                default:
                    return this.webSpeechSpeak(text, lang);
            }
        } catch (error) {
            console.error('语音合成错误:', error);
            return this.fallbackSpeak(text, lang);
        }
    }

    private async speakOnAndroid(text: string, lang: string): Promise<void> {
        if (window.navigator.userAgent.includes('wv')) {
            return this.fallbackSpeak(text, lang);
        }
        return this.webSpeechSpeak(text, lang);
    }

    private async speakOnIOS(text: string, lang: string): Promise<void> {
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            this.synthesis.cancel();

            return new Promise((resolve, reject) => {
                utterance.onend = () => {
                    this.synthesis.cancel();
                    resolve();
                };
                utterance.onerror = () => {
                    this.fallbackSpeak(text, lang).then(resolve).catch(reject);
                };
                setTimeout(() => this.synthesis.speak(utterance), 100);
            });
        } catch (error) {
            return this.fallbackSpeak(text, lang);
        }
    }

    private fallbackSpeak(text: string, lang: string): Promise<void> {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
        const audio = new Audio();

        Object.assign(audio, {
            autoplay: false,
            crossOrigin: "anonymous",
            src: url
        });

        return new Promise((resolve, reject) => {
            const playAudio = () => {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name === 'NotAllowedError') {
                            document.addEventListener('touchend', () => {
                                audio.play().catch(reject);
                            }, { once: true });
                        } else {
                            reject(error);
                        }
                    });
                }
            };

            audio.onended = () => {
                audio.remove();
                resolve();
            };

            audio.onerror = () => {
                audio.remove();
                reject(new Error('音频加载失败'));
            };

            audio.load();

            if (this.platform === PLATFORM.IOS) {
                document.addEventListener('touchend', playAudio, { once: true });
            } else {
                playAudio();
            }
        });
    }

    private detectPlatform(): Platform {
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            return PLATFORM.IOS;
        }
        if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return PLATFORM.ANDROID;
        }
        return PLATFORM.DESKTOP;
    }

    private webSpeechSpeak(text: string, lang: string): Promise<void> {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        return new Promise((resolve, reject) => {
            utterance.onend = () => {
                this.synthesis.cancel();
                resolve();
            };
            utterance.onerror = () => {
                this.fallbackSpeak(text, lang).then(resolve).catch(reject);
            };
            this.synthesis.speak(utterance);
        });
    }
} 