import { useRef, useState, useEffect } from 'react';
import TranscriptView from './TranscriptView';
import AnswerList from './AnswerCard';
import ResumeUploader from './ResumeUploader';
import SettingsModal from './SettingsModal';
import { useApp } from '../contexts/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { useFloatingWindow } from '../hooks/usePictureInPicture';
import { detectQuestion } from '../utils/questionDetector';

const TABS = ['Live', 'Answers', 'Resume'];

export default function FloatingPanel() {
  const { settings, addAnswer } = useApp();
  const [activeTab, setActiveTab] = useState('Live');
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [newAnswerCount, setNewAnswerCount] = useState(0);
  const [lastError, setLastError] = useState('');

  const { generate, cancel } = useAIGeneration();
  const { isOpen: isPipOpen, open: openPiP, close: closePiP } = useFloatingWindow();
  const lastProcessedRef = useRef('');
  const debounceRef = useRef(null);

  const triggerGeneration = async (question) => {
    if (!question?.trim()) return;
    if (isGenerating) cancel();
    setCurrentQuestion(question);
    setStreamingText('');
    setLastError('');
    setIsGenerating(true);
    setActiveTab('Answers');

    await generate(question, {
      onChunk: (token) => setStreamingText(s => s + token),
      onDone: (answer) => {
        addAnswer(question, answer, settings.codeMode);
        setStreamingText('');
        setIsGenerating(false);
        setNewAnswerCount(c => c + 1);
      },
      onError: (err) => {
        setLastError(err);
        setStreamingText('');
        setIsGenerating(false);
      },
    });
  };

  const handleFinalResult = (text) => {
    setTranscript(prev => prev ? `${prev} ${text}` : text);
    setInterimText('');
    if (settings.autoDetect && detectQuestion(text) && text !== lastProcessedRef.current) {
      lastProcessedRef.current = text;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => triggerGeneration(text), 800);
    }
  };

  const handleManualGenerate = () => {
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const question = words.slice(-50).join(' ');
    if (question) triggerGeneration(question);
  };

  const { isListening, isSupported, error, toggleListening } = useSpeechRecognition({
    onResult: handleFinalResult,
    onInterim: setInterimText,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'h') { e.preventDefault(); setIsMinimized(m => !m); }
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleManualGenerate(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [transcript]);

  useEffect(() => {
    if (activeTab === 'Answers') setNewAnswerCount(0);
  }, [activeTab]);

  if (isMinimized) {
    return (
      <div className="panel-minimized" onClick={() => setIsMinimized(false)} title="Click to expand (Ctrl+H)" id="panel-minimized">
        <div className={`mic-dot ${isListening ? 'pulsing' : ''}`} />
        <span>Interview AI</span>
        {newAnswerCount > 0 && <span className="badge">{newAnswerCount}</span>}
      </div>
    );
  }

  return (
    <>
      <div className="floating-panel" id="floating-panel">
        {/* Header */}
        <div className="panel-header">
          <div className="panel-brand">
            <div className={`mic-dot ${isListening ? 'pulsing' : ''}`} />
            <span className="panel-title">Interview AI</span>
            {settings.codeMode && <span className="code-badge">CODE</span>}
          </div>
          <div className="panel-controls">
            {/* Float button — opens a popup window over Meet */}
            <button
              className={`panel-btn pip-toggle-btn ${isPipOpen ? 'pip-active' : ''}`}
              onClick={isPipOpen ? closePiP : openPiP}
              title={isPipOpen ? 'Close floating window' : 'Open floating window (stays on top of Meet)'}
              id="pip-toggle-btn"
            >
              ⧉
            </button>
            <button
              className="panel-btn"
              onClick={() => setShowSettings(true)}
              title="Settings"
              id="open-settings-btn"
            >
              ⚙️
            </button>
            <button
              className="panel-btn"
              onClick={() => setIsMinimized(true)}
              title="Minimize (Ctrl+H)"
              id="minimize-btn"
            >
              —
            </button>
          </div>
        </div>

        {/* Error bar */}
        {lastError && (
          <div className="error-bar">
            <span>⚠️ {lastError}</span>
            <button onClick={() => setLastError('')}>✕</button>
          </div>
        )}

        {/* PiP open hint */}
        {isPipOpen && (
          <div className="pip-hint-bar">
            <span>⧉ Floating window is open — drag it over your Meet call</span>
          </div>
        )}

        {/* Tabs */}
        <div className="panel-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`panel-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`tab-${tab.toLowerCase()}`}
            >
              {tab}
              {tab === 'Answers' && newAnswerCount > 0 && (
                <span className="tab-badge">{newAnswerCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="panel-content">
          {activeTab === 'Live' && (
            <TranscriptView
              transcript={transcript}
              interimText={interimText}
              isListening={isListening}
              streamingText={streamingText}
              currentQuestion={currentQuestion}
              isGenerating={isGenerating}
            />
          )}
          {activeTab === 'Answers' && (
            <>
              {isGenerating && streamingText && (
                <div className="streaming-card">
                  <div className="streaming-label">
                    <span className="generating-dot" />
                    Generating...
                  </div>
                  <p className="streaming-text">{streamingText}</p>
                </div>
              )}
              <AnswerList />
            </>
          )}
          {activeTab === 'Resume' && <ResumeUploader />}
        </div>

        {/* Footer */}
        <div className="panel-footer">
          {!isSupported ? (
            <p className="error-text">⚠️ Use Chrome for speech recognition</p>
          ) : error ? (
            <p className="error-text">⚠️ Mic error: {error}</p>
          ) : (
            <div className="footer-actions">
              <button
                id="mic-toggle-btn"
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
              >
                {isListening ? <><span>🔴</span> Stop</> : <><span>🎙️</span> Listen</>}
              </button>
              <button
                id="manual-generate-btn"
                className="manual-btn"
                onClick={handleManualGenerate}
                disabled={isGenerating || !transcript.trim()}
                title="Generate answer (Ctrl+Enter)"
              >
                ✨ Ask AI
              </button>
            </div>
          )}
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
