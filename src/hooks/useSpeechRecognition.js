import { useEffect, useRef, useState, useCallback } from 'react';

export function useSpeechRecognition({ onResult, onInterim }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        if (interimTranscript && onInterim) onInterim(interimTranscript);
        if (finalTranscript && onResult) onResult(finalTranscript.trim());
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') return;
        setError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (shouldRestartRef.current) {
          try { recognition.start(); } catch {}
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    shouldRestartRef.current = true;
    setIsListening(true);
    try { recognitionRef.current?.start(); } catch {}
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, isSupported, error, startListening, stopListening, toggleListening };
}
