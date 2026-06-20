import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const OPENAI_MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o (Best)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
];

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash ⚡ (Recommended)' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (Free tier)' },
  { id: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
];

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust', 'sql'];

export default function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [showKey, setShowKey] = useState(false);

  const models = localSettings.provider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS;

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const set = (key, value) => setLocalSettings(prev => ({ ...prev, [key]: value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} id="settings-modal">
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Settings</h2>
          <button className="modal-close-btn" onClick={onClose} id="settings-close-btn">✕</button>
        </div>

        <div className="modal-body">
          {/* Provider */}
          <div className="setting-group">
            <label className="setting-label">AI Provider</label>
            <div className="provider-tabs">
              {['openai', 'gemini'].map(p => (
                <button
                  key={p}
                  className={`provider-tab ${localSettings.provider === p ? 'active' : ''}`}
                  onClick={() => {
                    set('provider', p);
                    set('model', p === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash');
                  }}
                  id={`provider-${p}-btn`}
                >
                  {p === 'openai' ? '🤖 OpenAI' : '♊ Gemini'}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="setting-group">
            <label className="setting-label" htmlFor="api-key-input">
              API Key
              <a
                href={localSettings.provider === 'openai'
                  ? 'https://platform.openai.com/api-keys'
                  : 'https://aistudio.google.com/apikey'}
                target="_blank"
                rel="noreferrer"
                className="get-key-link"
              >
                Get key →
              </a>
            </label>
            <div className="api-key-input-wrapper">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                className="setting-input"
                placeholder={`Enter your ${localSettings.provider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
                value={localSettings.apiKey}
                onChange={e => set('apiKey', e.target.value)}
              />
              <button
                className="show-key-btn"
                onClick={() => setShowKey(s => !s)}
                title={showKey ? 'Hide' : 'Show'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="setting-hint">Stored locally in your browser, never sent to any server.</p>
          </div>

          {/* Model */}
          <div className="setting-group">
            <label className="setting-label" htmlFor="model-select">Model</label>
            <select
              id="model-select"
              className="setting-select"
              value={localSettings.model}
              onChange={e => set('model', e.target.value)}
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Code Mode */}
          <div className="setting-group">
            <div className="setting-row">
              <div>
                <label className="setting-label">💻 Code Mode</label>
                <p className="setting-hint">Optimizes answers for technical / coding interviews</p>
              </div>
              <label className="toggle-switch">
                <input
                  id="code-mode-toggle"
                  type="checkbox"
                  checked={localSettings.codeMode}
                  onChange={e => set('codeMode', e.target.checked)}
                />
                <span className="toggle-thumb" />
              </label>
            </div>
          </div>

          {/* Language */}
          {localSettings.codeMode && (
            <div className="setting-group">
              <label className="setting-label" htmlFor="language-select">Programming Language</label>
              <select
                id="language-select"
                className="setting-select"
                value={localSettings.language}
                onChange={e => set('language', e.target.value)}
              >
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Auto-detect */}
          <div className="setting-group">
            <div className="setting-row">
              <div>
                <label className="setting-label">🔍 Auto-detect questions</label>
                <p className="setting-hint">Automatically generate answers when a question is detected</p>
              </div>
              <label className="toggle-switch">
                <input
                  id="auto-detect-toggle"
                  type="checkbox"
                  checked={localSettings.autoDetect}
                  onChange={e => set('autoDetect', e.target.checked)}
                />
                <span className="toggle-thumb" />
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} id="settings-cancel-btn">Cancel</button>
          <button className="btn-primary" onClick={handleSave} id="settings-save-btn">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
