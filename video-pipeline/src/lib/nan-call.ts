// Wrapper for local Ollama calls — simplified from the original NaN cluster
// version. No concurrency semaphore needed (Ollama handles its own queue).
// Retry with exponential backoff is kept for robustness.

interface NanCallOptions {
  maxRetries?: number;
  bucket?: string;
  rpm?: number;
}

export function createNanCall<T>(
  fn: () => Promise<T>,
  _options: NanCallOptions = {},
): () => Promise<T> {
  const maxRetries = _options.maxRetries ?? 3;

  return async function call(): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    throw lastErr;
  };
}

export function _resetNanCallState(): void {}
