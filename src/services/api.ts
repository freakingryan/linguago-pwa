import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { FileUtils } from '../utils/fileUtils';

export class UnifiedApiService {
    private readonly axiosInstance: AxiosInstance;
    private readonly isGeminiApi: boolean;

    constructor(
        private readonly apiUrl: string,
        private readonly apiKey: string,
        private readonly model: string
    ) {
        this.isGeminiApi = apiUrl.includes('generativelanguage.googleapis.com');
        this.axiosInstance = this.createAxiosInstance();
    }

    // 创建 Axios 实例并配置拦截器
    private createAxiosInstance(): AxiosInstance {
        const instance = axios.create({
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });

        this.setupInterceptors(instance);
        return instance;
    }

    // 配置拦截器
    private setupInterceptors(instance: AxiosInstance): void {
        instance.interceptors.request.use(
            (config) => {
                console.log('Sending request:', {
                    url: config.url,
                    method: config.method,
                    headers: config.headers,
                    data: config.data
                });
                return config;
            }
        );

        instance.interceptors.response.use(
            (response) => {
                console.log('Received response:', {
                    status: response.status,
                    headers: response.headers,
                    data: response.data
                });

                this.logAIResponse(response);
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

    // 记录 AI 响应内容
    private logAIResponse(response: AxiosResponse): void {
        if (response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log('AI Response Content:', response.data.candidates[0].content.parts[0].text);
        } else if (response.data.choices?.[0]?.message?.content) {
            console.log('AI Response Content:', response.data.choices[0].message.content);
        }
    }

    // 处理 Gemini API 请求
    private async makeGeminiRequest(endpoint: string, data: any): Promise<any> {
        const response = await this.axiosInstance.post(
            `${this.apiUrl}/models/${this.model}:${endpoint}?key=${this.apiKey}`,
            data
        );
        return response.data.candidates[0].content.parts[0].text;
    }

    // 处理 OpenAI API 请求
    private async makeOpenAIRequest(endpoint: string, data: any): Promise<any> {
        const response = await this.axiosInstance.post(
            `${this.apiUrl}/${endpoint}`,
            { ...data, model: this.model },
            {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            }
        );
        return response.data.choices[0].message.content;
    }

    // 处理 JSON 响应
    private handleJsonResponse(response: string): any {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        try {
            const result = JSON.parse(cleanResponse);
            if (!result.detectedLang || !result.sourceLangName || !result.translation) {
                throw new Error('Invalid response format');
            }
            return result;
        } catch (error) {
            throw new Error('Invalid JSON response format');
        }
    }

    // 公共方法：文本生成（翻译）
    async generateText(prompt: string, formatAsJson?: boolean): Promise<string> {
        try {
            let response;
            if (this.isGeminiApi) {
                response = await this.makeGeminiRequest('generateContent', {
                    contents: [{ parts: [{ text: prompt }] }]
                });
            } else {
                response = await this.makeOpenAIRequest('chat/completions', {
                    messages: [{ role: 'user', content: prompt }]
                });
            }

            return formatAsJson ? this.handleJsonResponse(response) : response;
        } catch (error: any) {
            console.error('Generate text error:', error);
            throw new Error(error.response?.data?.error?.message || '生成文本失败，请重试');
        }
    }

    // 公共方法：音频处理
    async processAudio(audioBlob: Blob, prompt: string): Promise<string> {
        try {
            if (!this.isGeminiApi) {
                throw new Error('当前 API 不支持音频处理');
            }

            const base64Audio = await FileUtils.blobToBase64(audioBlob);
            console.log('音频转换为 base64 完成');

            return await this.makeGeminiRequest('generateContent', {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: audioBlob.type || 'audio/mp3',
                                data: base64Audio
                            }
                        }
                    ]
                }]
            });
        } catch (error: any) {
            console.error('Process audio error:', error);
            throw new Error(error.response?.data?.error?.message || '音频处理失败，请重试');
        }
    }

    // 公共方法：图片处理
    async generateImageContent(prompt: string, base64Image: string, mimeType: string): Promise<string> {
        try {
            const response = await this.makeGeminiRequest('generateContent', {
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
            });

            return response;
        } catch (error: any) {
            console.error('Generate image content error:', error);
            throw new Error(error.response?.data?.error?.message || '图片处理失败，请重试');
        }
    }

    // 公共方法：测试连接
    async testConnection(): Promise<boolean> {
        try {
            if (this.isGeminiApi) {
                const response = await this.axiosInstance.get(
                    `${this.apiUrl}/models?key=${this.apiKey}`
                );
                return response.status === 200;
            } else {
                const response = await this.makeOpenAIRequest('chat/completions', {
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 5
                });
                return !!response;
            }
        } catch (error) {
            console.error('Test connection error:', error);
            return false;
        }
    }
} 