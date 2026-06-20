import { useRef, useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import { useApp } from '../contexts/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { detectQuestion } from '../utils/questionDetector';

/** Renders AI answer text with bullet points, numbered lists, inline code */
function FormattedAnswer({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="pk-answer-body">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <br key={i} />;
        const isBullet = /^[•\-\*]\s/.test(t);
        const isNum = /^\d+[\.\)]\s/.test(t);
        if (isBullet) {
          return (
            <div key={i} className="pk-bullet">
              <span className="pk-bullet-dot">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(t.replace(/^[•\-\*]\s*/, '')) }} />
            </div>
          );
        }
        if (isNum) {
          const num = t.match(/^(\d+)/)[1];
          return (
            <div key={i} className="pk-bullet">
              <span className="pk-bullet-num">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(t.replace(/^\d+[\.\)]\s*/, '')) }} />
            </div>
          );
        }
        // Bold headers like "Answer:" or "**text**"
        if (t.endsWith(':') && t.length < 40) {
          return <div key={i} className="pk-section-label">{t}</div>;
        }
        return <p key={i} className="pk-para" dangerouslySetInnerHTML={{ __html: formatInline(t) }} />;
      })}
    </div>
  );
}

function formatInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="pk-code">$1</code>');
}

export default function PopupFloatingPanel() {
  const { settings, answers, addAnswer, clearAnswers } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [lastError, setLastError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [sessionStart] = useState(Date.now());
  const [sessionTime, setSessionTime] = useState('00:00');

  // Session timer
  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - sessionStart) / 1000);
      setSessionTime(`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(id);
  }, [sessionStart]);

  const { generate, cancel } = useAIGeneration();
  const lastProcessedRef = useRef('');
  const debounceRef = useRef(null);
  const answerRef = useRef(null);

  const triggerGeneration = async (question) => {
    if (!question?.trim()) return;
    if (isGenerating) cancel();
    setCurrentQuestion(question);
    setCurrentAnswer('');
    setStreamingText('');
    setLastError('');
    setIsGenerating(true);
    setIsHidden(false);
    setActiveTab('ai');

    await generate(question, {
      onChunk: (token) => setStreamingText(s => s + token),
      onDone: (answer) => {
        addAnswer(question, answer, settings.codeMode);
        setCurrentAnswer(answer);
        setStreamingText('');
        setIsGenerating(false);
      },
      onError: (err) => {
        // Make quota error friendlier
        const msg = err.includes('quota') || err.includes('RESOURCE_EXHAUSTED')
          ? 'Free tier quota exceeded. Open ⚙️ Settings → switch to gemini-2.0-flash or add a paid key.'
          : err;
        setLastError(msg);
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

  const handleManualSubmit = () => {
    const q = manualInput.trim();
    if (q) { triggerGeneration(q); setManualInput(''); }
  };

  const handleClear = () => {
    setCurrentAnswer('');
    setCurrentQuestion('');
    setStreamingText('');
    setTranscript('');
    setLastError('');
    lastProcessedRef.current = '';
  };

  const { isListening, isSupported, error: micError, toggleListening } = useSpeechRecognition({
    onResult: handleFinalResult,
    onInterim: setInterimText,
  });

  // Display: current streaming/latest answer
  const displayQuestion = currentQuestion || answers[0]?.question || '';
  const displayAnswer = isGenerating ? streamingText : (currentAnswer || answers[0]?.answer || '');

  // Keyboard: Ctrl+H to toggle hide
  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey && e.key === 'h') { e.preventDefault(); setIsHidden(v => !v); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Handle hiding and window resizing for both browser and Electron
  useEffect(() => {
    try {
      if (isHidden) {
        window.resizeTo(220, 80);
      } else {
        window.resizeTo(395, 630);
      }
    } catch (e) {
      // Ignore if browser blocks resize
    }
  }, [isHidden]);

  // Minimized / hidden bar
  if (isHidden) {
    return (
      <div className="pk-hidden-bar" onClick={() => setIsHidden(false)} title="Click or Ctrl+H to show">
        <div className={`mic-dot ${isListening ? 'pulsing' : ''}`} />
        <span>Interview AI</span>
        {isGenerating && <span className="pk-gen-dot" />}
      </div>
    );
  }

  return (
    <div className="pk-panel" id="pk-panel">
      {/* ── Header ── */}
      <div className="pk-header">
        <div className="pk-header-left">
          <div className={`mic-dot ${isListening ? 'pulsing' : ''}`} />
          <span className="pk-brand">Interview AI</span>
        </div>
        <div className="pk-header-right">
          <span className="pk-timer">⏱ {sessionTime}</span>
          <button className="pk-hide-btn" onClick={() => setIsHidden(true)} id="pk-hide-btn">Hide</button>
          <button className="pk-icon-btn" onClick={() => setShowSettings(true)} id="pk-settings-btn">⚙️</button>
        </div>
      </div>

      {/* ── Screen-share notice ── */}
      <div className="pk-notice">
        🫥 Invisible when you share the <strong>Meet tab</strong> only — not full screen
      </div>

      {/* ── Tab pills ── */}
      <div className="pk-tabs">
        <button
          className={`pk-pill ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          id="pktab-ai"
        >
          🤖 AI Answer
        </button>
        <button
          className={`pk-pill ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
          id="pktab-manual"
        >
          📝 Manual
        </button>
      </div>

      {/* ── Error banner ── */}
      {(lastError || micError) && (
        <div className="pk-error">
          <span>⚠️ {lastError || micError}</span>
          <button onClick={() => setLastError('')}>✕</button>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="pk-content" ref={answerRef}>
        {activeTab === 'ai' ? (
          <>
            {displayQuestion ? (
              <div className="pk-question-block">
                <div className="pk-q-label">Summarized question:</div>
                <div className="pk-q-text">{displayQuestion}</div>
              </div>
            ) : null}

            {displayAnswer ? (
              <div className="pk-answer-block">
                <div className="pk-a-label">
                  {isGenerating ? (
                    <><span className="pk-gen-dot" /> Generating answer...</>
                  ) : 'Answer:'}
                </div>
                <FormattedAnswer text={displayAnswer} />
              </div>
            ) : (
              <div className="pk-empty">
                {isListening ? (
                  <div className="pk-listening-state">
                    <div className="sound-wave">
                      <span /><span /><span /><span /><span />
                    </div>
                    <p>Listening for questions...</p>
                    {interimText && <p className="pk-interim">"{interimText}"</p>}
                  </div>
                ) : (
                  <div className="pk-idle-state">
                    <span className="pk-idle-icon">🎙️</span>
                    <p>Press <strong>Start</strong> to begin</p>
                    <p className="pk-idle-hint">AI auto-detects interview questions</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="pk-manual-tab">
            <p className="pk-manual-hint">Type a question to get an AI-crafted answer:</p>
            <textarea
              id="pk-manual-input"
              className="pk-manual-textarea"
              placeholder="e.g. Tell me about yourself..."
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleManualSubmit(); } }}
              rows={3}
            />
            <button
              id="pk-manual-submit"
              className="pk-manual-submit-btn"
              onClick={handleManualSubmit}
              disabled={isGenerating || !manualInput.trim()}
            >
              ✨ Get Answer
            </button>
            {displayAnswer && (
              <div className="pk-answer-block" style={{ marginTop: '0.75rem' }}>
                <div className="pk-a-label">Answer:</div>
                <FormattedAnswer text={displayAnswer} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="pk-footer">
        <button
          id="pk-start-btn"
          className={`pk-start-btn ${isListening ? 'active' : ''}`}
          onClick={toggleListening}
          disabled={!isSupported}
        >
          {isListening
            ? <><span className="pk-rec-dot" /> Stop</>
            : <><span>🎙️</span> Start</>}
        </button>
        <input
          id="pk-inline-input"
          className="pk-inline-input"
          placeholder="Type a manual message..."
          value={activeTab === 'manual' ? manualInput : manualInput}
          onChange={e => setManualInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleManualSubmit(); }}
        />
        <button id="pk-clear-btn" className="pk-clear-btn" onClick={handleClear}>
          Clear
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
