const ZHIPU_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";

interface ZhipuMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ZhipuChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ZhipuEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

function getApiKey(): string {
  const key = process.env.ZHIPU_API_KEY;
  if (!key) throw new Error("ZHIPU_API_KEY is not configured");
  return key;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${ZHIPU_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: "embedding-3",
      input: text,
      dimensions: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Zhipu embedding error: ${response.status} ${err}`);
  }

  const data: ZhipuEmbeddingResponse = await response.json();
  return data.data[0].embedding;
}

export async function generateEmbeddingBatch(
  texts: string[]
): Promise<number[][]> {
  const response = await fetch(`${ZHIPU_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: "embedding-3",
      input: texts,
      dimensions: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Zhipu batch embedding error: ${response.status} ${err}`);
  }

  const data: ZhipuEmbeddingResponse = await response.json();
  return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

export async function chatCompletion(
  messages: ZhipuMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await fetch(`${ZHIPU_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: "glm-4-plus",
      messages,
      temperature: options?.temperature ?? 0.4,
      max_tokens: options?.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Zhipu chat error: ${response.status} ${err}`);
  }

  const data: ZhipuChatResponse = await response.json();
  return data.choices[0].message.content;
}

export async function chatCompletionStream(
  messages: ZhipuMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${ZHIPU_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: "glm-4-plus",
      messages,
      temperature: options?.temperature ?? 0.4,
      max_tokens: options?.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Zhipu stream error: ${response.status} ${err}`);
  }

  return response.body!;
}
