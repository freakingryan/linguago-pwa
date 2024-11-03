import { useState, useCallback } from 'react';
import { AudioRecorderService } from '../services/audioRecorder';
import { UnifiedApiService } from '../services/api';

interface UseVoiceInputProps {
    apiService: UnifiedApiService;
    onResult: (text: string) => void;
    onError: (error: string) => void;
}

export const useVoiceInput = ({ apiService, onResult, onError }: UseVoiceInputProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recorder] = useState(() => new AudioRecorderService());

    const startRecording = useCallback(async () => {
        try {
            setIsRecording(true);
            await recorder.startRecording();
        } catch (error) {
            console.error('Start recording error:', error);
            onError('无法访问麦克风');
            setIsRecording(false);
        }
    }, [recorder, onError]);

    const stopRecording = useCallback(async () => {
        try {
            const audioBlob = await recorder.stopRecording();
            setIsRecording(false);

            const text = await apiService.processAudio(audioBlob);
            onResult(text);
        } catch (error) {
            console.error('Stop recording error:', error);
            onError('语音识别失败，请重试');
            setIsRecording(false);
        }
    }, [recorder, apiService, onResult, onError]);

    return {
        isRecording,
        startRecording,
        stopRecording
    };
}; 