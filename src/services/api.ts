import axios from 'axios';
import { store } from '../store';

export const chatService = {
    sendMessage: async (message: string) => {
        const state = store.getState();
        const { apiKey, apiUrl, model } = state.settings;

        try {
            const response = await axios.post(
                `${apiUrl}/chat/completions`,
                {
                    model,
                    messages: [{ role: 'user', content: message }],
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },
}; 