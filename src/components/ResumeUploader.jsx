import { useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { extractTextFromPDF } from '../utils/pdfParser';

export default function ResumeUploader() {
  const { resumeText, setResumeText } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' | 'text'
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
      setIsLoading(true);
      try {
        const text = await extractTextFromPDF(file);
        setResumeText(text);
        setFileName(file.name);
      } catch (err) {
        alert('Failed to parse PDF: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    } else if (file.type === 'text/plain') {
      const text = await file.text();
      setResumeText(text);
      setFileName(file.name);
    } else {
      alert('Please upload a PDF or .txt file');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  return (
    <div className="resume-section">
      <div className="resume-mode-tabs">
        <button
          className={`mode-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          📎 Upload File
        </button>
        <button
          className={`mode-tab ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          ✏️ Paste Text
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
            id="resume-file-input"
          />
          {isLoading ? (
            <div className="drop-zone-content">
              <div className="spinner" />
              <p>Parsing PDF...</p>
            </div>
          ) : fileName ? (
            <div className="drop-zone-content">
              <span className="file-icon">📄</span>
              <p className="file-name">{fileName}</p>
              <span className="file-loaded">Loaded ✓</span>
              <button
                className="file-clear-btn"
                onClick={(e) => { e.stopPropagation(); setResumeText(''); setFileName(''); }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="drop-zone-content">
              <span className="upload-icon">⬆️</span>
              <p>Drop your resume here</p>
              <span className="drop-hint">PDF or TXT · Click or drag</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-input-area">
          <textarea
            className="resume-textarea"
            placeholder="Paste your resume text, job description, or any context you want the AI to know about..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            id="resume-text-area"
          />
          <div className="textarea-footer">
            <span className="char-count">{resumeText.length} chars</span>
            {resumeText && (
              <button className="file-clear-btn" onClick={() => setResumeText('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {resumeText && mode === 'upload' && (
        <div className="resume-preview">
          <span className="preview-label">Context loaded</span>
          <span className="preview-chars">{resumeText.length} chars</span>
        </div>
      )}
    </div>
  );
}
