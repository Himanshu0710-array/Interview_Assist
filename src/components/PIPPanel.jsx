import { useApp } from '../contexts/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

/**
 * PIPPanel — renders inside the floating Picture-in-Picture window.
 * Receives shared state via props (lifted from FloatingPanel).
 */
export default function PIPPanel({
  transcript,
  interimText,
  isListening,
  toggleListening,
  streamingText,
  isGenerating,
  currentQuestion,
  onManualGenerate,
  onAskCustom,
}) {
  const { answers, settings } = useApp();
  const latestAnswer = answers[0];

  return (
    <div className="pip-panel">
      {/* Header */}
      <div className="pip-header">
        <div className="panel-brand">
          <div className={`mic-dot ${isListening ? 'pulsing' : ''}`} />
          <span className="panel-title">Interview AI</span>
          {settings.codeMode && <span className="code-badge">CODE</span>}
        </div>
        <div className="pip-status">
          {isGenerating ? (
            <span className="pip-generating">✨ Generating...</span>
          ) : (
            <span className="pip-ready">Ready</span>
          )}
        </div>
      </div>

      {/* Current question */}
      {isGenerating && currentQuestion && (
        <div className="question-detected-bar">
          <span className="question-detected-icon">🔍</span>
          <span className="question-detected-text">"{currentQuestion}"</span>
        </div>
      )}

      {/* Answer area */}
      <div className="pip-answer-area">
        {isGenerating && streamingText ? (
          <div className="pip-streaming">
            <div className="streaming-label">
              <span className="generating-dot" />
              Answering...
            </div>
            <p className="streaming-text">{streamingText}</p>
          </div>
        ) : latestAnswer ? (
          <div className="pip-latest-answer">
            <div className="pip-answer-q">
              <span className="answer-q-icon">Q</span>
              <span className="answer-question-text">{latestAnswer.question}</span>
            </div>
            <p className="pip-answer-text">{latestAnswer.answer}</p>
          </div>
        ) : (
          <div className="pip-empty">
            <span>🎙️</span>
            <p>Answers appear here automatically</p>
          </div>
        )}
      </div>

      {/* Live transcript preview */}
      {(transcript || interimText) && (
        <div className="pip-transcript">
          <span className="pip-transcript-text">
            {transcript ? transcript.split(' ').slice(-12).join(' ') : ''}
            {interimText && <em className="transcript-interim"> {interimText}</em>}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="pip-controls">
        <button
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          id="pip-mic-btn"
        >
          {isListening ? '🔴 Stop' : '🎙️ Listen'}
        </button>
        <button
          className="manual-btn"
          onClick={onManualGenerate}
          disabled={isGenerating || !transcript}
          id="pip-ask-btn"
        >
          ✨ Ask AI
        </button>
      </div>
    </div>
  );
}
