interface Window {
    webkitAudioContext: typeof AudioContext;
}

interface SpeechSynthesisErrorEvent extends Event {
    error: any;
} 