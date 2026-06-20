import { useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

export function useAIGeneration() {
  const { settings, resumeText } = useApp();
  const abortControllerRef = useRef(null);

  const buildSystemPrompt = useCallback((isCode) => {
    const resumePart = resumeText
      ? `\n\nCANDIDATE RESUME/CONTEXT:\n${resumeText}`
      : '';

    if (isCode) {
      return `You are an expert software engineer assisting a candidate in a live technical interview.
When given a coding problem, provide:
1. A brief explanation of the approach
2. Clean, well-commented ${settings.language} code
3. Time and space complexity
Be concise but thorough.${resumePart}`;
    }

    return `You are an expert career coach helping a job candidate answer interview questions in real time.
Generate a confident, concise, and professional answer (2-4 sentences).
Tailor the answer to the candidate's background when possible.
Sound natural and results-oriented.${resumePart}`;
  }, [settings.language, resumeText]);

  const generateOpenAI = useCallback(async (question, isCode, onChunk, onDone) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        stream: true,
        messages: [
          { role: 'system', content: buildSystemPrompt(isCode) },
          { role: 'user', content: question },
        ],
        max_tokens: isCode ? 1000 : 350,
        temperature: isCode ? 0.3 : 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const token = JSON.parse(data)?.choices?.[0]?.delta?.content || '';
          if (token) { fullText += token; onChunk(token); }
        } catch {}
      }
    }
    onDone(fullText);
  }, [settings, buildSystemPrompt]);

  const generateGemini = useCallback(async (question, isCode, onChunk, onDone) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Use v1beta for all Gemini models (most compatible)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:streamGenerateContent?alt=sse&key=${settings.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(isCode) }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: {
          maxOutputTokens: isCode ? 1000 : 350,
          temperature: isCode ? 0.3 : 0.7,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const token = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (token) { fullText += token; onChunk(token); }
        } catch {}
      }
    }
    onDone(fullText);
  }, [settings, buildSystemPrompt]);

  const generate = useCallback(async (question, { onChunk, onDone, onError }) => {
    if (!settings.apiKey) {
      onError('No API key set. Click ⚙️ Settings to add your key.');
      return;
    }
    if (!question?.trim()) {
      onError('No question to answer.');
      return;
    }
    try {
      if (settings.provider === 'openai') {
        await generateOpenAI(question, settings.codeMode, onChunk, onDone);
      } else {
        await generateGemini(question, settings.codeMode, onChunk, onDone);
      }
    } catch (err) {
      if (err.name !== 'AbortError') onError(err.message);
    }
  }, [settings, generateOpenAI, generateGemini]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { generate, cancel };
}
