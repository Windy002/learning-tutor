interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMOptions {
  apiKey: string;
  apiBase: string;
  model: string;
}

export async function chatWithLLM(
  messages: LLMMessage[],
  systemPrompt: string,
  options: LLMOptions,
): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, apiBase, model } = options;

  const systemMsg: LLMMessage = {
    role: 'system',
    content: systemPrompt,
  };

  const url = apiBase.endsWith('/v1')
    ? `${apiBase}/chat/completions`
    : `${apiBase}/v1/chat/completions`;

  const body = JSON.stringify({
    model,
    messages: [systemMsg, ...messages],
    stream: true,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 错误 ${res.status}: ${err.slice(0, 300)}`);
  }

  return res.body!;
}
