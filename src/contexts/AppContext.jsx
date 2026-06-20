import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

const VALID_GEMINI = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
const VALID_OPENAI = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

const DEFAULT_SETTINGS = {
  apiKey: '',
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  language: 'javascript',
  codeMode: false,
  autoDetect: true,
};

function migrateSettings(s) {
  if (!s) return DEFAULT_SETTINGS;
  if (s.provider === 'gemini') {
    if (s.model === 'gemini-1.5-flash') return { ...s, model: 'gemini-1.5-flash-latest' };
    if (s.model === 'gemini-1.5-pro') return { ...s, model: 'gemini-1.5-pro-latest' };
    if (!VALID_GEMINI.includes(s.model)) return { ...s, model: 'gemini-2.0-flash' };
  }
  // Fix invalid OpenAI models
  if (s.provider === 'openai' && !VALID_OPENAI.includes(s.model)) {
    return { ...s, model: 'gpt-4o-mini' };
  }
  return s;
}

export function AppProvider({ children }) {
  const [resumeText, setResumeText] = useState('');
  const [answers, setAnswers] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('parakeet_settings');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
      const migrated = migrateSettings(parsed);
      // Persist migration back to localStorage
      localStorage.setItem('parakeet_settings', JSON.stringify(migrated));
      return migrated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('parakeet_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addAnswer = useCallback((question, answer, isCode = false) => {
    setAnswers(prev => [
      { id: Date.now(), question, answer, isCode, timestamp: new Date() },
      ...prev,
    ]);
  }, []);

  const clearAnswers = useCallback(() => setAnswers([]), []);

  return (
    <AppContext.Provider value={{
      resumeText, setResumeText,
      answers, addAnswer, clearAnswers,
      settings, updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
