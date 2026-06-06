import { Router } from 'express';
import { chatWithLLM } from '../llm.js';

const router = Router();

// POST /api/chat — stream LLM response
router.post('/', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages?.length) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Build conversation history (last 20 messages to avoid token limits)
    const history = messages.slice(-20).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const prompt = systemPrompt || '你是学习导师。用中文回复，直击本质，用 Markdown 格式。';
    const stream = await chatWithLLM(history, prompt);

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.write('data: [DONE]\n\n');
            res.end();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE from OpenAI-compatible stream
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        }
      } catch (err: any) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    };

    pump();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
