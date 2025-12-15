import { useState, useCallback, useRef, useEffect } from 'react';

interface UseBrowserTTSReturn {
  speak: (text: string, language: 'english' | 'hindi' | 'maithili') => void;
  stop: () => void;
  isSpeaking: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const languageMap: Record<string, string> = {
  english: 'en-US',
  hindi: 'hi-IN',
  maithili: 'hi-IN', // Fallback to Hindi for Maithili
};

export const useBrowserTTS = (): UseBrowserTTSReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, language: 'english' | 'hindi' | 'maithili') => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    if (isMuted) {
      console.log('Audio is muted');
      return;
    }

    // Cancel any ongoing speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageMap[language] || 'en-US';
    utterance.volume = volume;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) => voice.lang.startsWith(utterance.lang.split('-')[0]) && voice.localService
    ) || voices.find(
      (voice) => voice.lang.startsWith(utterance.lang.split('-')[0])
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [volume, isMuted, stop]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis?.getVoices();
    };
    
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  };
};
