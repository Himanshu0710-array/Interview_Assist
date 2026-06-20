import { useEffect, useRef } from 'react';

export default function TranscriptView({
  transcript,
  interimText,
  isListening,
  streamingText,
  currentQuestion,
  isGenerating,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  return (
    <div className="transcript-view">
      {isGenerating && currentQuestion && (
        <div className="question-detected-bar">
          <span className="question-detected-icon">🔍</span>
          <span className="question-detected-text">"{currentQuestion}"</span>
        </div>
      )}

      <div className="transcript-scroll">
        {!transcript && !interimText && (
          <div className="transcript-empty">
            {isListening ? (
              <div className="listening-state">
                <div className="sound-wave">
                  <span /><span /><span /><span /><span />
                </div>
                <p>Listening... speak now</p>
              </div>
            ) : (
              <div className="idle-state">
                <span className="idle-icon">🎙️</span>
                <p>Press <strong>Start Listening</strong> to begin</p>
                <p className="idle-hint">Make sure to allow microphone access</p>
              </div>
            )}
          </div>
        )}

        {transcript && (
          <p className="transcript-final">{transcript}</p>
        )}

        {interimText && (
          <p className="transcript-interim">{interimText}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {transcript && (
        <div className="transcript-footer">
          <span className="word-count">
            {transcript.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      )}
    </div>
  );
}
