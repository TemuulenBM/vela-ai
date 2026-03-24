const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";
const MAX_BATCH_SIZE = 128;

function getApiKey(): string {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error("VOYAGE_API_KEY environment variable is not set");
  return key;
}

interface VoyageResponse {
  data: Array<{ embedding: number[] }>;
  usage: { total_tokens: number };
}

async function callVoyageAPI(texts: string[]): Promise<number[][]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(VOYAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model: VOYAGE_MODEL,
          input: texts,
          input_type: "document",
        }),
      });

      if (!response.ok) {
        throw new Error(`Voyage API error: ${response.status}`);
      }

      const result: VoyageResponse = await response.json();
      return result.data.map((d) => d.embedding);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError!;
}

/**
 * Generate embedding for a single text string.
 * Returns a 1024-dimensional vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const results = await callVoyageAPI([text]);
  return results[0];
}

/**
 * Generate embeddings for multiple texts in batch.
 * Automatically chunks into batches of 128 (Voyage API limit).
 * Returns arrays in the same order as input texts.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE);
    const embeddings = await callVoyageAPI(batch);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}
