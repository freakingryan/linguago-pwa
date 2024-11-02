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
                                    text: `Please transcribe the following audio content and format it as proper text.
                                    Rules:
                                    1. Remove all background noise, filler words, and unnecessary spaces
                                    2. Remove any timestamps or numbers that don't belong to the actual content
                                    3. Format the text following proper grammar and punctuation rules
                                    4. Ensure the output is well-structured and logically coherent
                                    5. If the content is unclear or nonsensical, respond with "无法识别有效语音内容"
                                    6. Keep only meaningful content that forms complete sentences
                                    7. Maintain the original meaning while improving clarity
                                    8. Use proper capitalization and punctuation
                                    9. Remove any repeated words or phrases
                                    10. Ensure the output reads like natural, written text`
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

    // 图片翻译
    async generateImageContent(prompt: string, base64Image: string, mimeType: string): Promise<string> {
        try {
            const response = await this.axiosInstance.post(
                `${this.apiUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }]
                }
            );

            console.log('Image Translation Response:', {
                status: response.status,
                candidates: response.data.candidates,
                fullResponse: response.data
            });

            return response.data.candidates[0].content.parts[0].text;
        } catch (error: any) {
            console.error('Generate image content error:', error);
            throw new Error(error.response?.data?.error?.message || '图片处理失败，请重试');
        }
    }
} 