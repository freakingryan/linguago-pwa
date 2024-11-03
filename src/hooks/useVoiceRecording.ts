import { useState, useRef, useCallback } from 'react';
import { AudioRecorderService } from '../services/audioRecorder';
import { UnifiedApiService } from '../services/api';
import { Dispatch } from 'redux';
import { startLoading, stopLoading } from '../store/slices/loadingSlice';

interface UseVoiceRecordingProps {
    apiService: UnifiedApiService;
    onResult: (text: string) => void;
    onError: (error: string) => void;
    dispatch: Dispatch;
}

export const useVoiceRecording = ({
    apiService,
    onResult,
    onError,
    dispatch
}: UseVoiceRecordingProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingTimer = useRef<NodeJS.Timeout | null>(null);
    const audioRecorder = useRef(new AudioRecorderService());

    const handleVoiceInput = useCallback(async () => {
        try {
            if (!isRecording) {
                await audioRecorder.current.startRecording();
                setIsRecording(true);
                dispatch(startLoading('recording'));
                setRecordingDuration(0);
                recordingTimer.current = setInterval(() => {
                    setRecordingDuration(prev => prev + 1);
                }, 1000);
            } else {
                setIsRecording(false);
                dispatch(startLoading('processing'));

                if (recordingTimer.current) {
                    clearInterval(recordingTimer.current);
                    recordingTimer.current = null;
                }

                const audioBlob = await audioRecorder.current.stopRecording();
                const text = await apiService.processAudio(audioBlob);
                onResult(text);
            }
        } catch (error) {
            console.error('Voice input error:', error);
            onError(error instanceof Error ? error.message : '录音处理失败');
        } finally {
            dispatch(stopLoading());
        }
    }, [isRecording, apiService, onResult, onError, dispatch]);

    const cleanup = useCallback(() => {
        if (recordingTimer.current) {
            clearInterval(recordingTimer.current);
            recordingTimer.current = null;
        }
        setRecordingDuration(0);
        setIsRecording(false);
        dispatch(stopLoading());
    }, [dispatch]);

    return {
        isRecording,
        recordingDuration,
        handleVoiceInput,
        cleanup
    };
}; 