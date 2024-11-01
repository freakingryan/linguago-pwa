import axios from 'axios';

export class UnifiedApiService {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly model: string;
    private readonly axiosInstance;

    constructor(apiUrl: string, apiKey: string, model: string) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.model = model;

        this.axiosInstance = axios.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // 添加请求拦截器
        this.axiosInstance.interceptors.request.use((config) => {
            console.log('Sending request:', {
                url: config.url,
                method: config.method,
                headers: config.headers,
                data: config.data
            });
            return config;
        });

        // 添加响应拦截器
        this.axiosInstance.interceptors.response.use(
            (response) => {
                console.log('Received response:', {
                    status: response.status,
                    headers: response.headers,
                    data: response.data
                });
                return response;
            },
            (error) => {
                console.error('Request error:', {
                    message: error.message,
                    code: error.code,
                    response: error.response?.data
                });
                throw error;
            }
        );
    }

    // 文本生成（翻译）
    async generateText(prompt: string): Promise<string> {
        try {
            const isGeminiApi = this.apiUrl.includes('generativelanguage.googleapis.com');
            let response;

            if (isGeminiApi) {
                response = await this.axiosInstance.post(
                    `${this.apiUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                    {
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    }
                );
                return response.data.candidates[0].content.parts[0].text;
            } else {
                response = await this.axiosInstance.post(
                    `${this.apiUrl}/chat/completions`,
                    {
                        model: this.model,
                        messages: [{
                            role: 'user',
                            content: prompt
                        }]
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`
                        }
                    }
                );
                return response.data.choices[0].message.content;
            }
        } catch (error: any) {
            console.error('Generate text error:', error);
            throw new Error(error.response?.data?.error?.message || '请求失败，请重试');
        }
    }

    // 音频处理
    async processAudio(audioBlob: Blob): Promise<string> {
        try {
            const base64Audio = await this.blobToBase64(audioBlob);
            console.log('音频转换为 base64 完成');

            const isGeminiApi = this.apiUrl.includes('generativelanguage.googleapis.com');
            let response;

            if (isGeminiApi) {
                response = await this.axiosInstance.post(
                    `${this.apiUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                    {
                        contents: [{
                            parts: [
                                {
                                    text: `Please transcribe the following audio content. 
                                    Rules:
                                    1. Remove any background noise, filler words (um, uh, etc.), and repetitions
                                    2. Only include meaningful and coherent text
                                    3. Format the text in a clear and readable way
                                    4. Return only the transcribed text without any additional explanation or notes
                                    5. If the audio is mostly noise or unclear, return "无法识别有效语音内容"`
                                },
                                {
                                    inline_data: {
                                        mime_type: audioBlob.type || 'audio/mp3',
                                        data: base64Audio
                                    }
                                }
                            ]
                        }]
                    }
                );
                return response.data.candidates[0].content.parts[0].text;
            } else {
                // OpenAI Whisper API 或其他音频处理 API
                throw new Error('当前 API 不支持音频处理');
            }
        } catch (error: any) {
            console.error('Process audio error:', error);
            throw new Error(error.response?.data?.error?.message || '音频处理失败，请重试');
        }
    }

    // 测试连接
    async testConnection(): Promise<boolean> {
        try {
            const isGeminiApi = this.apiUrl.includes('generativelanguage.googleapis.com');

            if (isGeminiApi) {
                const response = await this.axiosInstance.get(
                    `${this.apiUrl}/models?key=${this.apiKey}`
                );
                return response.status === 200;
            } else {
                const response = await this.axiosInstance.post(
                    `${this.apiUrl}/chat/completions`,
                    {
                        model: this.model,
                        messages: [{ role: 'user', content: 'Hello' }],
                        max_tokens: 5
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`
                        }
                    }
                );
                return response.status === 200;
            }
        } catch (error) {
            console.error('Test connection error:', error);
            return false;
        }
    }

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error('Failed to convert blob to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
} 