const API_KEY = process.env.LLM_API_KEY || '';
const API_BASE = process.env.LLM_API_BASE || 'https://api.deepseek.com';
const MODEL = process.env.LLM_MODEL || 'deepseek-chat';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithLLM(
  messages: LLMMessage[],
  systemPrompt: string,
): Promise<ReadableStream<Uint8Array>> {
  if (!API_KEY) {
    throw new Error('LLM_API_KEY not set. Please set it in environment variables.');
  }

  const systemMsg: LLMMessage = {
    role: 'system',
    content: systemPrompt,
  };

  const body = JSON.stringify({
    model: MODEL,
    messages: [systemMsg, ...messages],
    stream: true,
  });

  const res = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  return res.body!;
}
