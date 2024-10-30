export class SpeechRecognitionService {
    private recognition: any = null;

    constructor() {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('当前浏览器不支持语音识别');
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            // 检查浏览器支持的语音识别语言
            console.log('支持的语言:', navigator.languages);

            // 使用浏览器默认语言，通常会更好地支持
            const defaultLang = navigator.language || 'en-US';
            this.recognition.lang = defaultLang;

            console.log('语音识别初始化成功', {
                continuous: this.recognition.continuous,
                interimResults: this.recognition.interimResults,
                lang: this.recognition.lang
            });
        } catch (error) {
            console.error('初始化语音识别失败:', error);
        }
    }

    startListening(): Promise<string> {
        if (!this.recognition) {
            return Promise.reject('当前浏览器不支持语音识别功能');
        }

        return new Promise((resolve, reject) => {
            try {
                const handleResult = (event: any) => {
                    console.log('收到识别结果:', event.results);
                    if (event.results.length > 0) {
                        const transcript = event.results[0][0].transcript;
                        const confidence = event.results[0][0].confidence;
                        console.log('识别文本:', transcript, '置信度:', confidence);
                        cleanup();
                        resolve(transcript);
                    }
                };

                const handleError = (event: any) => {
                    console.error('语音识别错误:', {
                        error: event.error,
                        message: event.message,
                        timeStamp: event.timeStamp
                    });
                    cleanup();

                    // 提供更友好的错误信息
                    switch (event.error) {
                        case 'not-allowed':
                            reject('请允许使用麦克风');
                            break;
                        case 'language-not-supported':
                            // 切换到浏览器默认语言
                            this.recognition.lang = navigator.language || 'en-US';
                            reject('已切换到浏览器默认语言，请重试');
                            break;
                        case 'no-speech':
                            reject('未检测到语音，请说话');
                            break;
                        case 'network':
                            reject('网络连接错误');
                            break;
                        default:
                            reject('语音识别失败，请重试');
                    }
                };

                const handleStart = () => {
                    console.log('开始录音...');
                };

                const handleEnd = () => {
                    console.log('录音结束');
                    cleanup();
                };

                const cleanup = () => {
                    this.recognition.removeEventListener('result', handleResult);
                    this.recognition.removeEventListener('error', handleError);
                    this.recognition.removeEventListener('end', handleEnd);
                    this.recognition.removeEventListener('start', handleStart);
                };

                this.recognition.addEventListener('result', handleResult);
                this.recognition.addEventListener('error', handleError);
                this.recognition.addEventListener('end', handleEnd);
                this.recognition.addEventListener('start', handleStart);

                console.log('开始语音识别...使用语言:', this.recognition.lang);
                this.recognition.start();
            } catch (error) {
                console.error('启动语音识别时发生错误:', error);
                reject('启动语音识别失败，请重试');
            }
        });
    }

    stop() {
        if (this.recognition) {
            try {
                this.recognition.stop();
                console.log('手动停止语音识别');
            } catch (e) {
                console.error('停止语音识别失败:', e);
            }
        }
    }
} 