/**
 * Robust API client for Toonflow / Agnes Video Generator
 * Handles "Failed to fetch", timeouts, retries, and clear error messages.
 */

export type ApiErrorType = 'network' | 'timeout' | 'http' | 'unknown';

export interface ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  isRetryable: boolean;
}

function createApiError(message: string, type: ApiErrorType, status?: number, isRetryable = false): ApiError {
  const err = new Error(message) as ApiError;
  err.type = type;
  err.status = status;
  err.isRetryable = isRetryable;
  err.name = 'ApiError';
  return err;
}

/**
 * Enhanced fetch with timeout + automatic retry for transient network errors.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: {
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number;
    label?: string;
  } = {}
): Promise<Response> {
  const {
    timeoutMs = 45000,
    retries = 2,
    retryDelayMs = 1500,
    label = 'API',
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        // HTTP error (reached server)
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch {}
        const msg = `${label} 回應錯誤 ${response.status}: ${bodyText.slice(0, 200) || response.statusText}`;
        throw createApiError(msg, 'http', response.status, response.status >= 500 || response.status === 429);
      }

      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      // Classify error
      const isAbort = err.name === 'AbortError';
      const isNetwork =
        err instanceof TypeError ||
        (err.message && (
          err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Network request failed') ||
          err.message.includes('fetch')
        ));

      if (isAbort) {
        lastError = createApiError(
          `${label} 請求逾時（超過 ${Math.round(timeoutMs / 1000)} 秒）。後端可能正在處理長時間任務或已當機。`,
          'timeout',
          undefined,
          true
        );
      } else if (isNetwork) {
        lastError = createApiError(
          `${label} 無法連線到後端 (Failed to fetch)。可能原因：\n` +
          `1. 後端 Server 已當機或未啟動\n` +
          `2. Cloud Run / Vercel 冷啟動失敗或 timeout\n` +
          `3. 網絡問題或 CORS\n` +
          `4. Agnes API Key 額度問題導致 server hang`,
          'network',
          undefined,
          true
        );
      } else if (!(err as ApiError).type) {
        // wrap unknown
        lastError = createApiError(err.message || String(err), 'unknown', undefined, false);
      }

      // Retry only on network / timeout / 5xx
      if (attempt < retries && (lastError as ApiError).isRetryable) {
        console.warn(`[apiFetch] ${label} attempt ${attempt + 1} failed, retrying in ${retryDelayMs}ms...`, lastError.message);
        await new Promise(r => setTimeout(r, retryDelayMs * (attempt + 1))); // exponential-ish
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}

/** Convenience helper for JSON APIs */
export async function apiJson<T = any>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options?: Parameters<typeof apiFetch>[2]
): Promise<T> {
  const res = await apiFetch(input, init, options);
  return res.json() as Promise<T>;
}

/** Simple health check helper */
export async function checkServerHealth(): Promise<{ ok: boolean; message: string; details?: any }> {
  try {
    const data = await apiJson('/api/health', {}, { timeoutMs: 8000, retries: 1, label: 'Health' });
    return { ok: true, message: 'Server healthy', details: data };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || 'Health check failed',
      details: { type: err.type }
    };
  }
}
