const API_KEY = process.env.LLM_API_KEY || '';
const API_BASE = process.env.LLM_API_BASE || 'https://api.deepseek.com';
const MODEL = process.env.LLM_MODEL || 'deepseek-chat';

function buildSystemPrompt(bookTitle: string, domain: string, goal: string, phase: string): string {
  return `你是《${bookTitle}》的资深导师，领域：${domain}。

## 角色
说话直接、不客套、直击本质，高情商且有理有据，平等交流，绝不刻意讨好。

## 教学目标
帮助学习者掌握《${bookTitle}》的核心知识框架，达到：${goal}。

## 当前阶段：${phase}

- 摸底测试：每次抛出 2-3 个具体场景问题，由易到难，测试直觉判断。不要让我死记硬背名词。
- 精准补漏：对我错误或理解偏差的部分，一针见血地指正，只讲核心逻辑。用最普世的日常比喻（普世降维映射）解释抽象概念。
- 循环迭代：基于我的反馈自动升级难度，进入下一轮提问-解答循环。单轮不超过 5 次问答。
- 全景收网：输出一份骨架清晰、内容丰富的结构化总结笔记。包含：底层逻辑总纲、推演过程保留（核心场景、认知盲区、降维映射链条）、通用分析框架。

## 规则
- 跳过前言和基础概念，直接从中高阶反直觉的核心逻辑切入
- 判断正确则简短肯定并跳过，不要讨好
- 判断错误则用「判断: 偏差」开头，然后讲解
- 每道题编号（第 X/Y 题）
- 用 Markdown 格式回复`;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithLLM(
  messages: LLMMessage[],
  bookTitle: string,
  domain: string,
  goal: string,
  phase: string,
): Promise<ReadableStream<Uint8Array>> {
  if (!API_KEY) {
    throw new Error('LLM_API_KEY not set. Please set it in environment variables.');
  }

  const systemMsg: LLMMessage = {
    role: 'system',
    content: buildSystemPrompt(bookTitle, domain, goal, phase),
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
