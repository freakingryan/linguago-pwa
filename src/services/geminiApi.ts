import axios from 'axios';

export class GeminiApiService {
    private readonly baseUrl: string;
    private apiKey: string;
    private readonly axiosInstance;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

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

    // 发送纯文本请求
    async generateText(prompt: string): Promise<string> {
        try {
            console.log('发送文本请求:', prompt);
            const response = await this.axiosInstance.post(
                `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                }
            );

            console.log('文本生成响应:', response.data);

            if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('无法获取生成结果');
            }

            return response.data.candidates[0].content.parts[0].text;
        } catch (error: any) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('请求超时，请重试');
            }
            this.handleError(error);
            throw error;
        }
    }

    // 使用 inline data 处理音频
    async uploadAudio(audioBlob: Blob): Promise<string> {
        try {
            const base64Audio = await this.blobToBase64(audioBlob);
            console.log('音频转换为 base64 完成');

            const response = await this.axiosInstance.post(
                `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
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

            console.log('音频处理响应:', response.data);

            if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('无法获取转录结果');
            }

            return response.data.candidates[0].content.parts[0].text;
        } catch (error: any) {
            console.error('音频处理错误:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            this.handleError(error);
            throw error;
        }
    }

    // 通用错误处理
    private handleError(error: any): never {
        console.error('Gemini API error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            baseUrl: this.baseUrl
        });

        if (error.response?.data?.error?.message) {
            throw new Error(`API错误: ${error.response.data.error.message}`);
        }

        throw new Error(error.message || '请求失败，请重试');
    }

    // 辅助方法：Blob 转 Base64
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

    // 辅助方法：File 转 Base64
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error('Failed to convert file to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
} 