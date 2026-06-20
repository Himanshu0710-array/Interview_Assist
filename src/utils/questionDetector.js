const QUESTION_PATTERNS = [
  /\?$/,
  /^(tell me|can you|could you|would you|describe|explain|what|why|how|when|where|who|which|walk me through|give me|share|talk about|have you|do you|are you|what's your|what is your|what are your)/i,
  /(your experience|your background|your approach|your process|your opinion|your thoughts|yourself|your greatest|your weakness|your strength|your goal|your achievement)/i,
  /(have you ever|have you worked|have you used|have you built|have you dealt)/i,
  /(implement|solve|write|code|design|create|build a|find|reverse|sort|traverse)/i,
];

const FILLER_WORDS = ['um', 'uh', 'hmm', 'okay', 'so', 'yeah', 'right', 'alright'];

export function detectQuestion(text) {
  if (!text || text.trim().length < 10) return false;
  const trimmed = text.trim().toLowerCase();

  // Filter out very short filler-word-only phrases
  const words = trimmed.split(/\s+/).filter(w => !FILLER_WORDS.includes(w));
  if (words.length < 3) return false;

  return QUESTION_PATTERNS.some(pattern => pattern.test(trimmed));
}

export function extractQuestion(text) {
  // Clean up transcript and return the best question candidate
  const sentences = text.split(/[.!]/);
  for (const sentence of sentences.reverse()) {
    if (detectQuestion(sentence.trim())) return sentence.trim();
  }
  return text.trim();
}
