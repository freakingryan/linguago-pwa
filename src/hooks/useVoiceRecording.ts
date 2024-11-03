import { useState, useRef, useCallback } from 'react';
import { AudioRecorderService } from '../services/audioRecorder';
import { UnifiedApiService } from '../services/api';

interface UseVoiceRecordingProps {
    apiService: UnifiedApiService;
    onResult: (text: string) => void;
    onError: (error: string) => void;
}

export const useVoiceRecording = ({ apiService, onResult, onError }: UseVoiceRecordingProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingTimer = useRef<NodeJS.Timeout | null>(null);
    const audioRecorder = useRef(new AudioRecorderService());

    const handleVoiceInput = useCallback(async () => {
        if (isProcessing) return;

        try {
            if (!isRecording) {
                await audioRecorder.current.startRecording();
                setIsRecording(true);

                // 开始计时
                setRecordingDuration(0);
                recordingTimer.current = setInterval(() => {
                    setRecordingDuration(prev => prev + 1);
                }, 1000);
            } else {
                setIsRecording(false);
                setIsProcessing(true);

                // 停止计时
                if (recordingTimer.current) {
                    clearInterval(recordingTimer.current);
                    recordingTimer.current = null;
                }

                const audioBlob = await audioRecorder.current.stopRecording();
                const text = await apiService.processAudio(audioBlob);
                onResult(text);
                setRecordingDuration(0);
            }
        } catch (error) {
            console.error('Voice input error:', error);
            onError(error instanceof Error ? error.message : '录音处理失败');
        } finally {
            setIsProcessing(false);
        }
    }, [isRecording, isProcessing, apiService, onResult, onError]);

    // 清理函数
    const cleanup = useCallback(() => {
        if (recordingTimer.current) {
            clearInterval(recordingTimer.current);
            recordingTimer.current = null;
        }
        setRecordingDuration(0);
        setIsRecording(false);
        setIsProcessing(false);
    }, []);

    return {
        isRecording,
        isProcessing,
        recordingDuration,
        handleVoiceInput,
        cleanup
    };
}; 