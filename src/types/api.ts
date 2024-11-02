export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

export interface ApiConfig {
    apiUrl: string;
    apiKey: string;
    model: string;
} 