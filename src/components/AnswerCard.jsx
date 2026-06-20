import { useState } from 'react';
import CodeBlock from './CodeBlock';
import { useApp } from '../contexts/AppContext';

function AnswerCard({ item }) {
  const [copied, setCopied] = useState(false);
  const { settings } = useApp();
  const isCode = item.isCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="answer-card">
      <div className="answer-card-header">
        <div className="answer-question-label">
          <span className="answer-q-icon">Q</span>
          <span className="answer-question-text">{item.question}</span>
        </div>
        <div className="answer-actions">
          <span className="answer-timestamp">
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button className="answer-copy-btn" onClick={handleCopy} title="Copy answer">
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="answer-body">
        {isCode ? (
          <CodeBlock code={item.answer} language={settings.language} />
        ) : (
          <p className="answer-text">{item.answer}</p>
        )}
      </div>
    </div>
  );
}

export default function AnswerList() {
  const { answers, clearAnswers } = useApp();

  if (answers.length === 0) {
    return (
      <div className="answer-empty">
        <div className="answer-empty-icon">💬</div>
        <p>Answers will appear here as questions are detected</p>
      </div>
    );
  }

  return (
    <div className="answer-list">
      <div className="answer-list-header">
        <span className="answer-count">{answers.length} answer{answers.length !== 1 ? 's' : ''}</span>
        <button className="clear-btn" onClick={clearAnswers}>Clear all</button>
      </div>
      {answers.map(item => (
        <AnswerCard key={item.id} item={item} />
      ))}
    </div>
  );
}
